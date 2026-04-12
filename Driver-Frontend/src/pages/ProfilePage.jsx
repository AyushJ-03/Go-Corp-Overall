import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, ChevronRight, CheckCircle, AlertCircle, Loader, LogOut } from 'lucide-react'
import { updateDriverProfile, logoutDriver } from '../services/driverAPI'

const ProfilePage = () => {
  const navigate = useNavigate()

  // Load driver data from localStorage
  const storedDriver = JSON.parse(localStorage.getItem('driver') || '{}')

  const getFullName = () => {
    const fn = storedDriver?.name?.first_name || ''
    const ln = storedDriver?.name?.last_name || ''
    return `${fn} ${ln}`.trim() || ''
  }

  const [name, setName] = useState(getFullName())
  const [phone, setPhone] = useState(storedDriver?.contact || '')
  const [email, setEmail] = useState(storedDriver?.email || '')
  const [city, setCity] = useState('Delhi, India')
  // Initialize avatar from stored profile_pic or null
  const [avatarSrc, setAvatarSrc] = useState(storedDriver?.profile_pic || null)
  const [avatarChanged, setAvatarChanged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success' | 'error', message: string }
  const fileInputRef = useRef(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Compress image before converting to Base64 to avoid storing huge strings
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 256
        const ratio = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/jpeg', 0.75)
        setAvatarSrc(compressed)
        setAvatarChanged(true)
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const handleUpdate = async () => {
    if (!name.trim()) {
      showToast('error', 'Name cannot be empty.')
      return
    }
    if (phone && !/^\d{10}$/.test(phone)) {
      showToast('error', 'Phone number must be exactly 10 digits.')
      return
    }

    setIsLoading(true)
    try {
      const payload = { name, email, contact: phone }
      // Only send profile_pic if it was changed (avoid sending large Base64 on every update)
      if (avatarChanged) {
        payload.profile_pic = avatarSrc
      }

      await updateDriverProfile(payload)
      setAvatarChanged(false)
      showToast('success', 'Profile updated successfully!')
    } catch (err) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Update failed. Please try again.')
      showToast('error', msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutDriver()
    } catch {
      // even if API fails, clear tokens and redirect
    } finally {
      localStorage.removeItem('driverToken')
      localStorage.removeItem('driver')
      navigate('/signin')
    }
  }

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-[#f7f7f9] font-['Inter',sans-serif] flex flex-col">

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} strokeWidth={2.5} />
          ) : (
            <AlertCircle size={18} strokeWidth={2.5} />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-[#f7f7f9]">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-700" strokeWidth={2.5} />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 tracking-tight">Your Profile</h1>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-[#f29400] flex items-center justify-center text-white text-3xl font-extrabold">
                {initials || '?'}
              </div>
            )}
          </div>
          {/* Edit badge */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#f29400] rounded-full flex items-center justify-center shadow-md border-2 border-white active:scale-95 transition-transform"
          >
            <Camera size={14} className="text-white" strokeWidth={2.5} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <p className="mt-3 text-sm text-gray-400 font-medium">
          {avatarChanged ? '✅ New photo selected — click Update to save' : 'Tap the camera to change photo'}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 space-y-5">

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f29400]/40 focus:border-[#f29400] transition-all shadow-sm"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit phone number"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f29400]/40 focus:border-[#f29400] transition-all shadow-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[15px] font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f29400]/40 focus:border-[#f29400] transition-all shadow-sm"
          />
        </div>

        {/* City You Drive In */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">City You Drive In</label>
          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[15px] font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f29400]/40 focus:border-[#f29400] transition-all shadow-sm appearance-none pr-12"
            >
              <option>Delhi, India</option>
              <option>Mumbai, India</option>
              <option>Bangalore, India</option>
              <option>Hyderabad, India</option>
              <option>Chennai, India</option>
              <option>Pune, India</option>
              <option>Kolkata, India</option>
              <option>Noida, India</option>
              <option>Gurgaon, India</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight size={20} className="text-gray-400 rotate-90" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Documents</label>
          <button
            onClick={() => showToast('success', 'Document update coming soon!')}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 flex items-center justify-between shadow-sm hover:bg-gray-50 active:scale-[0.99] transition-all"
          >
            <span className="text-[15px] font-semibold text-gray-800">Update Document Details</span>
            <ChevronRight size={20} className="text-[#f29400]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Vehicle Info (read-only) */}
        {storedDriver?.vehicle && (
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Vehicle</label>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-extrabold text-gray-800 capitalize">
                    {storedDriver.vehicle.vehicleType} · {storedDriver.vehicle.color}
                  </p>
                  <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">
                    {storedDriver.vehicle.license_plate} · {storedDriver.vehicle.capacity} seats
                  </p>
                </div>
                <span className="text-xs font-bold text-[#f29400] bg-orange-50 px-3 py-1 rounded-full capitalize">
                  {storedDriver.vehicle.vehicleType}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-white border-2 border-red-100 text-red-500 py-[16px] rounded-[50px] text-[15px] font-extrabold shadow-sm hover:bg-red-50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoggingOut ? (
            <Loader size={18} className="animate-spin" strokeWidth={2.5} />
          ) : (
            <LogOut size={18} strokeWidth={2.5} />
          )}
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>

        {/* Spacer so content clears the two fixed buttons */}
        <div className="h-28" />
      </div>

      {/* Fixed bottom bar: Logout + Update */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-5 pb-10 pt-5 bg-[#f7f7f9] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] space-y-3">
        {/* Logout button */}
        
        {/* Update button */}
        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className="w-full bg-[#f29400] text-white py-[18px] rounded-[50px] text-[16px] font-extrabold shadow-[0_10px_30px_rgba(242,148,0,0.35)] hover:bg-orange-500 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader size={18} className="animate-spin" strokeWidth={2.5} />
              Updating...
            </>
          ) : (
            'Update'
          )}
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
