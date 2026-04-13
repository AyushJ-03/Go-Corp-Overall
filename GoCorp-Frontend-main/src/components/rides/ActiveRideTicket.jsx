import React, { useMemo, useEffect } from 'react';
import { MapLayer } from '../DashboardViews';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const driver = ride?.batch?.driver_id;
    const vehicle = driver?.vehicle;
    const isCompleted = ride?.status === 'COMPLETED';
    
    // Auto-recenter when status changes to COMPLETED to show the full route
    useEffect(() => {
        if (isCompleted) {
            setRecenterTrigger(prev => prev + 1);
        }
    }, [isCompleted, setRecenterTrigger]);

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
        <div className='min-h-screen bg-slate-50 flex flex-col font-sans select-none pb-32 text-slate-900 relative overflow-x-hidden'>
            {/* Background Glows - Subtler for Summary */}
            <div className={`absolute -top-32 -right-32 w-80 h-80 ${isCompleted ? 'bg-emerald-500/5' : 'bg-indigo-500/10'} rounded-full blur-[120px] pointer-events-none`}></div>
            <div className={`absolute top-1/2 -left-32 w-80 h-80 ${isCompleted ? 'bg-emerald-500/5' : 'bg-orange-400/10'} rounded-full blur-[120px] pointer-events-none`}></div>

            {/* Header / Sticky Bar */}
            <div className='sticky top-0 z-50 p-6 backdrop-blur-xl bg-white/60 border-b border-slate-200/60'>
                <div className='flex items-center gap-5'>
                    <button 
                        onClick={() => navigate('/my-rides')} 
                        className='w-12 h-12 bg-white hover:bg-slate-50 active:scale-90 transition-all rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group'
                    >
                        <svg className='w-5 h-5 group-hover:-translate-x-0.5 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M15 19l-7-7 7-7' /></svg>
                    </button>
                    <div className='min-w-0'>
                        <h1 className='text-2xl font-black tracking-tighter uppercase italic text-slate-900'>
                            {isCompleted ? 'Ride Summary' : 'Live Ticket'}
                        </h1>
                        <div className='flex items-center gap-2 opacity-50'>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`}></span>
                            <p className='text-[8px] font-black uppercase tracking-[0.2em]'>
                                {isCompleted ? 'Transaction Finalized' : 'System Live Tracking'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <motion.main 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='px-6 pt-10 space-y-8 max-w-lg mx-auto w-full'
            >
                {/* MAP VIEW */}
                <div className='relative w-full h-72 rounded-[2.5rem] overflow-hidden border border-white shadow-2xl'>
                    <MapLayer 
                        pickupPos={pPos}
                        destinationPos={dPos}
                        officePos={officePos}
                        polyline={polyline}
                        mapCenter={(!isCompleted && driverPos) ? driverPos : (pPos || [28.6273, 77.3725])}
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
                    <div className='absolute bottom-6 right-6 z-40'>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setRecenterTrigger(prev => prev + 1); }}
                            className='w-12 h-12 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl flex flex-col items-center justify-center text-white active:scale-95 transition-all'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.894L9 2l6 3 5.447-2.724A2 2 0 0121 4.118v9.764a2 2 0 01-1.553 1.894L15 19l-6 1z' /></svg>
                        </button>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`absolute top-6 left-6 z-40 ${isCompleted ? 'bg-emerald-600' : 'bg-indigo-600'} px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-white/20`}>
                        <span className='text-[9px] font-black text-white uppercase tracking-widest'>
                            {isCompleted ? '✓ Completed' : ride.status}
                        </span>
                    </div>
                </div>
                
                {/* OTP Section (Prominent under map) */}
                {!isCompleted && (
                    <div className='bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-700'>
                        <div className='flex items-center justify-between relative z-10'>
                            <div>
                                <p className='text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2'>Verification Required</p>
                                <h3 className='text-sm font-black uppercase text-white'>Ride Access OTP</h3>
                            </div>
                            <div className='flex items-center gap-2 bg-white/10 px-6 py-4 rounded-2xl'>
                                {ride.otp.split('').map((char, i) => (
                                    <span key={i} className='text-3xl font-black text-white'>{char}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className='bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-8'>
                    {/* Driver & Vehicle Details */}
                    <div className='space-y-6'>
                        <div className='flex items-center gap-5'>
                            <div className='shrink-0'>
                                <div className='w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-800 font-black text-2xl border border-slate-200 overflow-hidden'>
                                    {driver?.profile_pic ? (
                                        <img src={driver.profile_pic} alt="Driver" className='w-full h-full object-cover' />
                                    ) : (
                                        <span>{driver?.name?.first_name?.[0]}{driver?.name?.last_name?.[0] || 'D'}</span>
                                    )}
                                </div>
                            </div>
    
                            <div className='flex-1 min-w-0'>
                                <p className='text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1'>
                                    {isCompleted ? 'Your Driver' : 'Assigned Driver'}
                                </p>
                                <h2 className='text-2xl font-black text-slate-900 truncate tracking-tight mb-1'>
                                    {driver?.name?.first_name ? `${driver.name.first_name} ${driver?.name?.last_name || ''}` : 'Assigning...'}
                                </h2>
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs font-bold text-slate-400'>{vehicle?.color} {vehicle?.vehicleType}</span>
                                    {!isCompleted && (
                                        <span className='w-1 h-1 bg-slate-300 rounded-full'></span>
                                    )}
                                    {!isCompleted && (
                                        <span className='text-xs font-black text-slate-900 tracking-wider'>{vehicle?.license_plate}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Driver Contact Section - Dedicated Row Below */}
                        {!isCompleted && driver?.contact && (
                            <div className='bg-slate-50/80 rounded-3xl p-5 flex items-center justify-between border border-slate-100/50 shadow-sm'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm'>
                                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' /></svg>
                                    </div>
                                    <div>
                                        <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>Direct Contact</p>
                                        <p className='text-sm font-black text-slate-900 tracking-wider'>{driver.contact}</p>
                                    </div>
                                </div>
                                <a href={`tel:${driver.contact}`} className='px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all text-center'>
                                    Call Driver
                                </a>
                            </div>
                        )}
                    </div>

                    <div className='h-px bg-slate-100'></div>

                    {/* Trip Metrics Card */}
                    <div className='grid grid-cols-2 gap-6'>
                        <div className='space-y-1'>
                            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                                Your Share (Per Person)
                            </p>
                            <p className='text-3xl font-black text-slate-900 tracking-tight'>
                                <span className='text-base align-top mr-1'>₹</span>
                                {ride?.batch?.allocated_fare 
                                    ? Math.round(ride.batch.allocated_fare / (1 + (ride.invited_employee_ids?.length || 0)))
                                    : (ride?.batch?.estimated_fare || 'N/A')}
                            </p>
                        </div>
                        <div className='space-y-1'>
                            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                                Ride Distance
                            </p>
                            <p className='text-3xl font-black text-slate-900 tracking-tight'>
                                {(ride.batch?.solo_distance || ride.solo_distance) 
                                    ? Number(ride.batch?.solo_distance || ride.solo_distance).toFixed(2) 
                                    : (ride.batch?.estimated_distance ? Number(ride.batch.estimated_distance).toFixed(2) : '0')}
                                <span className='text-base ml-1 opacity-50 font-bold'>KM</span>
                            </p>
                        </div>
                    </div>

                    <div className='h-px bg-slate-100'></div>

                    {/* Group Manifest (Persistent after accepted) */}
                    <div className='bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-slate-100'>
                        <div className='flex items-center justify-between mb-6'>
                            <h3 className='text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]'>Ride Group</h3>
                            <span className='px-3 py-1 bg-slate-100 text-[8px] font-black tracking-widest uppercase rounded-full border border-slate-200'>
                                {ride.group_participants?.length || 1} Passengers
                            </span>
                        </div>
                        <div className='flex flex-wrap gap-4'>
                            {(ride.group_participants || [{ ...ride.employee_id, is_requester: true }]).map((emp, idx) => (
                                <div key={emp._id || idx} className={`flex flex-col items-center gap-2 group ${!emp.is_requester ? 'opacity-70' : ''} transition-all text-center`}>
                                    <div className={`w-12 h-12 ${emp.is_requester ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'} rounded-2xl flex items-center justify-center font-black text-xs border-2 border-white shadow-md group-hover:scale-110 transition-transform overflow-hidden`}>
                                        {emp.profile_image ? (
                                            <img src={emp.profile_image} alt={emp.name?.first_name} className='w-full h-full object-cover' />
                                        ) : (
                                            <span>{emp.name?.first_name?.charAt(0)}{emp.name?.last_name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <p className={`text-[7px] font-black ${emp.is_requester ? 'text-indigo-500' : 'text-slate-400'} uppercase tracking-widest`}>
                                        {emp.is_requester ? 'Requester' : 'Partner'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='h-px bg-slate-100'></div>

                    {/* Route Addresses */}
                    <div className='bg-slate-50/50 rounded-3xl p-6 space-y-6 relative overflow-hidden'>
                        <div className='absolute top-1/2 left-8 bottom-1/2 w-0.5 border-l-2 border-dashed border-slate-200 translate-y-[-50%] h-[30%]'></div>
                        
                        <div className='flex items-start gap-4 p-2 relative z-10'>
                            <div className='w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] mt-1 shrink-0 border-2 border-white'></div>
                            <div className='min-w-0'>
                                <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>From</p>
                                <p className='text-sm font-bold text-slate-900 leading-tight truncate'>{ride.pickup_address}</p>
                            </div>
                        </div>

                        <div className='flex items-start gap-4 p-2 relative z-10'>
                            <div className='w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)] mt-1 shrink-0 border-2 border-white'></div>
                            <div className='min-w-0'>
                                <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>To</p>
                                <p className='text-sm font-bold text-slate-900 leading-tight truncate'>{ride.drop_address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Actions */}
                <div className='pt-4 pb-10'>
                    {isCompleted ? (
                        <div className='space-y-6'>
                            <div className='flex flex-col items-center gap-4 py-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100'>
                                <div className='w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg'>
                                    <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={4} d='M5 13l4 4L19 7' /></svg>
                                </div>
                                <p className='text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]'>Thank you for riding!</p>
                            </div>
                            <button 
                                onClick={() => navigate('/my-rides')}
                                className='w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] shadow-xl active:scale-95 transition-all text-center'
                            >
                                View Ride History
                            </button>
                        </div>
                    ) : (ride.batch?.status === 'DRIVER_ACCEPTED' || !!ride.batch?.driver_accepted) ? (
                        <div className='space-y-3'>
                            <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest text-center'>
                                Rides accepted by driver cannot be cancelled
                            </p>
                            <button 
                                disabled
                                className='w-full py-6 bg-rose-100 text-rose-700 border border-rose-200 rounded-[2rem] text-[10px] font-black uppercase tracking-widest cursor-not-allowed shadow-inner'
                            >
                                {ride.is_owner ? 'Cancel Request' : 'Leave Ride'}
                            </button>
                        </div>
                    ) : (
                        <button 
                          onClick={onCancelRequest}
                          className='w-full py-6 bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all'
                        >
                          {ride.is_owner ? 'Cancel Request' : 'Leave Ride'}
                        </button>
                    )}
                </div>
            </motion.main>
        </div>
    );
};

export default ActiveRideTicket;

