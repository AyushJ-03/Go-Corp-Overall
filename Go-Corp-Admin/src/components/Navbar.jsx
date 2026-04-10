import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="w-full px-6 py-6 md:px-12 flex items-center justify-between relative z-20">
            <div className="flex items-center gap-3">
                {/* Logo Mark */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-500 relative flex items-center justify-center shadow-lg">
                    <div className="bg-white translate-y-[2px] w-[14px] h-[14px] rounded-full absolute bottom-[6px] right-[6px]" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
                    <div className="bg-white w-[14px] h-[14px] rounded-full absolute top-[6px] left-[6px]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                </div>
                {/* Brand Name */}
                <span className="text-xl font-bold tracking-tight text-white">GoCorp</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <a href="#solutions" className="text-[15px] font-semibold text-gray-200 hover:text-white transition-colors">Solutions</a>
                <a href="#company" className="text-[15px] font-semibold text-gray-200 hover:text-white transition-colors">Company</a>
                <Link to="/dashboard" className="text-[15px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group">
                    Dashboard 
                    <span className="text-[10px] bg-blue-500/20 px-1.5 rounded-md group-hover:bg-blue-500/30">New</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-[15px] font-semibold transition-all">
                    Need Help?
                </button>
            </div>
        </nav>
    );
}

