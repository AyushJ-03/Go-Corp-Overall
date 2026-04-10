import React from 'react';
import { 
  DollarSign, 
  Briefcase, 
  Timer, 
  XSquare, 
  MapPin, 
  Clock, 
  ChevronRight,
  MoreVertical,
  Star,
  Car,
  Users,
  Building2,
  Phone
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import StatsCard from '../components/StatsCard';
import BookingTable from '../components/BookingTable';
import carImage from '../assets/car.png';

// Fix for default marker icons in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Overview() {
  const stats = [
    { title: 'Total revenue', value: '$50,101', icon: DollarSign, trend: 'up', percentage: 12, color: 'blue' },
    { title: 'Booking', value: '92/100', icon: Briefcase, trend: 'down', percentage: 10, color: 'red' },
    { title: 'Taxis', value: '1540/1800', icon: Timer, trend: 'up', percentage: 8, color: 'green' },
    { title: 'Canceled', value: '20', icon: XSquare, trend: 'up', percentage: 6, color: 'yellow' },
  ];

  const bookingData = [
    { carNo: '6465', driver: 'Alex', location: 'Mumbai', earning: 250, status: 'Active', rating: 4.3 },
    { carNo: '1065', driver: 'Raj', location: 'Delhi', earning: 20, status: 'Delayed', rating: 3.5 },
    { carNo: '0015', driver: 'Riva', location: 'Mumbai', earning: 120, status: 'Delayed', rating: 3.1 },
    { carNo: '3205', driver: 'Roan', location: 'Ahmedabad', earning: 510, status: 'Active', rating: 4.5 },
    { carNo: '3105', driver: 'Roan', location: 'Ahmedabad', earning: 210, status: 'Active', rating: 4.5 },
  ];

  const currentPassengers = [
    { name: 'Rahul Sharma', role: 'CEO', status: 'Picked', phone: '+91 98765 43210' },
    { name: 'Priya Verma', role: 'CTO', status: 'Waiting', phone: '+91 98765 43211' },
    { name: 'Aman Deep', role: 'VP Marketing', status: 'Scheduled', phone: '+91 98765 43212' },
  ];

  // Office Location (Mumbai center as example)
  const officePos = [19.0760, 72.8777];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="flex flex-col gap-8">
        {/* Full Width Detail Section */}
        <div className="space-y-8">
          {/* Car & Map Integration Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-dash-text">Active Fleet Tracking</h2>
                <p className="text-sm text-dash-muted mt-1 font-medium">Monitoring Volvo VS4 - Real-time Route & Passengers</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold ring-1 ring-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    LIVE
                 </div>
                 <button className="p-3 text-dash-muted hover:bg-dash-bg rounded-xl transition-all border border-dash-border">
                    <MoreVertical size={20} />
                 </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-10">
              {/* Car Visual Area - Fixed Width */}
              <div className="w-full xl:w-[450px] flex-shrink-0 space-y-4">
                <div className="relative group p-4 bg-dash-bg rounded-[2rem] border border-dash-border overflow-hidden">
                  <img 
                    src={carImage} 
                    alt="Car Visual" 
                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Floating Labels & Passengers */}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-white shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-dash-blue rounded-lg">
                        <Car size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-dash-text block">Volvo VS4</span>
                        <div className="flex items-center text-yellow-400">
                          <Star size={12} fill="currentColor" />
                          <span className="text-[10px] text-dash-text ml-1 font-bold">4.8 Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                     <div className="flex -space-x-2 overflow-hidden">
                        {currentPassengers.map((p, i) => (
                           <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-dash-blue text-white flex items-center justify-center text-[10px] font-bold border border-white shadow-sm" title={p.name}>
                              {p.name[0]}
                           </div>
                        ))}
                     </div>
                     <span className="text-[10px] font-bold text-dash-text bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">3 / 4 Seats</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 px-2">

                  <div className="p-3 rounded-2xl bg-gray-50 border border-dash-border text-center">
                    <p className="text-[9px] text-dash-muted font-bold uppercase">Battery</p>
                    <p className="text-xs font-bold text-dash-text">82%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-dash-border text-center">
                    <p className="text-[9px] text-dash-muted font-bold uppercase">Speed</p>
                    <p className="text-xs font-bold text-dash-text">45 km/h</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-dash-border text-center">
                    <p className="text-[9px] text-dash-muted font-bold uppercase">Inside</p>
                    <p className="text-xs font-bold text-dash-text">24 °C</p>
                  </div>
                </div>
              </div>

              {/* Map Holder - Flexible width */}
              <div className="flex-1 h-[250px] xl:h-[350px] bg-dash-bg rounded-[2.5rem] relative overflow-hidden group border border-dash-border shadow-inner">

                 <MapContainer 
                    center={officePos} 
                    zoom={13} 
                    scrollWheelZoom={true}
                    dragging={true}
                    className="w-full h-full"
                  >

                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={officePos}>
                      <Popup>
                        <div className="text-center p-2">
                           <h4 className="font-bold text-dash-text">RapidRides HQ</h4>
                           <p className="text-[10px] text-dash-muted mt-1 uppercase font-bold">Standard Office Location</p>
                        </div>
                      </Popup>
                    </Marker>
                 </MapContainer>
                 
                 {/* Floating Labels */}
                 {/* <div className="absolute top-6 left-6 z-20 space-y-3">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white shadow-xl pointer-events-none">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-dash-blue rounded-xl flex items-center justify-center text-white">
                             <Building2 size={24} />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-dash-text">Corporate Office</p>
                             <p className="text-[10px] text-dash-muted font-bold uppercase">Mumbai Central</p>
                          </div>
                       </div>
                    </div>
                 </div> */}
              </div>
            </div>
          </div>

          {/* Rides Booking Table Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-2xl font-bold text-dash-text">Today's Ride Booking List</h2>
              <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl border border-dash-border text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
                <Clock size={18} />
                View Schedule
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-dash-border">
              <BookingTable data={bookingData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
