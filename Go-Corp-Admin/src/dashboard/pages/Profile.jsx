import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Camera, MapPin, Mail, Phone, Calendar, User as UserIcon, Save, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../../services/authAPI';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    profilePic: ''
  });
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setUser(data);
      setFormData({
        firstName: data.name?.first_name || '',
        lastName: data.name?.last_name || '',
        email: data.email || '',
        contact: data.contact || '',
        profilePic: data.profile_pic || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (e.g. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({ type: 'error', message: 'Image size too large (max 5MB)' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setFormData(prev => ({ ...prev, profilePic: base64 }));
        
        try {
          setUpdating(true);
          const updatedUser = await updateUserProfile({
            profile_pic: base64
          });
          setUser(updatedUser);
          setNotification({ type: 'success', message: 'Profile picture updated successfully!' });
        } catch (error) {
          console.error('Error auto-saving profile pic:', error);
          setNotification({ type: 'error', message: error.message || 'Failed to save profile picture' });
        } finally {
          setUpdating(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const updatedUser = await updateUserProfile({
        name: {
          first_name: formData.firstName,
          last_name: formData.lastName
        },
        contact: formData.contact,
        profile_pic: formData.profilePic
      });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#1a4d3a] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-500 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-100 text-green-700' 
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-bold">{notification.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1a4d3a]">My Profile</h1>
        {isEditing && (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
            >
              <X size={16} />
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={updating}
              className="flex items-center gap-2 bg-[#1a4d3a] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#143d2e] transition-all hover:shadow-lg disabled:opacity-50 active:scale-95"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-50 flex items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-100/50 transition-colors duration-500"></div>
        
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-gray-100 flex items-center justify-center">
            {formData.profilePic ? (
              <img 
                src={formData.profilePic} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={40} className="text-gray-400" />
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            className="hidden" 
            accept="image/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-white p-2 rounded-full border border-gray-100 shadow-lg text-[#1a4d3a] hover:bg-gray-50 transition-all hover:scale-110"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#1a4d3a]">
            {user?.name?.first_name} {user?.name?.last_name}
          </h2>
          <p className="text-gray-500 font-medium">{user?.role === 'OFFICE_ADMIN' ? 'Office Administrator' : user?.role}</p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            <MapPin size={14} />
            {user?.office_id?.name || 'Assigned Office'}
          </p>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold text-[#1a4d3a]">Personal Information</h3>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-[#f97316] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#ea580c] transition-all hover:shadow-lg hover:shadow-orange-200 active:scale-95"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">First Name</p>
            {isEditing ? (
              <input 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a] font-bold text-gray-900"
              />
            ) : (
              <p className="font-bold text-gray-900 text-lg">{user?.name?.first_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Last Name</p>
            {isEditing ? (
              <input 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a] font-bold text-gray-900"
              />
            ) : (
              <p className="font-bold text-gray-900 text-lg">{user?.name?.last_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Email Address</p>
            <p className="font-bold text-gray-900 text-lg">{user?.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Phone Number</p>
            {isEditing ? (
              <input 
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/20 focus:border-[#1a4d3a] font-bold text-gray-900"
              />
            ) : (
              <p className="font-bold text-gray-900 text-lg">{user?.contact}</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">User Role</p>
            <p className="font-bold text-gray-900 text-lg">{user?.role}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Office</p>
            <p className="font-bold text-gray-900 text-lg">{user?.office_id?.name}</p>
          </div>
        </div>
      </div>

      {/* Office Information Card */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold text-[#1a4d3a]">Office Location</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400">Office Name</p>
            <p className="font-bold text-gray-900 text-lg">{user?.office_id?.name}</p>
          </div>
          <div className="col-span-2 space-y-2">
            <p className="text-sm font-semibold text-gray-400">Address</p>
            <p className="font-bold text-gray-900 text-lg">
              {user?.office_id?.address?.address_line}, {user?.office_id?.address?.city}, {user?.office_id?.address?.state} - {user?.office_id?.address?.pincode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
