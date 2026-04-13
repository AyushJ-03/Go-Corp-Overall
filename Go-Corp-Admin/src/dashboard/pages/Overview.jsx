import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Clock, 
  ChevronRight,
  Building2,
  MapPin,
  PieChart
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import StatsCard from '../components/StatsCard';
import BookingTable from '../components/BookingTable';
import * as adminAPI from '../../services/adminAPI';
import * as walletAPI from '../../services/walletAPI';
import AdminUserSearch from '../components/AdminUserSearch';
import AdminRideSummaryCard from '../components/AdminRideSummaryCard';
import * as authAPI from '../../services/authAPI';
import { useMap } from 'react-leaflet';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different marker types
const officeIcon = L.divIcon({
    html: `<div class="w-8 h-8 bg-dash-blue rounded-xl flex items-center justify-center text-white border-2 border-white shadow-lg"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path><path d="M14 16h1"></path><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

const getNumberedIcon = (number, type = 'pickup', isHighlighted = false) => {
    const bgColor = type === 'pickup' ? 'bg-orange-500' : 'bg-rose-500';
    const highlightClasses = isHighlighted ? 'ring-2 ring-dash-blue ring-offset-1 scale-110 z-[1000]' : '';
    
    return L.divIcon({
        html: `<div class="w-7 h-7 ${bgColor} rounded-full flex items-center justify-center text-white text-[11px] font-black border-2 border-white shadow-xl transform transition-all duration-300 ${highlightClasses}">
                ${number}
               </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};


const pickupIcon = L.divIcon({
    html: `<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md animate-bounce"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const dropIcon = L.divIcon({
    html: `<div class="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

export default function Overview() {
  const [stats, setStats] = useState([
    { title: 'Monthly Spend', value: '₹0', icon: DollarSign, trend: 'up', percentage: 0, color: 'blue' },
    { title: 'Active Clusters', value: '0', icon: Users, trend: 'up', percentage: 0, color: 'green' },
    { title: 'Employee Transit', value: '0', icon: Briefcase, trend: 'up', percentage: 0, color: 'purple' },
    { title: 'Savings Index', value: '0%', icon: TrendingUp, trend: 'up', percentage: 0, color: 'yellow' },
  ]);

  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState(null);
  const [activeOfficeId, setActiveOfficeId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedUserRide, setSelectedUserRide] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      let id = localStorage.getItem('officeId');
      
      // If missing or corrupted, fetch from profile
      if (!id || id === '[object Object]') {
        const profile = await authAPI.getUserProfile();
        id = typeof profile.office_id === 'object' ? profile.office_id._id : profile.office_id;
        localStorage.setItem('officeId', id);
      }
      
      setActiveOfficeId(id);
      await loadDashboardData(id);
    } catch (error) {
      console.error("Dashboard initialization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (oid) => {
    try {
      const [opStats, recentRides, officeData] = await Promise.all([
        adminAPI.getOperationalStats(oid),
        adminAPI.getRecentBookings(oid),
        adminAPI.getOfficeDetails(oid)
      ]);

      if (officeData?.office_location?.coordinates) {
        const coords = [officeData.office_location.coordinates[1], officeData.office_location.coordinates[0]];
        setOffice(officeData);
        setMapCenter(coords);
      }

      setStats([
        { 
          title: 'Monthly Spend', 
          value: `₹${(opStats.totalSpendMonth || 0).toLocaleString()}`, 
          icon: DollarSign, 
          trend: 'up', 
          percentage: 0, 
          color: 'blue' 
        },
        { 
          title: 'Active Clusters', 
          value: opStats.activeClusters.toString(), 
          icon: Users, 
          trend: 'up', 
          percentage: 0, 
          color: 'green' 
        },
        { 
          title: 'Employee Transit', 
          value: opStats.inTransit.toString(), 
          icon: Briefcase, 
          trend: 'up', 
          percentage: 0, 
          color: 'purple' 
        },
        { 
          title: 'Savings Index', 
          value: `${opStats.savingsIndex || 0}%`, 
          icon: TrendingUp, 
          trend: 'up', 
          percentage: 0, 
          color: 'yellow' 
        },
      ]);

      const filteredRides = recentRides.filter(ride => {
        const status = (ride.status || '').toUpperCase();
        return status === 'CREATED' || status === 'DRIVER_ACCEPTED';
      });
      setBookingData(filteredRides);
    } catch (error) {
      console.error("Dashboard load failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    try {
        setSelectedEmployee(user);
        const rideData = await adminAPI.getEmployeeRideStatus(user._id);
        setSelectedUserRide(rideData);

        if (rideData) {
            calculateMapBounds(rideData);
        }
    } catch (err) {
        console.error("Failed to fetch user ride status", err);
    }
  };

  const calculateMapBounds = (rideData) => {
    const points = [];
    
    // Add office
    if (office) {
        points.push([office.office_location.coordinates[1], office.office_location.coordinates[0]]);
    }

    // Add participants locations
    if (rideData.group_participants) {
        rideData.group_participants.forEach(p => {
            if (p.pickup_location?.coordinates) {
                points.push([p.pickup_location.coordinates[1], p.pickup_location.coordinates[0]]);
            }
        });
    } else if (rideData.pickup_location?.coordinates) {
        points.push([rideData.pickup_location.coordinates[1], rideData.pickup_location.coordinates[0]]);
    }

    if (rideData.drop_location?.coordinates) {
        points.push([rideData.drop_location.coordinates[1], rideData.drop_location.coordinates[0]]);
    }

    // Add polyline points if available
    const polyline = rideData.batch?.pickup_polyline || rideData.clustering?.pickup_polyline;
    if (polyline?.coordinates) {
        polyline.coordinates.forEach(coord => points.push([coord[1], coord[0]]));
    }

    if (points.length > 0) {
        setMapBounds(points);
    }
  };

  const handleBatchmateSelect = async (participant) => {
    setSelectedEmployee(participant);
    
    // Find the stop for this participant and center map
    const stop = selectedUserRide?.group_participants?.find(p => p._id === participant._id);
    if (stop?.pickup_location?.coordinates) {
        setMapCenter([stop.pickup_location.coordinates[1], stop.pickup_location.coordinates[0]]);
        setMapBounds(null); // Clear bounds to allow centering
    }
  };

  // Internal component to control map camera
  function MapController({ bounds, center }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            try {
                map.fitBounds(bounds, { padding: [80, 80], animate: true });
            } catch (e) {
                console.warn("Could not fit bounds", e);
            }
        } else if (center) {
            map.setView(center, 14, { animate: true });
        }
    }, [bounds, center, map]);
    return null;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 🔴 HEADER: Minimalist & Corporate */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Corporate Dispatch Overview</h1>
          <p className="text-dash-muted mt-1 font-medium">Monitoring employee transit efficiency and corporate spend.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-dash-border shadow-sm text-xs font-bold text-dash-text">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              SYSTEM LIVE
           </div>
        </div>
      </div>

      {/* 🟢 STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* 🟢 SEARCH BAR & DISPATCH CONTROLS */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl px-3">
            <AdminUserSearch 
              officeId={activeOfficeId} 
              onSelect={handleUserSelect} 
              onClear={() => {
                setSelectedEmployee(null);
                setSelectedUserRide(null);
                setMapBounds(null);
                if (office) {
                  setMapCenter([office.office_location.coordinates[1], office.office_location.coordinates[0]]);
                }
              }} 
            />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 🔵 LIVE MAP VIEW (2/3 Width) */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-4 shadow-sm border border-dash-border h-[500px] overflow-hidden">
            <MapContainer 
               key={office ? office._id : 'initializing'}
               center={mapCenter} 
               zoom={14} 
               className="w-full h-full rounded-[2rem]"
             >
               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               <MapController bounds={mapBounds} center={mapCenter} />
               
               {office && (
                <Marker 
                  position={[office.office_location.coordinates[1], office.office_location.coordinates[0]]}
                  icon={officeIcon}
                >
                  <Popup><b>{office.name}</b><br/>Corporate HQ</Popup>
                </Marker>
               )}

               {selectedUserRide && (
                <>
                  {/* Route Polyline - Orange Linear */}
                  {(selectedUserRide.batch?.pickup_polyline || selectedUserRide.clustering?.pickup_polyline) && (
                    <Polyline 
                      positions={(selectedUserRide.batch?.pickup_polyline?.coordinates || selectedUserRide.clustering?.pickup_polyline?.coordinates).map(c => [c[1], c[0]])}
                      pathOptions={{ color: '#FF7000', weight: 5, opacity: 0.8 }}
                    />
                  )}

                  {/* Group Participants (Stops) */}
                  {selectedUserRide.group_participants && selectedUserRide.group_participants.length > 0 ? (
                    (() => {
                        // Maintain the order from group_participants (which is already sorted by ride_ids in backend)
                        // but group them by ride_id to avoid multiple markers at the same spot
                        const stops = [];
                        const seenRides = new Set();
                        
                        selectedUserRide.group_participants.forEach(p => {
                            if (!seenRides.has(p.ride_id)) {
                                seenRides.add(p.ride_id);
                                stops.push({
                                    ride_id: p.ride_id,
                                    location: p.pickup_location,
                                    participants: selectedUserRide.group_participants.filter(item => item.ride_id === p.ride_id)
                                });
                            }
                        });
                        
                        return stops.map((stop, idx) => {
                            const isToOffice = selectedUserRide.destination_type === 'OFFICE';
                            const stopNumber = idx + 1;
                            const stopType = isToOffice ? 'pickup' : 'drop';
                            const isHighlighted = stop.participants.some(p => p._id === selectedEmployee?._id);

                            return (
                                <Marker 
                                    key={stop.ride_id} 
                                    position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
                                    icon={getNumberedIcon(stopNumber, stopType, isHighlighted)}
                                    zIndexOffset={isHighlighted ? 1000 : 0}
                                >
                                    <Popup>
                                        <div className="space-y-1">
                                            {stop.participants.map(p => (
                                                <div key={p._id} className="font-bold">{p.name.first_name} {p.name.last_name}</div>
                                            ))}
                                            <div className="text-[10px] text-dash-muted font-bold uppercase border-t pt-1">
                                                {isToOffice ? 'Pickup' : 'Drop-off'} Stop #{stopNumber}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        });
                    })()
                  ) : selectedUserRide && selectedUserRide.pickup_location ? (
                    <Marker 
                      position={[selectedUserRide.pickup_location.coordinates[1], selectedUserRide.pickup_location.coordinates[0]]}
                      icon={getNumberedIcon(1, selectedUserRide.destination_type === 'OFFICE' ? 'pickup' : 'drop')}
                    >
                      <Popup>Location: {selectedUserRide.employee_id.name.first_name}</Popup>
                    </Marker>
                  ) : null}


                  {/* Office Stop (HQ) - No Number */}
                  <Marker 
                    position={[office.office_location.coordinates[1], office.office_location.coordinates[0]]}
                    icon={officeIcon}
                  >
                      <Popup>
                        <b>Corporate HQ</b><br/>
                        {selectedUserRide.destination_type === 'OFFICE' ? 'Final Destination' : 'Origin Point'}
                      </Popup>
                  </Marker>

                </>
               )}

            </MapContainer>
        </div>

        {/* 🟣 RIDE DETAILS SIDE PANEL (1/3 Width) */}
        <div className="h-[500px]">
            {selectedEmployee ? (
                <AdminRideSummaryCard 
                  ride={selectedUserRide} 
                  employee={selectedEmployee}
                  onSelectBatchmate={handleBatchmateSelect}
                  onClose={() => {
                    setSelectedEmployee(null);
                    setSelectedUserRide(null);
                    setMapBounds(null);
                  }} 
                />
            ) : (
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-dash-bg rounded-3xl flex items-center justify-center text-dash-muted mb-4 border border-dash-border">
                        <Users size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-dash-text mb-2">No Employee Selected</h3>
                    <p className="text-sm text-dash-muted max-w-xs leading-relaxed">
                        Search for an employee above to visualize their current ride status and transit efficiency.
                    </p>
                </div>
            )}
        </div>
      </div>


      {/* 🟡 RECENT ACTIVITY TABLE */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-2xl font-bold text-dash-text">Active Shift Requests</h2>
          <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-dash-border text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Clock size={18} />
            Full Schedule
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-dash-border">
          <BookingTable data={bookingData} />
        </div>
      </div>
    </div>
  );
}
