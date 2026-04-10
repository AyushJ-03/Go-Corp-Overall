import React from 'react';
import { Navigate } from 'react-router-dom';
import * as authAPI from '../services/authAPI';

export default function ProtectedRoute({ element }) {
  const isAuthenticated = authAPI.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
}
