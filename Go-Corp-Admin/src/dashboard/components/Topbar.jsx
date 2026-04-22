import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings as SettingsIcon, ChevronDown, User, LogOut, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as authAPI from '../../services/authAPI';
import * as walletAPI from '../../services/walletAPI';

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Administrator');
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user && user.name) {
      setUserName(user.name.first_name + ' ' + user.name.last_name);
    }
  }, []);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        let officeId = localStorage.getItem('officeId');
        
        if (!officeId || officeId === '[object Object]') {
          const profile = await authAPI.getUserProfile();
          officeId = typeof profile.office_id === 'object' ? profile.office_id._id : profile.office_id;
          if (officeId && officeId !== '[object Object]') {
              localStorage.setItem('officeId', officeId);
          }
        }

        if (officeId && officeId !== '[object Object]') {
          const wallet = await walletAPI.getWallet(officeId);
          if (wallet && typeof wallet.balance === 'number') {
            setWalletBalance(wallet.balance);
          } else if (wallet && wallet.data && typeof wallet.data.balance === 'number') {
            setWalletBalance(wallet.data.balance);
          }
        }
      } catch (error) {
        console.error('Failed to fetch wallet in Topbar:', error);
      }
    };
    fetchWallet();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logoutUser();
      setIsMenuOpen(false);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there's an error
      navigate('/login', { replace: true });
    }
  };
  const today = new Date().getDate();
  const dayAndMonth = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short'
  });

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-transparent relative z-50">
      {/* Date & Search */}
      <div className="flex items-center gap-6 flex-1">
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2 flex flex-col items-center justify-center min-w-[70px] shadow-sm">
          <span className="text-xl font-bold text-gray-900 leading-none">{today}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold mt-1">{dayAndMonth}</span>
        </div>

        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-white border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {walletBalance !== null && walletBalance < 2000 && (
            <div className="flex bg-red-50 text-red-600 px-4 py-2 rounded-2xl items-center gap-2 border border-red-200">
                <AlertCircle size={18} />
                <span className="text-sm font-bold">Low Balance: ₹{walletBalance.toLocaleString()}</span>
            </div>
        )}

        <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-3 text-gray-500 hover:bg-white hover:text-gray-900 rounded-2xl transition-all shadow-sm"
            >
              <Bell size={20} />
              {walletBalance !== null && walletBalance < 2000 && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
              )}
            </button>
            {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    {walletBalance !== null && walletBalance < 2000 ? (
                        <div className="px-4 py-4 hover:bg-red-50 transition-colors cursor-pointer border-l-4 border-red-500">
                            <p className="text-sm font-bold text-red-600">Action Required: Low Wallet Balance</p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">Your current balance is ₹{walletBalance.toLocaleString()}. Please recharge immediately to avoid interruption in ride booking services.</p>
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <p className="text-sm text-gray-500">No new notifications</p>
                        </div>
                    )}
                </div>
            )}
        </div>
        <button className="p-3 text-gray-500 hover:bg-white hover:text-gray-900 rounded-2xl transition-all shadow-sm">
          <SettingsIcon size={20} onClick={() => navigate('/dashboard/settings')}/>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-2" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 p-1 rounded-2xl hover:bg-white transition-all shadow-sm group ${isMenuOpen ? 'bg-white' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Natashia"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-[10px] text-gray-500">Office Admin</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 group-hover:text-gray-900 transition-all mr-2 ${isMenuOpen ? 'rotate-180 text-gray-900' : ''}`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
              <Link
                to="/dashboard/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <User size={18} />
                </div>
                <span className="font-semibold">My Profile</span>
              </Link>

              <div className="h-[1px] bg-gray-100 my-1 mx-4" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                  <LogOut size={18} />
                </div>
                <span className="font-semibold">Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
