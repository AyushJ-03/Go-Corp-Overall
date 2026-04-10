import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, percentage, color }) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-dash-border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dash-muted mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-dash-text">{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${colorMap[color] || 'bg-gray-100 text-gray-600'}`}>
          <Icon size={24} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-1">
        {trend === 'up' ? (
          <TrendingUp size={16} className="text-green-500" />
        ) : (
          <TrendingDown size={16} className="text-red-500" />
        )}
        <span className={`text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {percentage}%
        </span>
        <span className="text-[11px] text-dash-muted font-medium ml-1">increase from last month</span>
      </div>
    </div>
  );
}
