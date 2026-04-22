import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Clock, Shield, Bell, MapPin, Save, RefreshCw, X, Search, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as adminAPI from '../../services/adminAPI';
import * as authAPI from '../../services/authAPI';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('Office Configuration');
  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:30");
  const [loading, setLoading] = useState(false);
  const [activeOfficeId, setActiveOfficeId] = useState(null);
  const [history, setHistory] = useState([]);
  const [notifSettings, setNotifSettings] = useState({
    low_balance_priority: 'HIGH',
    ride_updates_priority: 'MEDIUM',
    system_alerts_priority: 'LOW',
    enable_emails: true
  });

  // Location States
  const [showMapModal, setShowMapModal] = useState(false);
  const [officeAddress, setOfficeAddress] = useState({
    address_line: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [officeLocation, setOfficeLocation] = useState([28.6139, 77.2090]); // Default New Delhi
  const [tempCoords, setTempCoords] = useState(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const DAYS_MAP = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
  const REVERSE_DAYS_MAP = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0 };

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    try {
      setLoading(true);
      let id = localStorage.getItem('officeId');
      
      if (!id || id === '[object Object]') {
        const profile = await authAPI.getUserProfile();
        id = typeof profile.office_id === 'object' ? profile.office_id._id : profile.office_id;
        localStorage.setItem('officeId', id);
      }
      
      setActiveOfficeId(id);
      await loadOfficeData(id);
      await fetchNotificationHistory(id);
    } catch (error) {
      console.error("Settings initialization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOfficeData = async (oid) => {
    try {
      const officeData = await adminAPI.getOfficeDetails(oid);
      if (officeData) {
        if (officeData.shift_start) setStartTime(officeData.shift_start);
        if (officeData.shift_end) setEndTime(officeData.shift_end);
        if (officeData.working_days && Array.isArray(officeData.working_days)) {
           const validDays = officeData.working_days
              .filter(d => d != null)
              .map(d => DAYS_MAP[d])
              .filter(Boolean);
           setWorkingDays(validDays);
        }
        if (officeData.notification_settings) {
          setNotifSettings(officeData.notification_settings);
        }
        if (officeData.address) {
          setOfficeAddress(officeData.address);
        }
        if (officeData.office_location?.coordinates?.length === 2) {
          // MongoDB stores [lng, lat], Leaflet needs [lat, lng]
          setOfficeLocation([officeData.office_location.coordinates[1], officeData.office_location.coordinates[0]]);
        }
      }
    } catch (error) {
      console.error("Office data load failed:", error);
    }
  };

  const fetchNotificationHistory = async (oid) => {
    try {
      const data = await adminAPI.getNotificationHistory(oid);
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch notification history:", error);
    }
  };

  const handleSave = async () => {
    if (!activeOfficeId) {
      if (typeof window.showNotification === 'function') {
        window.showNotification("No office ID found. Please refresh.", "error");
      }
      return;
    }

    try {
      setLoading(true);
      
      if (activeSection === 'Office Configuration') {
        // Validate required fields for the backend schema
        if (!officeAddress.address_line || !officeAddress.city) {
          if (typeof window.showNotification === 'function') {
            window.showNotification("Address line and City are required.", "error");
          } else {
            alert("Address line and City are required.");
          }
          setLoading(false);
          return;
        }

        // Map day names to numbers (0=Sun, 1=Mon, etc.)
        const numericDays = workingDays
           .map(d => REVERSE_DAYS_MAP[d])
           .filter(d => d !== undefined)
           .sort((a, b) => a - b);
            
        const payload = {
           shift_start: startTime,
           shift_end: endTime,
           working_days: numericDays,
           address: officeAddress,
           office_location: {
             type: 'Point',
             coordinates: [officeLocation[1], officeLocation[0]] // [lng, lat] for GeoJSON
           }
        };

        await adminAPI.updateOfficeSettings(activeOfficeId, payload);
        
        // Re-load data from server to verify save
        await loadOfficeData(activeOfficeId);
      } else if (activeSection === 'Notifications') {
        await adminAPI.updateNotificationSettings(activeOfficeId, notifSettings);
      }
      
      if (typeof window.showNotification === 'function') {
        window.showNotification("Settings saved successfully!", "success");
      } else {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      if (typeof window.showNotification === 'function') {
        window.showNotification(error.message || "Failed to save settings.", "error");
      } else {
        alert("Failed to save settings.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper component for map movement
  const MapMovementHandler = ({ setCoords, onMoveEnd }) => {
    const map = useMapEvents({
      move() {
        const center = map.getCenter();
        setCoords([center.lat, center.lng]);
      },
      moveend() {
        const center = map.getCenter();
        onMoveEnd([center.lat, center.lng]);
      }
    });
    return null;
  };

  const handleReverseGeocode = async (coords) => {
    if (!coords) return;
    setIsReverseGeocoding(true);
    
    // Update the main office location state immediately on moveend
    setOfficeLocation(coords);

    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
      const data = await resp.json();
      if (data.address) {
        setOfficeAddress({
          address_line: data.display_name.split(',').slice(0, 2).join(', '),
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          pincode: data.address.postcode || ''
        });
      }
    } catch (error) {
       console.error("Geocoding failed:", error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleConfirmLocation = () => {
    // This is now handled automatically by handleReverseGeocode
    setShowMapModal(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">{activeSection}</h1>
          <p className="text-dash-muted mt-1 font-medium">Manage your office preferences and rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-dash-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
           {[
             { name: 'Office Configuration', icon: Clock, desc: 'Timings, shifts and slots' },
            //  { name: 'Security & Auth', icon: Shield, desc: 'Two-factor, employee verification' },
             { name: 'Notifications', icon: Bell, desc: 'Priority, frequency and history' },
            //  { name: 'Geofencing', icon: MapPin, desc: 'Pickup boundaries, restricted zones' },
           ].map((item, i) => (
             <button 
               key={i} 
               onClick={() => setActiveSection(item.name)}
               className={`w-full text-left p-6 rounded-[2rem] border transition-all flex items-start gap-4 ${
                 activeSection === item.name 
                 ? 'bg-white border-dash-blue shadow-sm ring-1 ring-dash-blue/5' 
                 : 'bg-transparent border-transparent hover:bg-white hover:border-dash-border'
               }`}
             >
                <div className={`p-3 rounded-xl ${activeSection === item.name ? 'bg-dash-blue text-white' : 'bg-dash-bg text-dash-muted'}`}>
                   <item.icon size={20} />
                </div>
                <div>
                   <h4 className={`text-sm font-bold ${activeSection === item.name ? 'text-dash-text' : 'text-dash-muted'}`}>{item.name}</h4>
                   <p className="text-[11px] font-medium text-dash-muted mt-1">{item.desc}</p>
                </div>
             </button>
           ))}
        </div>

        {/* Dynamic Section Content */}
        <div className="lg:col-span-2 space-y-8">
           {activeSection === 'Office Configuration' && (
             <>
               <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
                  <h3 className="text-xl font-bold text-dash-text mb-8 flex items-center gap-2">
                     Timings & Shifts
                     <span className="text-xs font-bold text-dash-blue bg-blue-50 px-2 py-0.5 rounded-full">Primary</span>
                  </h3>

                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                           <label className="text-xs font-bold text-dash-muted uppercase tracking-wider ml-1">Office Start Time</label>
                           <div className="relative">
                              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-muted" size={18} />
                              <input 
                                type="time" 
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-dash-bg border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-dash-blue/10 outline-none" 
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-dash-muted uppercase tracking-wider ml-1">Office End Time</label>
                           <div className="relative">
                              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-muted" size={18} />
                              <input 
                                type="time" 
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-dash-bg border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-dash-blue/10 outline-none" 
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-xs font-bold text-dash-muted uppercase tracking-wider ml-1 block">Working Days</label>
                        <div className="flex flex-wrap gap-3">
                           {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                              const isWorkingDay = workingDays.includes(day);
                              return (
                                 <button 
                                    key={day} 
                                    onClick={() => {
                                       if (isWorkingDay) {
                                          setWorkingDays(workingDays.filter(d => d !== day));
                                       } else {
                                          setWorkingDays([...workingDays, day]);
                                       }
                                    }}
                                    className={`flex-1 min-w-[3.5rem] h-14 rounded-2xl font-bold flex items-center justify-center transition-all ${
                                       isWorkingDay 
                                       ? 'bg-dash-blue text-white shadow-md shadow-dash-blue/20' 
                                       : 'bg-dash-bg text-dash-muted border border-transparent hover:border-dash-border hover:bg-white'
                                    }`}
                                 >
                                    {day}
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-dash-text">Office Location</h3>
                    <button 
                      onClick={() => {
                        setTempCoords(officeLocation);
                        setShowMapModal(true);
                      }}
                      className="px-4 py-2 bg-dash-blue/10 text-dash-blue rounded-xl text-xs font-bold hover:bg-dash-blue hover:text-white transition-all flex items-center gap-2"
                    >
                      <MapPin size={14} />
                      Change Location
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-dash-bg rounded-2xl border border-dashed border-dash-border group hover:border-dash-blue transition-all cursor-default">
                      <div className="flex gap-4">
                        <div className="p-4 bg-white rounded-xl h-fit shadow-sm text-dash-blue">
                          <Navigation size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-dash-muted uppercase tracking-widest mb-1">Registered Address</p>
                          <h4 className="text-sm font-bold text-dash-text mb-1">{officeAddress.address_line || "No address set"}</h4>
                          <p className="text-xs text-dash-muted font-medium">
                            {officeAddress.city}, {officeAddress.state} {officeAddress.pincode}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-md border border-dash-border text-dash-muted">
                              Lat: {officeLocation[0].toFixed(4)}
                            </span>
                            <span className="text-[10px] font-bold bg-white px-2 py-1 rounded-md border border-dash-border text-dash-muted">
                              Lng: {officeLocation[1].toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Map Modal */}
            {showMapModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h2 className="text-2xl font-bold text-dash-text">Select Office Location</h2>
                      <p className="text-xs text-dash-muted font-medium mt-0.5">Click on the map to set your office coordinates.</p>
                    </div>
                    <button 
                      onClick={() => setShowMapModal(false)}
                      className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="relative h-[500px]">
                    <MapContainer center={officeLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapMovementHandler setCoords={setTempCoords} onMoveEnd={handleReverseGeocode} />
                    </MapContainer>
                    
                    {/* Fixed Center Pin */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
                      <div className="flex flex-col items-center -translate-y-1/2">
                        <div className="bg-dash-blue p-2 rounded-xl shadow-2xl border-2 border-white animate-bounce-subtle">
                          <MapPin size={24} className="text-white" />
                        </div>
                        <div className="w-1.5 h-1.5 bg-black/20 rounded-full blur-[1px] mt-1" />
                      </div>
                    </div>
                    
                    {/* Floating Info Overlay */}
                    <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-3 rounded-2xl shadow-xl border border-white max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-dash-blue/10 rounded-xl text-dash-blue">
                          <Navigation size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-dash-muted uppercase">Selected Lat/Lng</p>
                          <p className="text-xs font-extrabold text-dash-text">
                            {tempCoords ? `${tempCoords[0].toFixed(5)}, ${tempCoords[1].toFixed(5)}` : "Select a point..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                      <div className="relative">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 ${isReverseGeocoding ? 'text-dash-blue' : 'text-dash-muted'}`}>
                          {isReverseGeocoding ? (
                            <div className="w-4 h-4 border-2 border-dash-blue border-t-transparent rounded-full animate-spin" />
                          ) : <Navigation size={18} />}
                        </div>
                        <input 
                          type="text" 
                          placeholder={isReverseGeocoding ? "Fetching address..." : "Address Line (Building, Floor, Street)"}
                          value={officeAddress.address_line}
                          onChange={(e) => setOfficeAddress({...officeAddress, address_line: e.target.value})}
                          className="w-full pl-12 pr-5 py-3.5 bg-white border border-dash-border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-dash-blue/10 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                      <input 
                        type="text" 
                        placeholder="City"
                        value={officeAddress.city}
                        onChange={(e) => setOfficeAddress({...officeAddress, city: e.target.value})}
                        className="px-5 py-3.5 bg-white border border-dash-border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-dash-blue/10 outline-none"
                      />
                      <button
                        onClick={() => setShowMapModal(false)}
                        className="px-8 py-3.5 bg-dash-blue text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
             </>
           )}

           {activeSection === 'Notifications' && (
             <div className="space-y-8">
               <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
                  <h3 className="text-xl font-bold text-dash-text mb-8">Alert Preferences</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-dash-border">
                      <div>
                        <h4 className="text-sm font-bold text-dash-text">Enable Email Notifications</h4>
                        <p className="text-xs text-dash-muted mt-1 font-medium">Receive all alerts via your registered office emails.</p>
                      </div>
                      <button 
                        onClick={() => setNotifSettings({...notifSettings, enable_emails: !notifSettings.enable_emails})}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${notifSettings.enable_emails ? 'bg-dash-blue' : 'bg-dash-border'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${notifSettings.enable_emails ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {[
                      { key: 'low_balance_priority', label: 'Wallet Low Balance', desc: 'Alert when office balance drops below ₹2,000' },
                      { key: 'ride_updates_priority', label: 'Ride Updates', desc: 'Driver arrivals, boarding confirmations' },
                      { key: 'system_alerts_priority', label: 'System Alerts', desc: 'Maintenance, policy updates' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-4 border-b border-dash-border last:border-0">
                        <div className="max-w-[60%]">
                          <h4 className="text-sm font-bold text-dash-text">{item.label}</h4>
                          <p className="text-xs text-dash-muted mt-1 font-medium">{item.desc}</p>
                        </div>
                        <select 
                          value={notifSettings[item.key]}
                          onChange={(e) => setNotifSettings({...notifSettings, [item.key]: e.target.value})}
                          className="bg-dash-bg border-none rounded-xl px-4 py-2 text-xs font-bold text-dash-text focus:ring-2 focus:ring-dash-blue/10 outline-none"
                        >
                          <option value="LOW">Low Priority</option>
                          <option value="MEDIUM">Medium Priority</option>
                          <option value="HIGH">High Priority</option>
                        </select>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
                  <h3 className="text-xl font-bold text-dash-text mb-8">Notification History</h3>
                  <div className="space-y-4">
                    {history.length > 0 ? history.map((log, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-dash-bg border border-transparent hover:border-dash-border transition-all">
                        <div className={`p-3 rounded-xl h-fit ${
                          log.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 
                          log.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Bell size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-dash-text">{log.type.replace('_', ' ')}</h4>
                            <span className="text-[10px] font-bold text-dash-muted uppercase">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-dash-muted mt-1 font-medium">{log.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${log.status === 'SENT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {log.status}
                             </span>
                             <span className="text-[9px] font-bold text-dash-muted bg-white px-2 py-0.5 rounded-full border border-dash-border">
                                {log.recipient}
                             </span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <div className="bg-dash-bg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-dash-muted/30">
                          <Bell size={24} />
                        </div>
                        <p className="text-sm font-bold text-dash-muted">No recent notifications</p>
                      </div>
                    )}
                  </div>
               </div>
             </div>
           )}

           {activeSection === 'Security & Auth' && (
             <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-dash-border">
               <Shield size={48} className="mx-auto text-dash-muted/20 mb-4" />
               <h3 className="text-lg font-bold text-dash-text">Security Settings</h3>
               <p className="text-sm text-dash-muted mt-2">These settings are managed at the company level.</p>
             </div>
           )}
           
           {activeSection === 'Geofencing' && (
             <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-dash-border">
               <MapPin size={48} className="mx-auto text-dash-muted/20 mb-4" />
               <h3 className="text-lg font-bold text-dash-text">Geofencing Rules</h3>
               <p className="text-sm text-dash-muted mt-2">Polygon definitions and restricted zones coming soon.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
