import React, { useState } from 'react';
import { 
  DollarSign, 
  Lock, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  ChevronRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Finance() {
  const [showAddFund, setShowAddFund] = useState(false);
  const [fundAmount, setFundAmount] = useState('');

  const financialStats = [
    { title: 'Total Balance', value: '₹1,24,580', icon: DollarSign, trend: 'up', percentage: 15, color: 'green' },
    { title: 'Blocked Amount', value: '₹12,400', icon: Lock, trend: 'down', percentage: 5, color: 'red' },
  ];

  const recentTransactions = [
    { id: 1, date: '2026-04-10', type: 'Credit', description: 'Ride Earnings - Route #1245', amount: 450, status: 'Completed' },
    { id: 2, date: '2026-04-10', type: 'Debit', description: 'Withdrawal to Bank Account', amount: -5000, status: 'Processing' },
    { id: 3, date: '2026-04-09', type: 'Credit', description: 'Bonus Incentive', amount: 1000, status: 'Completed' },
    { id: 4, date: '2026-04-09', type: 'Debit', description: 'Commission Charge', amount: -250, status: 'Completed' },
    { id: 5, date: '2026-04-08', type: 'Credit', description: 'Ride Earnings - Route #1198', amount: 680, status: 'Completed' },
    { id: 6, date: '2026-04-08', type: 'Credit', description: 'Referral Bonus', amount: 500, status: 'Completed' },
    { id: 7, date: '2026-04-07', type: 'Debit', description: 'Wallet Maintenance Fee', amount: -50, status: 'Completed' },
    { id: 8, date: '2026-04-07', type: 'Credit', description: 'Weekend Bonus', amount: 2000, status: 'Completed' },
  ];

  const handleAddFund = (e) => {
    e.preventDefault();
    if (fundAmount) {
      console.log('Adding fund:', fundAmount);
      setFundAmount('');
      setShowAddFund(false);
      // Here you would typically call an API to add funds
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-dash-text">Finance & Wallet</h1>
          <p className="text-dash-muted mt-1 font-medium">Manage your balance, earnings, and transactions.</p>
        </div>
        <button 
          onClick={() => setShowAddFund(!showAddFund)}
          className="bg-dash-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-dash-blue/20"
        >
          <Plus size={18} />
          Add Funds
        </button>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialStats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Add Funds Modal */}
      {showAddFund && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-dash-text">Add Funds to Wallet</h3>
            <button 
              onClick={() => setShowAddFund(false)}
              className="text-dash-muted hover:text-dash-text text-2xl"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleAddFund} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-dash-text mb-3">Enter Amount (₹)</label>
              <input 
                type="number" 
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                placeholder="Enter amount to add"
                className="w-full px-4 py-3 border border-dash-border rounded-xl focus:outline-none focus:ring-2 focus:ring-dash-blue text-dash-text placeholder-dash-muted font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[500, 1000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFundAmount(amount.toString())}
                  className="py-3 px-4 bg-dash-bg hover:bg-dash-blue hover:text-white text-dash-text font-bold rounded-xl transition-all border border-dash-border"
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-dash-text font-bold">
                💳 You will be redirected to payment gateway to complete the transaction.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit"
                className="flex-1 bg-dash-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all"
              >
                Continue to Payment
              </button>
              <button 
                type="button"
                onClick={() => setShowAddFund(false)}
                className="flex-1 bg-dash-bg text-dash-text py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-[2.5rem] p-6 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-200 rounded-xl">
              <ArrowDownLeft size={24} className="text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-white px-3 py-1 rounded-lg">This Month</span>
          </div>
          <p className="text-dash-muted text-sm font-bold">Total Received</p>
          <p className="text-2xl font-bold text-green-600 mt-2">₹14,230</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-[2.5rem] p-6 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-200 rounded-xl">
              <ArrowUpRight size={24} className="text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-white px-3 py-1 rounded-lg">This Month</span>
          </div>
          <p className="text-dash-muted text-sm font-bold">Total Paid Out</p>
          <p className="text-2xl font-bold text-red-600 mt-2">₹5,250</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[2.5rem] p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-200 rounded-xl">
              <Download size={24} className="text-dash-blue" />
            </div>
            <span className="text-xs font-bold text-dash-blue bg-white px-3 py-1 rounded-lg">Download</span>
          </div>
          <p className="text-dash-muted text-sm font-bold">Export Statement</p>
          <p className="text-lg font-bold text-dash-text mt-2">PDF / CSV</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-2xl font-bold text-dash-text">Recent Transactions</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-dash-border text-sm font-bold hover:bg-dash-bg transition-all shadow-sm">
              <Filter size={16} />
              All Transactions
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-dash-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dash-bg border-b border-dash-border">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-dash-muted uppercase">Date</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-dash-muted uppercase">Description</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-dash-muted uppercase">Type</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-dash-muted uppercase">Amount</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-dash-muted uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-dash-bg transition-colors">
                    <td className="px-8 py-4">
                      <span className="text-sm font-bold text-dash-text">{transaction.date}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-sm font-bold text-dash-text">{transaction.description}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 w-fit">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'Credit' 
                            ? 'bg-green-100' 
                            : 'bg-red-100'
                        }`}>
                          {transaction.type === 'Credit' ? (
                            <ArrowDownLeft size={16} className="text-green-600" />
                          ) : (
                            <ArrowUpRight size={16} className="text-red-600" />
                          )}
                        </div>
                        <span className={`text-sm font-bold ${
                          transaction.type === 'Credit' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`text-sm font-bold ${
                        transaction.amount > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        transaction.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-dash-border">
        <h3 className="text-xl font-bold text-dash-text mb-6">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-dash-border rounded-2xl hover:bg-dash-bg transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-dash-muted">Debit Card</span>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Primary</span>
            </div>
            <p className="text-lg font-bold text-dash-text">**** **** **** 4242</p>
            <p className="text-xs text-dash-muted mt-2">Expires: 12/25</p>
          </div>

          <div className="p-6 border border-dash-border rounded-2xl hover:bg-dash-bg transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-dash-muted">Bank Account</span>
            </div>
            <p className="text-lg font-bold text-dash-text">ICIC...****8901</p>
            <p className="text-xs text-dash-muted mt-2">Savings Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
