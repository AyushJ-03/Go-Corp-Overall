import React from 'react';
import { Car, Search, Filter, History, MapPin } from 'lucide-react';
import BookingTable from '../components/BookingTable';

export default function Booking() {
  const bookingData = [
    { carNo: '6465', driver: 'Alex', location: 'Mumbai', earning: 250, status: 'Active', rating: 4.3 },
    { carNo: '1065', driver: 'Raj', location: 'Delhi', earning: 20, status: 'Delayed', rating: 3.5 },
    { carNo: '0015', driver: 'Riva', location: 'Mumbai', earning: 120, status: 'Delayed', rating: 3.1 },
    { carNo: '3205', driver: 'Roan', location: 'Ahmedabad', earning: 510, status: 'Active', rating: 4.5 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Rides Booking</h1>
          <p className="text-dash-muted mt-1 font-medium">Manage and monitor all active and scheduled bookings.</p>
        </div>
        <button className="bg-dash-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20">
          <Car size={18} />
          Manual Booking
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-dash-border flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            className="w-full pl-12 pr-4 py-3 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/10 outline-none"
          />
        </div>
        <button className="p-3 bg-dash-bg rounded-xl text-dash-muted hover:text-dash-text transition-colors">
          <Filter size={20} />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
         <h2 className="text-xl font-bold text-dash-text mb-6">Active Bookings</h2>
         <BookingTable data={bookingData} />
      </div>
    </div>
  );
}
