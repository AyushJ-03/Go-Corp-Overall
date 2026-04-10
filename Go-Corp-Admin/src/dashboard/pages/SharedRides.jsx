import React from 'react';
import { Users, MapPin, Clock, ChevronRight, Car, User, Info } from 'lucide-react';

export default function SharedRides() {
  const clusters = [
    {
      id: 'Cab 1',
      driver: 'Rajesh Kumar',
      car: 'Toyota Etios (MH 01 AB 1234)',
      employees: [
        { name: 'Rahul Sharma', pickup: '08:00 AM', status: 'Picked', order: 1 },
        { name: 'Priya Verma', pickup: '08:15 AM', status: 'Waiting', order: 2 },
        { name: 'Aman Deep', pickup: '08:30 AM', status: 'Pending', order: 3 },
      ],
      route: 'Powai -> Andheri -> Goregaon',
      estTime: '45 mins'
    },
    {
      id: 'Cab 2',
      driver: 'Suresh Raina',
      car: 'Maruti Dzire (MH 02 XY 5678)',
      employees: [
        { name: 'Sneha Rao', pickup: '08:10 AM', status: 'Picked', order: 1 },
        { name: 'Anjali Gupta', pickup: '08:25 AM', status: 'Waiting', order: 2 },
      ],
      route: 'Thane -> Mulund -> Vikhroli',
      estTime: '35 mins'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Shared Rides / Clusters</h1>
          <p className="text-dash-muted mt-1 font-medium">Manage and view grouped employee rides (clusters).</p>
        </div>
        <button className="bg-dash-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20">
          <MapPin size={18} />
          Optimize Clusters
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {clusters.map((cluster) => (
          <div key={cluster.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-dash-bg flex items-center justify-center font-bold text-dash-blue text-lg">
                  {cluster.id.split(' ')[1]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dash-text">{cluster.id}</h3>
                  <p className="text-xs text-dash-muted font-bold uppercase tracking-wider">{cluster.car}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-dash-muted uppercase tracking-wider mb-1 block">Est. Trip Time</span>
                <div className="flex items-center gap-1 text-dash-blue font-bold">
                  <Clock size={16} />
                  <span>{cluster.estTime}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between px-4 py-3 bg-dash-bg rounded-2xl border border-dash-border">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-dash-muted" />
                    <span className="text-sm font-bold text-dash-text">Driver: <span className="font-medium text-dash-muted">{cluster.driver}</span></span>
                  </div>
                  <button className="text-xs font-bold text-dash-blue hover:underline">Contact</button>
               </div>

               <div className="relative pl-6 space-y-6">
                 {/* Route Line */}
                 <div className="absolute left-10 top-2 bottom-8 w-0.5 border-l-2 border-dashed border-gray-200" />
                 
                 {cluster.employees.map((emp, idx) => (
                   <div key={emp.name} className="relative flex items-center justify-between group/item">
                     <div className="flex items-center gap-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-4 border-white shadow-sm ring-1 ring-gray-100 ${
                          emp.status === 'Picked' ? 'bg-green-500 text-white' : 
                          emp.status === 'Waiting' ? 'bg-yellow-400 text-white' : 
                          'bg-gray-100 text-dash-muted'
                        }`}>
                          {emp.order}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-dash-text group-hover/item:text-dash-blue transition-colors">{emp.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock size={12} className="text-dash-muted" />
                            <span className="text-[11px] text-dash-muted font-bold tracking-tight">{emp.pickup}</span>
                          </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          emp.status === 'Picked' ? 'bg-green-100 text-green-700' : 
                          emp.status === 'Waiting' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {emp.status}
                        </span>
                        <ChevronRight size={16} className="text-dash-muted opacity-0 group-hover/item:opacity-100 transition-all" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-dash-border flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <MapPin size={16} className="text-dash-muted" />
                 <span className="text-xs font-medium text-dash-muted truncate max-w-[200px]">{cluster.route}</span>
               </div>
               <button className="text-sm font-bold text-dash-text flex items-center gap-1 hover:text-dash-blue transition-colors">
                 Manage Cluster <ChevronRight size={16} />
               </button>
            </div>
          </div>
        ))}

        {/* Empty Cluster Card */}
        <div className="border-2 border-dashed border-dash-border rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-dash-blue/50 transition-all">
           <div className="w-16 h-16 rounded-full bg-dash-bg flex items-center justify-center mb-4 group-hover:bg-dash-blue/5 transition-colors">
              <User size={32} className="text-dash-muted group-hover:text-dash-blue transition-colors" />
           </div>
           <h3 className="text-lg font-bold text-dash-text">Add New Cluster</h3>
           <p className="text-sm text-dash-muted mt-2 max-w-[200px]">Create a new shared ride group manually or auto-cluster.</p>
        </div>
      </div>
    </div>
  );
}
