import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Home, MapPin, Package, CreditCard, Calendar, Hash } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [rideDetails, setRideDetails] = useState(null);
  const [transactionId] = useState('4051 3543 1002'); // Mocked as in image
  const [currentDate] = useState(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));

  useEffect(() => {
    const acceptedRide = localStorage.getItem('acceptedRide');
    const acceptedBatch = localStorage.getItem('acceptedBatch');
    
    if (acceptedBatch) {
      setRideDetails(JSON.parse(acceptedBatch));
    } else if (acceptedRide) {
      setRideDetails(JSON.parse(acceptedRide));
    }
  }, []);

  const fare = rideDetails?.estimatedFare || rideDetails?.fare || rideDetails?.price || '27.59';

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center px-6 pt-12 animate-fade-in relative overflow-hidden">
      {/* Decorative blurred background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl"></div>

      {/* Top Graphic - Recreating the Phone/Card feel with Icons */}
      <div className="relative mb-8 mt-4">
        <div className="w-40 h-40 bg-white rounded-3xl shadow-xl flex items-center justify-center relative overflow-hidden border border-gray-50">
           {/* Stylized Phone Frame */}
           <div className="w-24 h-32 border-2 border-gray-100 rounded-xl relative flex flex-col items-center pt-2">
              <div className="w-8 h-1 bg-gray-100 rounded-full mb-4"></div>
              <CreditCard size={48} className="text-gray-200" />
           </div>
           
           {/* Success Badge */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-[bounce_1s_ease-in-out]">
              <Check size={32} className="text-white font-bold" />
           </div>
        </div>
      </div>

      {/* Hero Text */}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Received</h1>
      <p className="text-center text-gray-400 font-medium mb-10 max-w-[280px]">
        Payment Received for the ride.
      </p>

      {/* Payment Details Section */}
      <div className="w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">Payment Details</h2>
        
        <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-50 space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-gray-400 font-semibold text-sm">Transaction ID</div>
            </div>
            <div className="text-gray-800 font-bold text-sm tracking-wide">{transactionId}</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-gray-400 font-semibold text-sm">Date</div>
            <div className="text-gray-800 font-bold text-sm">{currentDate}</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-gray-400 font-semibold text-sm">Type of Transaction</div>
            <div className="text-gray-800 font-bold text-sm">AutoPay</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-gray-400 font-semibold text-sm">Total</div>
            <div className="text-gray-800 font-extrabold text-lg">₹{fare}</div>
          </div>

          <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
            <div className="text-gray-400 font-semibold text-sm">Status</div>
            <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
              </div>
              Success
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md mt-auto mb-10 space-y-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 bg-[#FFFAF0] text-primary font-bold rounded-2xl shadow-sm border border-orange-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Transaction History
        </button>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full py-5 bg-primary hover:bg-primary-hover text-white font-extrabold rounded-2xl shadow-[0_10px_20px_rgba(242,148,0,0.25)] active:scale-[0.98] transition-all"
        >
          Back to Home
        </button>
      </div>

      {/* Home Indicator */}
      <div className="w-32 h-1.5 bg-gray-900 rounded-full mb-2 opacity-10"></div>
    </div>
  );
};

export default PaymentSuccessPage;
