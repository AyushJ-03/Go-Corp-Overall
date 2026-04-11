import React from 'react';
import { MoreHorizontal, Star } from 'lucide-react';

export default function BookingTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-dash-muted text-xs uppercase font-bold tracking-wider">
            <th className="px-6 py-2">Batch ID</th>
            <th className="px-6 py-2">Employees</th>
            <th className="px-6 py-2">Destination</th>
            <th className="px-6 py-2">Fare</th>
            <th className="px-6 py-2 text-center">Status</th>
            <th className="px-6 py-2"></th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {data.map((item, index) => (
            <tr key={index} className="bg-white hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 rounded-l-2xl text-sm font-bold text-dash-text border-y border-dash-border border-l first:border-l">
                #{item.batch_id?.slice(-6).toUpperCase() || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-dash-text border-y border-dash-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-dash-blue/10 flex items-center justify-center text-dash-blue font-bold text-xs">
                    {item.size || 1}
                  </div>
                  <span>{item.size || 1} Person(s)</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-dash-muted font-medium border-y border-dash-border">
                Office HQ
              </td>
              <td className="px-6 py-4 text-sm font-bold text-dash-text border-y border-dash-border">
                ₹{item.estimated_fare || item.earning || 0}
              </td>
              <td className="px-6 py-4 border-y border-dash-border">
                <div className="flex justify-center">
                   <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                     item.status === 'Active' || item.status === 'CREATED' ? 'bg-green-100 text-green-700' : 
                     item.status === 'Delayed' || item.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-700' : 
                     'bg-red-100 text-red-700'
                   }`}>
                     {item.status}
                   </span>
                </div>
              </td>
              <td className="px-6 py-4 rounded-r-2xl border-y border-dash-border border-r">
                <button className="p-2 text-dash-muted hover:text-dash-text transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
