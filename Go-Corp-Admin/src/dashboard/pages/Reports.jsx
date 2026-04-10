import React from 'react';
import { BarChart3, PieChart, Users, Clock, AlertTriangle, Calendar, ChevronDown, Download } from 'lucide-react';

export default function Reports() {
  const frequentUsers = [
    { name: 'Rahul Sharma', rides: 42, dept: 'Engineering', trend: '+12%' },
    { name: 'Sneha Rao', rides: 38, dept: 'HR', trend: '+5%' },
    { name: 'Priya Verma', rides: 35, dept: 'Design', trend: '-2%' },
    { name: 'Aman Deep', rides: 31, dept: 'Marketing', trend: '+8%' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Reports & Insights</h1>
          <p className="text-dash-muted mt-1 font-medium">Data-driven insights into your corporate mobility.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-dash-border rounded-xl text-sm font-bold text-dash-text hover:bg-gray-50 transition-all shadow-sm">
            <Calendar size={18} />
            Last 30 Days
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-dash-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20">
            <Download size={18} />
            Generate PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Most Frequent Users */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-dash-blue">
                <Users size={20} />
              </div>
              <h3 className="text-xl font-bold text-dash-text">Most Frequent Users</h3>
            </div>
            <button className="text-sm font-bold text-dash-blue hover:underline">View All</button>
          </div>
          
          <div className="space-y-6">
            {frequentUsers.map((user, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-dash-bg border border-transparent hover:border-dash-border hover:bg-white rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-dash-border flex items-center justify-center font-bold text-dash-blue group-hover:scale-110 transition-transform">
                    {user.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dash-text">{user.name}</h4>
                    <p className="text-[11px] text-dash-muted font-bold tracking-wider">{user.dept}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-dash-text">{user.rides} Rides</p>
                  <p className={`text-[11px] font-bold ${user.trend.startsWith('+') ? 'text-green-500' : 'text-dash-red'}`}>{user.trend} vs Oct</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No-show & Cancellations */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-50 rounded-2xl text-dash-red">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-xl font-bold text-dash-text">No-Show Reports</h3>
              </div>
              <div className="space-y-4">
                 <div className="text-center py-6">
                    <p className="text-4xl font-bold text-dash-red">12</p>
                    <p className="text-xs font-bold text-dash-muted uppercase tracking-widest mt-2">Incidents this month</p>
                 </div>
                 <button className="w-full py-3 bg-dash-bg rounded-xl text-xs font-bold text-dash-text hover:bg-gray-100 transition-all">View Incident Details</button>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-50 rounded-2xl text-dash-green">
                  <PieChart size={20} />
                </div>
                <h3 className="text-xl font-bold text-dash-text">Dept. Usage</h3>
              </div>
              <div className="space-y-3">
                 {[
                   { name: 'Engineering', val: 45, color: 'bg-dash-blue' },
                   { name: 'Marketing', val: 25, color: 'bg-dash-green' },
                   { name: 'Sales', val: 20, color: 'bg-dash-yellow' },
                   { name: 'Others', val: 10, color: 'bg-gray-300' },
                 ].map(dept => (
                   <div key={dept.name}>
                      <div className="flex justify-between text-[11px] font-bold text-dash-text mb-1 uppercase">
                         <span>{dept.name}</span>
                         <span>{dept.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div className={`h-full ${dept.color} transition-all duration-1000`} style={{ width: `${dept.val}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Peak Booking Times */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
         <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-yellow-50 rounded-2xl text-dash-yellow">
             <Clock size={20} />
           </div>
           <h3 className="text-xl font-bold text-dash-text">Peak Booking Times</h3>
         </div>
         
         <div className="h-64 flex items-end gap-2 px-4">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = Math.sin((i - 8) / 4) * 40 + 50 + Math.random() * 10;
              const isPeak = i >= 8 && i <= 10 || i >= 17 && i <= 19;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-help">
                   <div 
                    className={`w-full rounded-t-lg transition-all duration-1000 ${isPeak ? 'bg-dash-blue/80' : 'bg-gray-100'}`} 
                    style={{ height: `${height}%` }}
                  />
                   <span className="text-[10px] font-bold text-dash-muted hidden md:block">{i % 6 === 0 ? `${i}:00` : ''}</span>
                   {/* Tooltip */}
                   <div className="absolute bottom-full mb-2 bg-dash-text text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {i}:00 - {Math.round(height)} bookings
                   </div>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
}
