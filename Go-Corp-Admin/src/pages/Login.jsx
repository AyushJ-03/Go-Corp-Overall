import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Chrome, Shield, Globe, Landmark, Building2, Trees } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-white font-sans flex text-gray-900">
      {/* Left Side: Form Content */}
      <div className="w-full lg:w-[55%] p-8 md:p-16 flex flex-col justify-between">
        {/* Header: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-500 relative flex items-center justify-center shadow-lg">
            <div className="bg-white translate-y-[2px] w-[14px] h-[14px] rounded-full absolute bottom-[6px] right-[6px]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
            <div className="bg-white w-[14px] h-[14px] rounded-full absolute top-[6px] left-[6px]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">GoCorp</span>
        </div>

        {/* Main Form Area */}
        <div className="max-w-[420px] w-full mx-auto my-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-gray-500 mb-8 font-medium">Please enter your details to sign in.</p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@gocorp.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="text-sm font-medium text-gray-600">Remember me for 30 days</label>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
              Sign in to GoCorp
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-bold tracking-widest">OR</span>
              </div>
            </div>

            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
              <Chrome size={20} />
              Sign in with Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create account</Link>
          </p>
        </div>

        {/* Footer: Social Proof / Partner Logos */}
        <div className="pt-8 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Trusted by governments & organizations</p>
          <div className="flex flex-wrap items-center gap-8 opacity-40 grayscale hover:opacity-60 transition-opacity">
            <div className="flex items-center gap-1.5 grayscale">
              <Shield size={24} />
              <span className="text-[9px] font-black uppercase leading-[1]">FL State</span>
            </div>
            <div className="flex items-center gap-1.5 grayscale">
              <Landmark size={24} />
              <span className="text-[9px] font-black uppercase leading-[1]">Agency</span>
            </div>
            <div className="flex items-center gap-1.5 grayscale">
              <Globe size={24} />
              <span className="text-[9px] font-black uppercase leading-[1]">DARS VA</span>
            </div>
            <div className="flex items-center gap-1.5 grayscale">
              <Building2 size={24} />
              <span className="text-[9px] font-black uppercase leading-[1]">Choctaw</span>
            </div>
            <div className="flex items-center gap-1.5 grayscale">
              <Trees size={24} />
              <span className="text-[9px] font-black uppercase leading-[1]">DPHHS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Artwork */}
      <div className="hidden lg:block w-[45%] bg-[#f8fafc] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-3xl z-0"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
            {/* The generated artwork */}
            <div className="w-full max-w-[600px] aspect-square relative group">
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full scale-75 animate-pulse"></div>
                <img 
                    src="/auth-artwork.png" 
                    alt="Corporate Logistics Artwork" 
                    className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-105"
                />
            </div>
            
            <div className="mt-12 space-y-4 max-w-sm">
                <h2 className="text-2xl font-bold text-gray-900">Empowering Smart Governance</h2>
                <p className="text-gray-600 font-medium">Join thousands of agencies optimizing their logistics, resources, and impact with GoCorp's unified platform.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
