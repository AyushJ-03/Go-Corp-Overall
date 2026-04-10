import React from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function Schedule() {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 14 }).map((_, i) => ({
    date: i + 12,
    day: weekDays[(i + 1) % 7],
    active: i === 1
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Ride Schedule</h1>
          <p className="text-dash-muted mt-1 font-medium">Plan and manage recurring employee commutes.</p>
        </div>
        <button className="bg-dash-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20">
          <Plus size={18} />
          Create New Schedule
        </button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-dash-border">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-dash-text">January 2026</h3>
            <div className="flex gap-2">
               <button className="p-2 rounded-xl hover:bg-dash-bg transition-colors"><ChevronLeft size={20} /></button>
               <button className="p-2 rounded-xl hover:bg-dash-bg transition-colors"><ChevronRight size={20} /></button>
            </div>
         </div>
         
         <div className="flex justify-between gap-4 overflow-x-auto pb-4">
            {dates.map((d, i) => (
               <div key={i} className={`flex flex-col items-center min-w-[60px] p-4 rounded-2xl transition-all cursor-pointer ${
                  d.active ? 'bg-dash-blue text-white shadow-lg shadow-dash-blue/20' : 'hover:bg-dash-bg bg-transparent'
               }`}>
                  <span className={`text-xs font-bold uppercase ${d.active ? 'text-blue-100' : 'text-dash-muted'}`}>{d.day}</span>
                  <span className="text-xl font-bold mt-1">{d.date}</span>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-dash-border">
            <h4 className="font-bold text-dash-text mb-6">Morning Shifts</h4>
            <div className="space-y-4">
               {[
                 { time: '08:00 AM', status: 'Scheduled', routes: 12 },
                 { time: '09:00 AM', status: 'In Progress', routes: 8 },
               ].map((s, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-dash-bg rounded-xl">
                    <div className="flex items-center gap-3">
                       <Clock size={16} className="text-dash-muted" />
                       <span className="text-sm font-bold text-dash-text">{s.time}</span>
                    </div>
                    <span className="text-xs font-bold text-dash-muted uppercase">{s.routes} Routes</span>
                 </div>
               ))}
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-dash-border">
            <h4 className="font-bold text-dash-text mb-6">Evening Shifts</h4>
            <div className="space-y-4">
               {[
                 { time: '06:00 PM', status: 'Pending', routes: 14 },
                 { time: '07:30 PM', status: 'Pending', routes: 5 },
               ].map((s, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-dash-bg rounded-xl">
                    <div className="flex items-center gap-3">
                       <Clock size={16} className="text-dash-muted" />
                       <span className="text-sm font-bold text-dash-text">{s.time}</span>
                    </div>
                    <span className="text-xs font-bold text-dash-muted uppercase">{s.routes} Routes</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
