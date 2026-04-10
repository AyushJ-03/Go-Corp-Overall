import React from 'react';
import { MoreHorizontal, Star } from 'lucide-react';

export default function BookingTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead>
          <tr className="text-dash-muted text-xs uppercase font-bold tracking-wider">
            <th className="px-6 py-2">No.</th>
            <th className="px-6 py-2">Car no.</th>
            <th className="px-6 py-2">Driver</th>
            <th className="px-6 py-2">Location</th>
            <th className="px-6 py-2">Earning</th>
            <th className="px-6 py-2 text-center">Status</th>
            <th className="px-6 py-2">Rating</th>
            <th className="px-6 py-2"></th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {data.map((item, index) => (
            <tr key={index} className="bg-white hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 rounded-l-2xl text-sm font-semibold text-dash-text border-y border-dash-border border-l first:border-l">
                {String(index + 1).padStart(2, '0')}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-dash-text border-y border-dash-border">
                {item.carNo}
              </td>
              <td className="px-6 py-4 border-y border-dash-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.driver}`} 
                      alt={item.driver} 
                    />
                  </div>
                  <span className="text-sm font-medium text-dash-text">{item.driver}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-dash-muted font-medium border-y border-dash-border">
                {item.location}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-dash-text border-y border-dash-border">
                ${item.earning}
              </td>
              <td className="px-6 py-4 border-y border-dash-border">
                <div className="flex justify-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    item.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                    item.status === 'Delayed' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 
                    'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  }`} />
                </div>
              </td>
              <td className="px-6 py-4 border-y border-dash-border">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-dash-text">{item.rating}</span>
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
