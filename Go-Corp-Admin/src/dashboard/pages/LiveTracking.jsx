import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, User, Phone, AlertCircle, Search, Filter, Maximize2, Minimize2 } from 'lucide-react';

export default function LiveTracking() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Mock live drivers
  const [drivers, setDrivers] = useState([
    { id: 1, name: 'Alex Johnson', car: 'White Sedan', lat: 30, lng: 40, status: 'On Trip' },
    { id: 2, name: 'Suresh Raina', car: 'Grey Hatchback', lat: 60, lng: 20, status: 'En route to Pickup' },
    { id: 3, name: 'Priya Patel', car: 'Blue SUV', lat: 20, lng: 70, status: 'On Trip' },
  ]);

  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(d => ({
        ...d,
        lat: d.lat + (Math.random() - 0.5) * 1,
        lng: d.lng + (Math.random() - 0.5) * 1,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`space-y-8 animate-in zoom-in-95 duration-500 ${isFullscreen ? 'fixed inset-0 z-[1000] bg-dash-bg p-8' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Live Tracking</h1>
          <p className="text-dash-muted mt-1 font-medium">Real-time location of drivers and employee pickups.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-dash-border shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-dash-text uppercase tracking-wider">Live System Active</span>
           </div>
           <button 
             onClick={() => setIsFullscreen(!isFullscreen)}
             className="p-3 bg-white border border-dash-border rounded-xl hover:bg-gray-50 transition-all shadow-sm"
           >
             {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Drivers Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-6 shadow-sm border border-dash-border flex flex-col">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-muted" size={16} />
            <input 
              type="text" 
              placeholder="Filter drivers..." 
              className="w-full pl-10 pr-4 py-2.5 bg-dash-bg border-transparent rounded-xl text-sm focus:ring-2 focus:ring-dash-blue/10 outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="p-4 rounded-2xl bg-dash-bg border border-transparent hover:border-dash-blue/20 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-dash-border flex items-center justify-center font-bold text-dash-blue shadow-sm">
                    {driver.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dash-text">{driver.name}</h4>
                    <p className="text-[10px] text-dash-muted font-bold uppercase tracking-tight">{driver.car}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={`px-2 py-1 rounded-lg ${
                    driver.status === 'On Trip' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {driver.status}
                  </span>
                  <div className="flex items-center gap-2 text-dash-muted">
                    <Navigation size={12} />
                    <span>2.4 km away</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-dash-border">
             <button className="w-full py-3 bg-dash-red/5 text-dash-red rounded-xl text-xs font-bold hover:bg-dash-red hover:text-white transition-all flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                Emergency Alerts (2)
             </button>
          </div>
        </div>

        {/* Map Visualization */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-dash-border relative overflow-hidden group">
           {/* Grid Background */}
           <div className="absolute inset-0 bg-dash-bg bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />
           
           {/* Simulated Map Elements */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Fake Roads */}
              <path d="M 0 100 Q 200 150 400 100 T 800 120" fill="none" stroke="#e2e8f0" strokeWidth="40" strokeLinecap="round" />
              <path d="M 100 0 Q 150 200 120 400 T 140 800" fill="none" stroke="#e2e8f0" strokeWidth="30" strokeLinecap="round" />
              <path d="M 300 0 Q 350 400 320 800" fill="none" stroke="#e2e8f0" strokeWidth="25" strokeLinecap="round" />
           </svg>

           {/* Live Pins */}
           {drivers.map((driver) => (
             <div 
               key={driver.id}
               className="absolute transition-all duration-3000 ease-in-out"
               style={{ top: `${driver.lat}%`, left: `${driver.lng}%` }}
             >
                <div className="relative group/pin cursor-pointer">
                   {/* Ripple effect */}
                   <div className="absolute -inset-4 bg-dash-blue/20 rounded-full animate-ping pointer-events-none" />
                   
                   <div className="relative bg-dash-blue p-2 rounded-xl shadow-lg border-2 border-white ring-4 ring-dash-blue/10 transform transition-transform hover:scale-125">
                      <Navigation size={18} className="text-white transform rotate-45" />
                   </div>

                   {/* Label */}
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-dash-border opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap z-50">
                      <p className="text-xs font-bold text-dash-text">{driver.name}</p>
                      <p className="text-[10px] text-dash-muted font-bold uppercase">{driver.status}</p>
                   </div>
                </div>
             </div>
           ))}

           {/* Pickup Points */}
           {[ 
             { t: 45, l: 35, name: 'Rahul S.' },
             { t: 25, l: 65, name: 'Priya V.' }
           ].map((pickup, i) => (
             <div 
               key={i}
               className="absolute"
               style={{ top: `${pickup.t}%`, left: `${pickup.l}%` }}
             >
               <div className="bg-white p-1.5 rounded-full shadow-lg border-2 border-dash-green animate-bounce" style={{ animationDelay: `${i*0.5}s` }}>
                 <User size={14} className="text-dash-green" />
               </div>
             </div>
           ))}

           {/* Map Controls */}
           <div className="absolute bottom-8 right-8 flex flex-col gap-2">
              <button className="bg-white p-3 rounded-xl shadow-lg border border-dash-border hover:bg-gray-50 transition-all font-bold text-lg">+</button>
              <button className="bg-white p-3 rounded-xl shadow-lg border border-dash-border hover:bg-gray-50 transition-all font-bold text-lg">-</button>
           </div>
           
           <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/50 shadow-xl">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-dash-muted font-bold uppercase mb-1">Active Cabs</p>
                  <p className="text-xl font-bold text-dash-text">24</p>
                </div>
                <div className="w-[1px] h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-[10px] text-dash-muted font-bold uppercase mb-1">Pickups Pending</p>
                  <p className="text-xl font-bold text-dash-red">08</p>
                </div>
                <div className="w-[1px] h-8 bg-gray-200" />
                <div className="text-center">
                  <p className="text-[10px] text-dash-muted font-bold uppercase mb-1">Avg. Delay</p>
                  <p className="text-xl font-bold text-dash-yellow">4m</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
