import React from 'react';
import { Settings as SettingsIcon, Clock, Shield, Bell, MapPin, Save, RefreshCw } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Settings</h1>
          <p className="text-dash-muted mt-1 font-medium">Configure office timings, shifts, and mobility rules.</p>
        </div>
        <button className="bg-dash-blue text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20 active:scale-95">
          <Save size={18} />
          Save Changes
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
                          <input type="time" defaultValue="09:00" className="w-full pl-12 pr-4 py-3.5 bg-dash-bg border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-dash-blue/10 outline-none" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-xs font-bold text-dash-muted uppercase tracking-wider ml-1">Office End Time</label>
                       <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-muted" size={18} />
                          <input type="time" defaultValue="18:30" className="w-full pl-12 pr-4 py-3.5 bg-dash-bg border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-dash-blue/10 outline-none" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-xs font-bold text-dash-muted uppercase tracking-wider ml-1 block">Active Shift Slots</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {['General Shift', 'Morning Slot', 'Night Shift'].map((slot, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-dash-bg rounded-2xl border border-transparent hover:border-dash-border group cursor-pointer">
                             <span className="text-sm font-bold text-dash-text">{slot}</span>
                             <div className="w-10 h-6 bg-dash-blue rounded-full relative p-1 transition-all">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                             </div>
                          </div>
                       ))}
                       <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-dash-border rounded-2xl text-sm font-bold text-dash-muted hover:border-dash-blue hover:text-dash-blue transition-all">
                          + Add Slot
                       </button>
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
