import React, { useMemo } from 'react';
import { MapLayer } from '../DashboardViews';
import { motion } from 'framer-motion';

const ActiveRideTicket = ({ 
    ride, 
    id, 
    pPos, 
    dPos, 
    officePos, 
    polyline, 
    MapEventsHandler, 
    ChangeView, 
    recenterTrigger, 
    setRecenterTrigger, 
    onCancelRequest 
}) => {
    const driver = ride?.batch?.driver_id;
    const vehicle = driver?.vehicle;
    
    // Simple ETA calculation based on average speed (e.g. 25km/h = ~400m/min)
    const eta = useMemo(() => {
        if (!ride?.batch?.estimated_distance) return '5-8';
        return Math.ceil(ride.batch.estimated_distance * 2.5);
    }, [ride?.batch?.estimated_distance]);

    const driverPos = useMemo(() => {
        if (driver?.driver_location?.coordinates) {
            return [driver.driver_location.coordinates[1], driver.driver_location.coordinates[0]];
        }
        return null;
    }, [driver?.driver_location]);

    return (
        <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='px-6 pt-10 space-y-8 max-w-lg mx-auto w-full'
        >
            {/* LIVE MAP VIEW */}
            <div className='relative w-full h-80 rounded-[3rem] overflow-hidden border border-white/60 shadow-2xl'>
                <MapLayer 
                    pickupPos={pPos}
                    destinationPos={dPos}
                    officePos={officePos}
                    polyline={polyline}
                    mapCenter={driverPos || pPos || [28.6273, 77.3725]}
                    bookingStep='confirmSummary'
                    MapEventsHandler={MapEventsHandler}
                    ChangeView={ChangeView}
                    onMapMove={() => {}}
                    onReverseGeocode={() => {}}
                    onMoveStart={() => {}}
                    interactive={true}
                    fitBoundsTrigger={recenterTrigger}
                    onCurrentLocation={() => {}}
                    participants={ride.group_participants || []}
                    currentRideId={id}
                    destinationType={ride.destination_type}
                    showSequence={true}
                />
                
                {/* Map Interaction Controls */}
                <div className='absolute bottom-6 right-6 z-40 flex flex-col gap-3'>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setRecenterTrigger(prev => prev + 1);
                        }}
                        className='w-14 h-14 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white active:scale-90 transition-all border border-white/20 group hover:bg-slate-800'
                    >
                        <svg className='w-5 h-5 mb-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.894L9 2l6 3 5.447-2.724A2 2 0 0121 4.118v9.764a2 2 0 01-1.553 1.894L15 19l-6 1z' /></svg>
                        <span className='text-[7px] font-black uppercase tracking-tighter'>Route</span>
                    </button>
                </div>
                
                {/* Status Badge Over Map */}
                <div className='absolute top-6 left-6 z-40 bg-emerald-500/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 shadow-xl'>
                    <div className='w-2 h-2 rounded-full bg-white animate-pulse'></div>
                    <span className='text-[8px] font-black text-white uppercase tracking-widest'>Driver Accepted</span>
                </div>
            </div>

            {/* DRIVER INFOCARD */}
            <div className='bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white shadow-2xl relative overflow-hidden group'>
                <div className='flex items-center gap-6 relative z-10'>
                    <div className='w-20 h-20 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-xl overflow-hidden shrink-0'>
                        {driver?.profile_image ? (
                            <img src={driver.profile_image} alt="Driver" className='w-full h-full object-cover' />
                        ) : (
                            <span>{driver?.name?.first_name?.[0]}{driver?.name?.last_name?.[0]}</span>
                        )}
                    </div>
                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                            <h2 className='text-xl font-black text-slate-900 truncate uppercase tracking-tight'>
                                {driver?.name?.first_name} {driver?.name?.last_name}
                            </h2>
                            <div className='flex items-center gap-1 bg-amber-400 px-2 py-0.5 rounded-lg'>
                                <span className='text-[10px] font-black text-amber-900'>4.9</span>
                                <svg className='w-2.5 h-2.5 text-amber-900' fill='currentColor' viewBox='0 0 24 24'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/></svg>
                            </div>
                        </div>
                        <p className='text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3'>
                            {vehicle?.color} {vehicle?.vehicleType} • {vehicle?.license_plate}
                        </p>
                        <div className='flex gap-2'>
                            <a href={`tel:${driver?.contact}`} className='flex-1 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all'>
                                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' strokeWidth={2.5}/></svg>
                                Call
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ARRIVAL STATS */}
            <div className='grid grid-cols-2 gap-4'>
                <div className='bg-indigo-600 rounded-3xl p-6 text-white shadow-xl border border-white/10'>
                    <p className='text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70'>Arrival In</p>
                    <div className='flex items-baseline gap-1'>
                        <span className='text-4xl font-black tracking-tight'>{eta}</span>
                        <span className='text-xs font-black uppercase tracking-widest opacity-70'>Mins</span>
                    </div>
                </div>
                <div className='bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-sm flex flex-col justify-center'>
                    <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>Estimated Fare</p>
                    <div className='flex items-baseline gap-1'>
                        <span className='text-xs font-black text-slate-900'>₹</span>
                        <span className='text-4xl font-black text-slate-900 tracking-tight'>{ride?.batch?.estimated_fare || '-'}</span>
                    </div>
                </div>
            </div>

            {/* OTP Section */}
            <div className='bg-linear-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/10'>
                <div className='flex items-center justify-between relative z-20'>
                    <div>
                        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2'>Verification Code</p>
                        <h3 className='text-sm font-black uppercase tracking-widest text-white leading-none mb-1'>Ride OTP</h3>
                    </div>
                    <div className='flex items-center gap-2 bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl'>
                        {ride.otp.split('').map((char, i) => (
                            <span key={i} className='text-4xl font-black tracking-tight text-white'>{char}</span>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Action Meta */}
            <div className='flex flex-col items-center gap-6 pt-4'>
                <button 
                  onClick={onCancelRequest}
                  className='w-full py-6 bg-white/50 backdrop-blur-md text-rose-500 border border-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-lg active:scale-95 transition-all'
                >
                  Request Cancellation
                </button>
            </div>
        </motion.main>
    );
};

export default ActiveRideTicket;
