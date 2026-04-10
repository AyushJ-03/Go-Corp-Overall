import React from 'react';
import { Pencil, Camera, MapPin, Mail, Phone, Calendar, User as UserIcon } from 'lucide-react';

export default function Profile() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1a4d3a]">My Profile</h1>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-50 flex items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-100/50 transition-colors duration-500"></div>
        
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-gray-100 shadow-lg text-[#1a4d3a] hover:bg-gray-50 transition-all hover:scale-110">
            <Camera size={16} />
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#1a4d3a]">Natashia Khaleira</h2>
          <p className="text-gray-500 font-medium">Admin</p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            <MapPin size={14} />
            Leeds, United Kingdom
          </p>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold text-[#1a4d3a]">Personal Information</h3>
          <button className="flex items-center gap-2 bg-[#f97316] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#ea580c] transition-all hover:shadow-lg hover:shadow-orange-200 active:scale-95">
            <Pencil size={16} />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">First Name</p>
            <p className="font-bold text-gray-900 text-lg">Natashia</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Last Name</p>
            <p className="font-bold text-gray-900 text-lg">Khaleira</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Date of Birth</p>
            <p className="font-bold text-gray-900 text-lg">12-10-1990</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Email Address</p>
            <p className="font-bold text-gray-900 text-lg">info@binary-fusion.com</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Phone Number</p>
            <p className="font-bold text-gray-900 text-lg">(+62) 821 2554-5846</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">User Role</p>
            <p className="font-bold text-gray-900 text-lg">Admin</p>
          </div>
        </div>
      </div>

      {/* Address Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold text-[#1a4d3a]">Address</h3>
          <button className="flex items-center gap-2 border border-gray-200 text-gray-500 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all active:scale-95">
            <Pencil size={16} />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Country</p>
            <p className="font-bold text-gray-900 text-lg">United Kingdom</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">City</p>
            <p className="font-bold text-gray-900 text-lg">Leeds, East London</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Postal Code</p>
            <p className="font-bold text-gray-900 text-lg">ERT 1254</p>
          </div>
        </div>
      </div>
    </div>
  );
}
