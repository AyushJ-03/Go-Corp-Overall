import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Users, Clock, AlertTriangle, Calendar, ChevronDown, Download, PiggyBank, TrendingUp } from 'lucide-react';
import { getReportStats } from '../../services/adminAPI';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const officeId = localStorage.getItem('officeId');
      if (officeId) {
        try {
          const data = await getReportStats(officeId);
          setStats(data);
        } catch (err) {
          console.error("Failed to fetch report stats:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStats();
  }, []);

  const frequentUsers = stats?.frequentUsers?.map(fu => ({
    name: `${fu.name.first_name} ${fu.name.last_name}`,
    rides: fu.rides,
    dept: 'Operations', // Default as schema doesn't have dept yet
    trend: '+'+Math.floor(Math.random() * 15)+'%', // Simulated trend
    profile_pic: fu.profile_pic
  })) || [];

  const totalSavings = stats?.savings?.totalSavings || 0;
  const totalSolo = stats?.savings?.totalSolo || 0;
  const totalCarpool = stats?.savings?.totalCarpool || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dash-blue"></div>
      </div>
    );
  }

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
            All Time
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-dash-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20">
            <Download size={18} />
            Generate PDF
          </button>
        </div>
      </div>

      {/* Corporate Savings Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-dash-border relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-125 transition-transform duration-700" />
            <div className="relative">
              <div className="p-3 bg-green-100/50 text-green-600 rounded-2xl w-fit mb-4">
                <PiggyBank size={24} />
              </div>
              <p className="text-sm font-bold text-dash-muted uppercase tracking-wider mb-1">Total Net Savings</p>
              <h2 className="text-4xl font-black text-dash-text">₹{totalSavings.toLocaleString()}</h2>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100">
                <TrendingUp size={14} />
                {(totalSolo > 0 ? (totalSavings / totalSolo * 100).toFixed(1) : 0)}% Efficiency Gain
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-dash-border group">
            <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl w-fit mb-4 group-hover:rotate-12 transition-transform">
              <BarChart3 size={24} />
            </div>
            <p className="text-sm font-bold text-dash-muted uppercase tracking-wider mb-1">Solo Spent Potential</p>
            <h2 className="text-4xl font-black text-dash-text/40 italic line-through">₹{totalSolo.toLocaleString()}</h2>
            <p className="mt-2 text-[11px] font-bold text-dash-muted">Hypothetical cost without carpooling</p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-dash-border group">
            <div className="p-3 bg-purple-100/50 text-purple-600 rounded-2xl w-fit mb-4 group-hover:rotate-12 transition-transform">
                <Users size={24} />
            </div>
            <p className="text-sm font-bold text-dash-muted uppercase tracking-wider mb-1">Total Carpool Spent</p>
            <h2 className="text-4xl font-black text-dash-blue">₹{totalCarpool.toLocaleString()}</h2>
            <p className="mt-2 text-[11px] font-bold text-dash-muted">Actual logistics expense recorded</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Most Frequent Users Ranking */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-dash-blue">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-xl font-bold text-dash-text">Employee Engagement Ranking</h3>
            </div>
            <span className="text-xs font-bold text-dash-muted uppercase px-3 py-1 bg-dash-bg rounded-lg">Top Frequent Users</span>
          </div>
          
          <div className="space-y-4">
            {frequentUsers.length > 0 ? frequentUsers.map((user, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-dash-bg/50 border border-transparent hover:border-dash-border hover:bg-white hover:shadow-xl hover:shadow-dash-blue/5 rounded-[1.5rem] transition-all group cursor-default">
                <div className="flex items-center gap-5">
                  <div className="relative text-2xl font-black text-dash-text/10 group-hover:text-dash-blue/20 transition-colors">
                    #0{i + 1}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-dash-border flex items-center justify-center font-bold text-dash-blue overflow-hidden group-hover:border-dash-blue transition-colors">
                    {user.profile_pic ? (
                      <img src={user.profile_pic} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.name.split(' ').map(n => n[0]).join('')
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-dash-text group-hover:text-dash-blue transition-colors">{user.name}</h4>
                    <p className="text-[11px] text-dash-muted font-black tracking-widest uppercase opacity-70">{user.dept}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xl font-black text-dash-text">{user.rides}</p>
                    <p className="text-[10px] font-bold text-dash-muted uppercase">Requests</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-black ${user.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-dash-red bg-red-50'}`}>
                    {user.trend}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center bg-dash-bg/30 rounded-3xl border border-dashed border-dash-border">
                <p className="text-dash-muted font-bold text-sm">No mobility data available yet for ranking.</p>
              </div>
            )}
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
                    <p className="text-4xl font-bold text-dash-red">0</p>
                    <p className="text-xs font-bold text-dash-muted uppercase tracking-widest mt-2">Incidents this month</p>
                 </div>
                 <button className="w-full py-3 bg-dash-bg rounded-xl text-xs font-bold text-dash-text hover:bg-gray-100 transition-all opacity-50 cursor-not-allowed">View Incident Details</button>
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
                   { name: 'Operations', val: 100, color: 'bg-dash-blue' },
                   { name: 'Engineering', val: 0, color: 'bg-dash-green' },
                   { name: 'Sales', val: 0, color: 'bg-dash-yellow' },
                   { name: 'Others', val: 0, color: 'bg-gray-300' },
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
         
         <div className="h-64 flex items-end gap-2 px-4 shadow-inner bg-dash-bg/30 rounded-3xl pt-8">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = stats?.peakTimes?.[i] || Math.sin((i - 8) / 4) * 40 + 50 + Math.random() * 10;
              const isPeak = i >= 8 && i <= 10 || i >= 17 && i <= 19;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-help relative">
                   <div 
                    className={`w-full rounded-t-lg transition-all duration-1000 ${isPeak ? 'bg-dash-blue/80' : 'bg-gray-200'} hover:bg-dash-blue`} 
                    style={{ height: `${height}%` }}
                  />
                   <span className="text-[10px] font-bold text-dash-muted hidden md:block">{i % 6 === 0 ? `${i}:00` : ''}</span>
                   {/* Tooltip */}
                   <div className="absolute bottom-full mb-2 bg-dash-text text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
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
