import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, DollarSign, MapPin, Navigation, ArrowRight, Wallet } from 'lucide-react';
import Button from '../components/Button';

const CompleteRidePage = () => {
    const navigate = useNavigate();
    const [batchData, setBatchData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const acceptedBatch = localStorage.getItem('acceptedBatch');
        if (acceptedBatch) {
            setBatchData(JSON.parse(acceptedBatch));
        }
    }, []);

    const handleFinish = async () => {
        setLoading(true);
        try {
            const batchId = batchData?.batchId || batchData?._id;
            
            if (!batchId) {
                console.error("No batch ID found for completion");
                navigate('/dashboard');
                return;
            }

            // Call backend to mark batch as completed
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/polling/batch/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('driverToken')}`
                },
                body: JSON.stringify({ batch_id: batchId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to complete batch:", errorData);
                // We still navigate to success because the physical ride is done
            }

            // Success Page will handle the final view of these details
            navigate('/payment-success');
        } catch (error) {
            console.error("Error completing ride:", error);
            navigate('/payment-success');
        } finally {
            setLoading(false);
        }
    };

    const fare = batchData?.estimatedFare || '0.00';
    const passengerCount = batchData?.rides?.length || 0;

    return (
        <div className="min-h-screen bg-[#FDFBF9] flex flex-col animate-fade-in relative overflow-hidden">
            {/* Decorative background gradients */}
            <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-200 rounded-full blur-[100px]"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 pt-16 px-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-[30px] mb-6 shadow-sm border-4 border-white">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Trip Summary</h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Mission Accomplished</p>
            </div>

            {/* Fare Summary Card */}
            <div className="relative z-10 px-6 mt-10">
                <div className="bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                    
                    <div className="flex flex-col items-center mb-10">
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">Total Earnings</p>
                        <div className="flex items-start gap-1">
                            <span className="text-2xl font-black text-primary mt-1">₹</span>
                            <span className="text-6xl font-black text-slate-900 tracking-tighter">{fare}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100/50">
                            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                                <Navigation size={16} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Distance</p>
                            <p className="text-xl font-black text-slate-800">{batchData?.estimatedDistance || '8.4'} <span className="text-xs">km</span></p>
                        </div>
                        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100/50">
                            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-primary mb-3">
                                <DollarSign size={16} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Passengers</p>
                            <p className="text-xl font-black text-slate-800">{passengerCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ride List Summary */}
            <div className="relative z-10 px-6 mt-8 mb-32">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Batch Details</h3>
                <div className="space-y-3">
                    {batchData?.rides?.map((ride, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black">
                                {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate">{ride.employeeName}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate tracking-wide">Drop Off Completed</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 size={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Footer */}
            <div className="mt-auto relative z-20 px-6 pb-12 pt-6 bg-gradient-to-t from-[#FDFBF9] via-[#FDFBF9] to-transparent">
                <Button 
                    className="w-full py-6 text-lg font-black shadow-[0_20px_40px_rgba(242,148,0,0.3)] group"
                    onClick={handleFinish}
                    disabled={loading}
                >
                    <div className="flex items-center justify-center gap-3">
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Wallet size={24} className="group-hover:scale-110 transition-transform" />
                                <span>COLLECT CASH & FINISH</span>
                                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </div>
                </Button>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/10 rounded-full z-30"></div>
        </div>
    );
};

export default CompleteRidePage;
