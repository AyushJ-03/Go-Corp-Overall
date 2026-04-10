// Authentication API service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Check if user role is OFFICE_ADMIN
    if (data.data.user.role !== 'OFFICE_ADMIN') {
      throw new Error('Only OFFICE_ADMIN users can access this portal');
    }

    // Store token and user data
    if (data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('officeId', data.data.user.office_id);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('officeId');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
