// Wallet API service
// This service handles all wallet-related API calls to the backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Add money to wallet
export const addMoney = async (officeId, amount) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/add-money`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        officeId,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add money to wallet');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding money:', error);
    throw error;
  }
};

// Block amount for a ride
export const blockAmount = async (officeId, estimatedFare, rideId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        officeId,
        estimatedFare,
        rideId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to block amount');
    }

    return await response.json();
  } catch (error) {
    console.error('Error blocking amount:', error);
    throw error;
  }
};

// Deduct fare from wallet
export const deductFare = async (officeId, amount, rideId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/deduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        officeId,
        amount,
        rideId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to deduct fare');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deducting fare:', error);
    throw error;
  }
};

// Release blocked amount
export const releaseAmount = async (officeId, amount, rideId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        officeId,
        amount,
        rideId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to release amount');
    }

    return await response.json();
  } catch (error) {
    console.error('Error releasing amount:', error);
    throw error;
  }
};

// Get wallet details
export const getWallet = async (officeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/${officeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet:', error);
    throw error;
  }
};

// Get wallet transactions
export const getTransactions = async (officeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wallet/transactions/${officeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};
