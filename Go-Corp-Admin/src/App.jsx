import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './dashboard/Layout';
import Overview from './dashboard/pages/Overview';
import EmployeeManagement from './dashboard/pages/EmployeeManagement';
import SharedRides from './dashboard/pages/SharedRides';
import LiveTracking from './dashboard/pages/LiveTracking';
import Billing from './dashboard/pages/Billing';
import Reports from './dashboard/pages/Reports';
import Settings from './dashboard/pages/Settings';
import Booking from './dashboard/pages/Booking';
import Finance from './dashboard/pages/Finance';
import Login from './pages/Login';
import Profile from './dashboard/pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Landing Page Route - Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* Dashboard Routes - Protected */}
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardLayout />} />}>
        <Route index element={<Overview />} />
        <Route path="booking" element={<Booking />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="shared-rides" element={<SharedRides />} />
        <Route path="live-tracking" element={<LiveTracking />} />
        <Route path="billing" element={<Billing />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="finance" element={<Finance />} />
        <Route path="help" element={<Overview />} />
      </Route>
    </Routes>
  );
}

export default App;
