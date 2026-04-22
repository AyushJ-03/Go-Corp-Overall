import React, { useState, useEffect } from 'react';
import { Car, Search, Filter, History, MapPin } from 'lucide-react';
import BookingTable from '../components/BookingTable';
import * as adminAPI from '../../services/adminAPI';
import * as authAPI from '../../services/authAPI';

export default function Booking() {
  const [bookingData, setBookingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        let oid = localStorage.getItem('officeId');
        if (!oid || oid === '[object Object]') {
          const profile = await authAPI.getUserProfile();
          oid = typeof profile.office_id === 'object' ? profile.office_id._id : profile.office_id;
          localStorage.setItem('officeId', oid);
        }
        
        const rides = await adminAPI.getOfficeRidesHistory(oid);
        setBookingData(rides || []);
      } catch (error) {
        console.error("Failed to load booking history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const filteredData = searchTerm.length >= 3 
    ? bookingData.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        const fullName = `${item.employee_id?.name?.first_name || ''} ${item.employee_id?.name?.last_name || ''}`.toLowerCase();
        const status = item.status?.toLowerCase() || '';
        const dest = item.destination_type?.toLowerCase() || '';
        const batchId = (item.batch_id || item._id || '').toLowerCase();
        
        return fullName.includes(searchStr) || 
               status.includes(searchStr) || 
               dest.includes(searchStr) ||
               batchId.includes(searchStr);
      })
    : bookingData;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Ride History</h1>
          <p className="text-dash-muted mt-1 font-medium">View all previous ride histories.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-dash-border flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dash-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            className="w-full pl-12 pr-4 py-3 bg-dash-bg border-transparent rounded-xl focus:ring-2 focus:ring-dash-blue/10 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-3 bg-dash-bg rounded-xl text-dash-muted hover:text-dash-text transition-colors">
          <Filter size={20} />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
         <h2 className="text-xl font-bold text-dash-text mb-6">User Rides History</h2>
         {loading ? (
           <div className="flex justify-center items-center h-48 text-dash-muted font-bold animate-pulse">
             Loading ride history...
           </div>
         ) : filteredData.length > 0 ? (
           <BookingTable data={filteredData} />
         ) : (
           <div className="flex flex-col items-center justify-center h-48 text-dash-muted space-y-2">
             <div className="p-4 bg-dash-bg rounded-full">
               <Search size={24} />
             </div>
             <p className="font-bold text-sm italic">No matching bookings found for "{searchTerm}"</p>
           </div>
         )}
      </div>
    </div>
  );
}
