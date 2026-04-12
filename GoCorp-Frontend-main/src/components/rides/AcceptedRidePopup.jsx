import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AcceptedRidePopup = ({ visible, driver, onViewTicket, onDismiss }) => {
  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-x-0 top-10 z-[1000] flex justify-center px-6 pointer-events-none">
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 pointer-events-auto flex items-center gap-4 group"
          >
            {/* Driver Avatar */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-white text-lg border-2 border-white/20 overflow-hidden">
                {driver?.profile_image ? (
                  <img src={driver.profile_image} alt={driver.name?.first_name} className="w-full h-full object-cover" />
                ) : (
                  <span>{driver?.name?.first_name?.[0]}{driver?.name?.last_name?.[0]}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5">Driver Found</p>
              <h3 className="text-sm font-black text-white truncate leading-none mb-1">
                {driver?.name?.first_name} {driver?.name?.last_name} is on the way!
              </h3>
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest truncate">
                {driver?.vehicle?.color} {driver?.vehicle?.vehicleType} • {driver?.vehicle?.license_plate}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 shrink-0">
                <button 
                  onClick={onViewTicket}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  View Ticket
                </button>
                <button 
                  onClick={onDismiss}
                  className="px-4 py-1 text-[8px] font-black text-white/30 hover:text-white/60 uppercase tracking-widest transition-all"
                >
                  Dismiss
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AcceptedRidePopup;
