import React from 'react';
import { Clock, MapPin, X, Users, CreditCard, ChevronRight, Phone, Car, Navigation2, Building2 } from 'lucide-react';

export default function AdminRideSummaryCard({ ride, employee, onClose, onSelectBatchmate }) {
  // Use either the employee from the ride or the direct employee prop
  const activeEmployee = employee || ride?.employee_id;
  if (!activeEmployee) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'STARTED':
      case 'IN_TRANSIT': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_CLUSTERING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CLUSTERED':
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'OFFLINE': return 'bg-dash-bg text-dash-muted border-dash-border';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="w-full h-full animate-in slide-in-from-right-10 duration-700">
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-dash-border h-full flex flex-col relative overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-dash-text/5 hover:bg-dash-text/10 rounded-xl transition-all z-20"
        >
          <X size={18} className="text-dash-text" />
        </button>

        {/* User Header */}
        <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-dash-blue flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg shrink-0 overflow-hidden">
                {activeEmployee.profile_image ? (
                   <img src={activeEmployee.profile_image} alt="" className="w-full h-full object-cover" />
                ) : (
                   `${activeEmployee.name.first_name[0]}${activeEmployee.name.last_name[0]}`
                )}
            </div>
            <div className="min-w-0">
                <h3 className="text-lg font-bold text-dash-text truncate">{activeEmployee.name.first_name} {activeEmployee.name.last_name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border w-fit uppercase ${getStatusColor(ride?.status || 'OFFLINE')}`}>
                        {ride?.status || 'OFFLINE'}
                    </div>
                    {ride?.destination_type && (
                         <div className="px-2 py-0.5 rounded-lg text-[9px] font-bold border border-dash-border bg-dash-bg text-dash-muted uppercase">
                            {ride.destination_type === 'OFFICE' ? 'To Office' : 'To Home'}
                         </div>
                    )}
                </div>
            </div>
        </div>

        {ride ? (
            <div className="flex-1 flex flex-col gap-6">
                {/* Contact & Shift Quick Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-dash-bg/50 rounded-2xl border border-dash-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                            <Phone size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-dash-muted uppercase">Contact</p>
                            <p className="text-[11px] font-bold text-dash-text truncate">{activeEmployee.contact || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="p-3 bg-dash-bg/50 rounded-2xl border border-dash-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                            <Building2 size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-dash-muted uppercase">Shift</p>
                            <p className="text-[11px] font-bold text-dash-text truncate">
                                {ride.office_id?.shift_start || '09:00 AM'} - {ride.office_id?.shift_end || '06:00 PM'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Route Timeline */}
                <div className="relative space-y-4 px-2">
                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-gray-200" />
                    
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-sm shrink-0 z-10" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-dash-muted uppercase tracking-wider">Pickup</p>
                            <p className="text-sm font-bold text-dash-text truncate">{ride.pickup_address}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-rose-500 border-4 border-white shadow-sm shrink-0 z-10" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-dash-muted uppercase tracking-wider">Drop-off</p>
                            <p className="text-sm font-bold text-dash-text truncate">{ride.drop_address}</p>
                        </div>
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-dash-bg rounded-2xl border border-dash-border">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-dash-blue" />
                            <span className="text-[9px] font-bold text-dash-muted uppercase tracking-wider">Scheduled</span>
                        </div>
                        <p className="text-xs font-bold text-dash-text">{formatTime(ride.scheduled_at)}</p>
                    </div>
                    <div className="p-3 bg-dash-bg rounded-2xl border border-dash-border">
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard size={14} className="text-dash-blue" />
                            <span className="text-[9px] font-bold text-dash-muted uppercase tracking-wider">Est. Fare</span>
                        </div>
                        <p className="text-xs font-bold text-dash-text">₹{ride.allocated_fare || ride.batch?.estimated_fare || ride.estimated_fare || 0}</p>
                    </div>
                </div>

                {/* Driver / Vehicle Details */}
                {(ride.batch?.driver_id || ride.driver_id) && (
                    <div className="p-4 bg-dash-blue rounded-[1.5rem] text-white shadow-lg shadow-dash-blue/20">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Car size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/70 uppercase">Transit Assigned</p>
                                <p className="text-sm font-bold">Vehicle Details</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold text-white/70 uppercase">Driver</p>
                                <p className="font-bold">{ride.batch?.driver_id?.name || ride.driver_id?.name || 'Assigned Driver'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-white/70 uppercase">License Plate</p>
                                <div className="bg-white text-dash-blue px-2 py-1 rounded-lg text-xs font-black mt-1 uppercase tracking-wider">
                                    {ride.batch?.driver_id?.vehicle?.plate || 'MH-01-AB-1234'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Batchmates Section */}
                {ride.group_participants && ride.group_participants.length > 1 && (
                    <div className="space-y-3">
                         <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-extrabold text-dash-muted uppercase tracking-widest">In Same Vehicle ({ride.group_participants.length})</h4>
                            <Users size={14} className="text-dash-muted" />
                         </div>
                         <div className="flex flex-col gap-2">
                            {ride.group_participants.map((participant) => {
                                const isCurrent = participant._id === activeEmployee._id;
                                return (
                                    <button 
                                        key={participant._id}
                                        onClick={() => !isCurrent && onSelectBatchmate && onSelectBatchmate(participant)}
                                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isCurrent ? 'bg-dash-blue/5 border-dash-blue/20 cursor-default' : 'bg-white border-dash-border hover:border-dash-blue/50 hover:shadow-sm'}`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-dash-bg flex items-center justify-center text-dash-muted font-bold text-[10px] overflow-hidden">
                                                {participant.profile_image ? (
                                                    <img src={participant.profile_image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    `${participant.name.first_name[0]}${participant.name.last_name[0]}`
                                                )}
                                            </div>
                                            <div className="text-left min-w-0">
                                                <p className={`text-xs font-bold truncate ${isCurrent ? 'text-dash-blue' : 'text-dash-text'}`}>
                                                    {participant.name.first_name} {participant.name.last_name}
                                                    {isCurrent && <span className="ml-1 text-[8px] font-black uppercase">(Viewing)</span>}
                                                </p>
                                                <p className="text-[9px] text-dash-muted truncate">{participant.email}</p>
                                            </div>
                                        </div>
                                        {!isCurrent && <ChevronRight size={14} className="text-dash-muted" />}
                                    </button>
                                );
                            })}
                         </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-dash-bg/50 rounded-3xl border border-dashed border-dash-border">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-dash-muted mb-3 border border-dash-border">
                    <MapPin size={24} />
                </div>
                <h4 className="text-sm font-bold text-dash-text mb-1">No Active Trip</h4>
                <p className="text-[11px] text-dash-muted leading-relaxed">
                    This employee does not have any active ride requests scheduled for the current shift.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}

