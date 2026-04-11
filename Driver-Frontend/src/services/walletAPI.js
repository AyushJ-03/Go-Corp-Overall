import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const walletAPI = axios.create({
  baseURL: `${API_BASE_URL}/wallet`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
walletAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('driverToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const blockAmount = async (officeId, estimatedFare, rideId) => {
  try {
    const response = await walletAPI.post('/block', {
      officeId,
      estimatedFare,
      rideId
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const deductFare = async (officeId, amount, rideId) => {
  try {
    const response = await walletAPI.post('/deduct', {
      officeId,
      amount,
      rideId
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export const getWallet = async (officeId) => {
  try {
    const response = await walletAPI.get(`/${officeId}`)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export default walletAPI
