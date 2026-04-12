import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Wallet, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Ride History', icon: Car, path: '/dashboard/booking' },
    { name: 'Finance', icon: Wallet, path: '/dashboard/finance' },
    { name: 'User Management', icon: Users, path: '/dashboard/employees' },
    { name: 'Reports', icon: BarChart3, path: '/dashboard/reports' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 dashboard-sidebar flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-yellow-400 p-2 rounded-lg">
          <Car size={24} className="text-black" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">RapidRides</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all
              ${isActive 
                ? 'bg-gray-100 text-gray-900 font-semibold' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 space-y-2 border-t border-gray-100">
        <NavLink
          to="/dashboard/help"
          className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all"
        >
          <HelpCircle size={20} />
          <span>Help & Support</span>
        </NavLink>
        <button
          className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all mt-10"
          onClick={() => window.location.href = '/'}
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
