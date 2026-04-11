import React from 'react';
import { Users, MapPin, Clock, ChevronRight, User, Info } from 'lucide-react';

export default function SharedRides() {
  const clusters = [
    {
      id: 'Cluster #7A2',
      employees: [
        { name: 'Rahul Sharma', pickup: '08:00 AM', status: 'Picked', order: 1 },
        { name: 'Priya Verma', pickup: '08:15 AM', status: 'Waiting', order: 2 },
        { name: 'Aman Deep', pickup: '08:30 AM', status: 'Pending', order: 3 },
      ],
      route: 'Sector 62 -> Noida City Center',
      estTime: '45 mins',
      efficiency: 'High'
    },
    {
      id: 'Cluster #9B1',
      employees: [
        { name: 'Sneha Rao', pickup: '08:10 AM', status: 'Picked', order: 1 },
        { name: 'Anjali Gupta', pickup: '08:25 AM', status: 'Waiting', order: 2 },
      ],
      route: 'Indirapuram -> Kaushambi',
      estTime: '35 mins',
      efficiency: 'Optimal'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Corporate Clusters</h1>
          <p className="text-dash-muted mt-1 font-medium">Monitoring shared ride efficiency and employee grouping status.</p>
        </div>
        <button className="bg-dash-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20">
          <MapPin size={18} />
          Manual Re-Cluster
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {clusters.map((cluster) => (
          <div key={cluster.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-dash-bg flex items-center justify-center font-bold text-dash-blue text-lg">
                  {cluster.id.split('#')[1]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dash-text">{cluster.id}</h3>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase w-fit mt-1 ${
                    cluster.efficiency === 'Optimal' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {cluster.efficiency} Efficiency
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-dash-muted uppercase tracking-wider mb-1 block">Travel Duration</span>
                <div className="flex items-center gap-1 text-dash-blue font-bold">
                  <Clock size={16} />
                  <span>{cluster.estTime}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
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
                            <span className="text-[11px] text-dash-muted font-bold">{emp.pickup}</span>
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
                 Cluster Management <ChevronRight size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
