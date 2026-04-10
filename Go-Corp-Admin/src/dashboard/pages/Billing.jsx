import React from 'react';
import { Wallet, Landmark, TrendingUp, History, Download, PiggyBank, PieChart, ArrowUpRight } from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Billing() {
  const billingStats = [
    { title: 'Total Spend (Monthly)', value: '$12,450', icon: Landmark, trend: 'up', percentage: 5, color: 'blue' },
    { title: 'Ride Sharing Savings', value: '$3,820', icon: PiggyBank, trend: 'up', percentage: 15, color: 'green' },
    { title: 'Cost Per Employee (Avg)', value: '$85.20', icon: PieChart, trend: 'down', percentage: 2, color: 'blue' },
    { title: 'Pending Dues', value: '$0.00', icon: History, trend: 'down', percentage: 0, color: 'yellow' },
  ];

  const transactions = [
    { date: 'Oct 12, 2026', desc: 'Wallet Topup - UPI', type: 'Credit', amount: 5000, status: 'Success' },
    { date: 'Oct 11, 2026', desc: 'Daily Ride Batch (14 Rides)', type: 'Debit', amount: 1240, status: 'Success' },
    { date: 'Oct 10, 2026', desc: 'Service Fee Renewal', type: 'Debit', amount: 499, status: 'Success' },
    { date: 'Oct 09, 2026', desc: 'Wallet Topup - Credit Card', type: 'Credit', amount: 10000, status: 'Success' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Cost & Billing</h1>
          <p className="text-dash-muted mt-1 font-medium">Manage corporate wallet, track spends and sharing savings.</p>
        </div>
        <button className="bg-dash-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20">
          <Download size={18} />
          Export Statement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-dash-blue to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-blue-100 text-sm font-medium opacity-80 mb-2">Corporate Wallet Balance</p>
                <h2 className="text-4xl font-bold tracking-tight">$45,210.50</h2>
              </div>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <Wallet size={24} />
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider mb-1">Blocked Amount</p>
                <p className="text-lg font-bold">$1,250.00</p>
              </div>
              <div className="flex-1 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider mb-1">Last Recharge</p>
                <p className="text-lg font-bold">$10,000</p>
              </div>
            </div>

            <button className="w-full py-4 bg-white text-dash-blue rounded-2xl font-bold text-base hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group">
              Add Balance
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute top-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
        </div>

        {/* Billing Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {billingStats.map((stat, i) => (
            <StatsCard key={i} {...stat} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction History */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-dash-text">Recent Transactions</h3>
            <button className="text-sm font-bold text-dash-blue hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-dash-bg transition-colors border border-transparent hover:border-dash-border">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dash-text">{tx.desc}</h4>
                    <p className="text-[11px] text-dash-muted font-bold">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'Credit' ? 'text-green-600' : 'text-dash-text'}`}>
                    {tx.type === 'Credit' ? '+' : '-'}${tx.amount}
                  </p>
                  <p className="text-[10px] text-dash-muted font-bold uppercase tracking-wider">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Analysis Chart Placeholder */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-dash-bg flex items-center justify-center mb-6">
              <PieChart size={32} className="text-dash-blue" />
            </div>
            <h3 className="text-xl font-bold text-dash-text">Cost Analysis per Ride</h3>
            <p className="text-sm text-dash-muted mt-2 max-w-[300px] mb-8">Visualization of individual ride costs vs. shared ride savings across departments.</p>
            
            <div className="w-full h-48 flex items-end justify-between gap-4 px-8">
              {[60, 40, 90, 70, 50, 80, 65].map((h, i) => (
                <div key={i} className="flex-1 bg-dash-bg rounded-t-lg relative group">
                  <div 
                    className="w-full bg-dash-blue rounded-t-lg absolute bottom-0 transition-all duration-1000 group-hover:bg-blue-600" 
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dash-text text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${h*10}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full flex justify-between px-8 mt-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d} className="text-[10px] font-bold text-dash-muted uppercase">{d}</span>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
