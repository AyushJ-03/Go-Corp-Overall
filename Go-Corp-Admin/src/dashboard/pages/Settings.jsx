import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Clock, Shield, Bell, MapPin, Save, RefreshCw } from 'lucide-react';
import * as adminAPI from '../../services/adminAPI';
import * as authAPI from '../../services/authAPI';

export default function Settings() {
  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:30");
  const [loading, setLoading] = useState(false);
  const [activeOfficeId, setActiveOfficeId] = useState(null);

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
      }
    } catch (error) {
      console.error("Office data load failed:", error);
    }
  };

  const handleSave = async () => {
    if (!activeOfficeId) return;
    try {
      const numericDays = workingDays
         .map(d => REVERSE_DAYS_MAP[d])
         .filter(d => d != null)
         .sort((a, b) => a - b);
         
      await adminAPI.updateOfficeSettings(activeOfficeId, {
         shift_start: startTime,
         shift_end: endTime,
         working_days: numericDays
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings.");
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Settings</h1>
          <p className="text-dash-muted mt-1 font-medium">Configure office timings, shifts, and mobility rules.</p>
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
        {/* Navigation Sidebar for Settings */}
        <div className="lg:col-span-1 space-y-4">
           {[
             { name: 'Office Configuration', icon: Clock, desc: 'Timings, shifts and slots' },
             { name: 'Security & Auth', icon: Shield, desc: 'Two-factor, employee verification' },
             { name: 'Notifications', icon: Bell, desc: 'Driver delays, SOS alerts' },
             { name: 'Geofencing', icon: MapPin, desc: 'Pickup boundaries, restricted zones' },
           ].map((item, i) => (
             <button key={i} className={`w-full text-left p-6 rounded-[2rem] border transition-all flex items-start gap-4 ${
               i === 0 ? 'bg-white border-dash-blue shadow-sm ring-1 ring-dash-blue/5' : 'bg-transparent border-transparent hover:bg-white hover:border-dash-border'
             }`}>
                <div className={`p-3 rounded-xl ${i === 0 ? 'bg-dash-blue text-white' : 'bg-dash-bg text-dash-muted'}`}>
                   <item.icon size={20} />
                </div>
                <div>
                   <h4 className={`text-sm font-bold ${i === 0 ? 'text-dash-text' : 'text-dash-muted'}`}>{item.name}</h4>
                   <p className="text-[11px] font-medium text-dash-muted mt-1">{item.desc}</p>
                </div>
             </button>
           ))}
        </div>

        {/* Settings Form Content */}
        <div className="lg:col-span-2 space-y-8">
           {/* Office Timing Section */}
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
              <h3 className="text-xl font-bold text-dash-text mb-8 flex items-center gap-2">
                 Office Configuration
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

                 <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-4">
                    <div className="p-2 bg-yellow-400 text-white rounded-xl h-fit">
                       <RefreshCw size={18} />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-yellow-800">Auto-Optimization</h4>
                       <p className="text-xs text-yellow-700 mt-1 font-medium leading-relaxed">
                          Your current settings suggest clustering starts 15 mins before shift timings. Overlap is currently allowed.
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Default Rules Section */}
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
              <h3 className="text-xl font-bold text-dash-text mb-8">Default Pickup Rules</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between py-4 border-b border-dash-border last:border-0 group">
                    <div className="max-w-[70%]">
                       <h4 className="text-sm font-bold text-dash-text group-hover:text-dash-blue transition-colors">Max Radius for Home Pickup</h4>
                       <p className="text-xs text-dash-muted mt-1 font-medium">Define distance limit for doorstep pickup before requiring a common point.</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <input type="number" defaultValue="5" className="w-20 px-3 py-2 bg-dash-bg rounded-xl text-sm font-bold text-center outline-none" />
                       <span className="text-[10px] font-bold text-dash-muted uppercase">KM</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between py-4 border-b border-dash-border last:border-0 group">
                    <div className="max-w-[70%]">
                       <h4 className="text-sm font-bold text-dash-text group-hover:text-dash-blue transition-colors">Buffer Time for Boarding</h4>
                       <p className="text-xs text-dash-muted mt-1 font-medium">Maximum time driver waits at a pickup point per employee.</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <input type="number" defaultValue="3" className="w-20 px-3 py-2 bg-dash-bg rounded-xl text-sm font-bold text-center outline-none" />
                       <span className="text-[10px] font-bold text-dash-muted uppercase">MIN</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
