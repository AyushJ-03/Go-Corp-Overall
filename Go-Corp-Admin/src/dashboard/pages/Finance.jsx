import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Lock, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Download,
  Filter,
  ChevronRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import * as walletAPI from '../../services/walletAPI';

export default function Finance() {
  const [showAddFund, setShowAddFund] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get office ID from localStorage (set during login/auth)
  const getOfficeId = () => {
    const storedId = localStorage.getItem('officeId');
    // If it's corrupted or missing, try to get it from the user object
    if (!storedId || storedId === '[object Object]') {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        return user?.office_id?._id || user?.office_id || null;
      } catch (e) {
        return null;
      }
    }
    return storedId;
  };

  const officeId = getOfficeId();

  useEffect(() => {
    if (officeId) {
      fetchWalletData();
    } else {
      setError('Office session not found. Please log in again.');
      setLoading(false);
    }
  }, [officeId]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data in parallel
      const [walletData, transactionsData] = await Promise.all([
        walletAPI.getWallet(officeId),
        walletAPI.getTransactions(officeId)
      ]);
      
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch wallet data');
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const financialStats = [
    { 
      title: 'Current Balance', 
      value: wallet ? `₹${(wallet.balance || 0).toLocaleString()}` : '₹0', 
      icon: DollarSign, 
      trend: 'up', 
      percentage: 12, 
      color: 'blue' 
    },
    { 
      title: 'Total Spent', 
      value: `₹${transactions
        .filter(t => t.type === 'DEBIT')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
        .toLocaleString()}`, 
      icon: ArrowUpRight, 
      trend: 'up', 
      percentage: 8, 
      color: 'red' 
    },
    { 
      title: 'Blocked for Rides', 
      value: wallet ? `₹${(wallet.blockedBalance || 0).toLocaleString()}` : '₹0', 
      icon: Lock, 
      trend: 'down', 
      percentage: 3, 
      color: 'yellow' 
    },
    { 
      title: 'Average/Ride', 
      value: transactions.filter(t => t.type === 'DEBIT').length > 0
        ? `₹${Math.round(transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) / transactions.filter(t => t.type === 'DEBIT').length).toLocaleString()}`
        : '₹0', 
      icon: ChevronRight, 
      trend: 'up', 
      percentage: 2, 
      color: 'green' 
    },
  ];

  // Calculate monthly totals
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTotals = {
    received: transactions
      .filter(t => {
        const d = new Date(t.createdAt);
        return t.type === 'CREDIT' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    paid: transactions
      .filter(t => {
        const d = new Date(t.createdAt);
        return t.type === 'DEBIT' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ['Date', 'Description', 'Type', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        new Date(t.createdAt).toLocaleDateString(),
        `"${t.description || ''}"`,
        t.type,
        t.amount,
        t.status || 'SUCCESS'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddFund = async (e) => {
    e.preventDefault();
    if (!fundAmount || isNaN(fundAmount) || parseFloat(fundAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      // Call real backend endpoint
      await walletAPI.addMoney(officeId, parseFloat(fundAmount));
      
      // Visual feedback: brief delay to simulate processing and let backend settle
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh wallet data
      await fetchWalletData();
      
      setFundAmount('');
      setShowAddFund(false);
      // Logic for toast could go here
    } catch (err) {
      setError(err.message || 'Failed to add funds. Please check your connection.');
      console.error('Error adding funds:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTransactionType = (type) => {
    const typeMap = {
      'CREDIT': 'Recharge',
      'DEBIT': 'Ride Payment',
      'BLOCK': 'Fare Blocked',
      'RELEASE': 'Refund/Release',
    };
    return typeMap[type?.toUpperCase()] || type;
  };

  const getStatusBadgeColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dash-blue mx-auto mb-4"></div>
            <p className="text-dash-text font-bold">Loading wallet data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

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
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[500, 1000, 5000, 10000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFundAmount(amount.toString())}
                  disabled={isProcessing}
                  className="py-3 px-4 bg-dash-bg hover:bg-dash-blue hover:text-white text-dash-text font-bold rounded-xl transition-all border border-dash-border disabled:opacity-50"
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
                disabled={isProcessing}
                className="flex-1 bg-dash-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
              </button>
              <button 
                type="button"
                onClick={() => setShowAddFund(false)}
                disabled={isProcessing}
                className="flex-1 bg-dash-bg text-dash-text py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
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
          <p className="text-2xl font-bold text-green-600 mt-2">₹{monthlyTotals.received.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-[2.5rem] p-6 border border-red-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-200 rounded-xl">
              <ArrowUpRight size={24} className="text-red-600" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-white px-3 py-1 rounded-lg">This Month</span>
          </div>
          <p className="text-dash-muted text-sm font-bold">Total Paid Out</p>
          <p className="text-2xl font-bold text-red-600 mt-2">₹{monthlyTotals.paid.toLocaleString()}</p>
        </div>

        <div 
          onClick={handleExportCSV}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[2.5rem] p-6 border border-blue-200 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-200 rounded-xl">
              <Download size={24} className="text-dash-blue" />
            </div>
            <span className="text-xs font-bold text-dash-blue bg-white px-3 py-1 rounded-lg">Download</span>
          </div>
          <p className="text-dash-muted text-sm font-bold">Export Statement</p>
          <p className="text-lg font-bold text-dash-text mt-2">Export CSV</p>
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
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-dash-muted font-bold">No transactions yet</p>
            </div>
          ) : (
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
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-dash-bg transition-colors">
                      <td className="px-8 py-4">
                        <span className="text-sm font-bold text-dash-text">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-bold text-dash-text">{transaction.description}</span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 w-fit">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'CREDIT' 
                              ? 'bg-green-100' 
                              : transaction.type === 'BLOCK'
                              ? 'bg-yellow-100'
                              : transaction.type === 'RELEASE'
                              ? 'bg-blue-100'
                              : 'bg-red-100'
                          }`}>
                            {transaction.type === 'CREDIT' ? (
                              <ArrowDownLeft size={16} className="text-green-600" />
                            ) : transaction.type === 'BLOCK' ? (
                              <Lock size={16} className="text-yellow-600" />
                            ) : transaction.type === 'RELEASE' ? (
                              <ArrowDownLeft size={16} className="text-blue-600" />
                            ) : (
                              <ArrowUpRight size={16} className="text-red-600" />
                            )}
                          </div>
                          <span className={`text-sm font-bold ${
                            transaction.type === 'CREDIT' 
                              ? 'text-green-600' 
                              : transaction.type === 'BLOCK'
                              ? 'text-yellow-600'
                              : transaction.type === 'RELEASE'
                              ? 'text-blue-600'
                              : 'text-red-600'
                          }`}>
                            {formatTransactionType(transaction.type)}
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
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg ${getStatusBadgeColor(transaction.status || 'Completed')}`}>
                          {transaction.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
