# GoCorp Customer Frontend

Customer-facing web application for the GoCorp ride-sharing platform. Built with React 19 and Vite.

## Overview

This is the main frontend application that employees use to:
- Book and manage rides
- Track driver location in real-time
- View ride history and past earnings
- Manage wallet and payments
- Update profile information
- Receive ride notifications

## Features

- 🎯 **Intuitive Ride Booking** - Simple, multi-step ride booking interface
- 📍 **Location Services** - Interactive maps with pickup and drop-off location selection
- 🔔 **Real-time Notifications** - Live updates on ride status and driver arrival
- 💳 **Secure Wallet** - Prepaid wallet with recharge options
- 🚗 **Ride Tracking** - Real-time driver location and ETA tracking
- 👥 **Group Rides** - Invite colleagues to share rides
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- ⚡ **Fast Performance** - Vite for lightning-fast development and builds

## Tech Stack

- **React 19.2** - UI framework
- **Vite 8.0** - Build tool with HMR
- **React Router 7.13** - Client-side routing
- **Tailwind CSS 4.2** - Utility-first styling
- **Axios 1.14** - HTTP client
- **Leaflet 1.9** - Interactive maps
- **Framer Motion 12.38** - Smooth animations
- **React Leaflet 5.0** - React bindings for Leaflet
- **ESLint 9.39** - Code quality

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

```bash
# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAPS_API_KEY=your_maps_api_key_if_needed
EOF

# Start development server
npm run dev

# Frontend will run on http://localhost:5173
```

### Build & Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Output will be in the dist/ folder
```

## Project Structure

```
src/
├── components/
│   ├── common/              # Shared components (Toast, Loader, etc)
│   ├── BottomNav.jsx       # Bottom navigation
│   ├── Button.jsx          # Reusable button
│   ├── Input.jsx           # Reusable input
│   └── ...                 # Other components
├── pages/
│   ├── Home.jsx            # Landing page
│   ├── Login.jsx           # Authentication
│   ├── Register.jsx        # Registration
│   ├── Dashboard.jsx       # Main dashboard
│   ├── MyRides.jsx         # Ride history
│   ├── RideDetails.jsx     # Ride details view
│   ├── Profile.jsx         # User profile
│   └── ...                 # Other pages
├── context/
│   ├── UserContext.jsx     # User state management
│   ├── UIContext.jsx       # UI state (notifications, modals)
│   └── ...                 # Other contexts
├── services/
│   ├── authAPI.js          # Authentication endpoints
│   ├── rideAPI.js          # Ride booking endpoints
│   ├── walletAPI.js        # Wallet endpoints
│   └── ...                 # Other API services
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions
├── App.jsx                 # Main app component
└── main.jsx                # Entry point

public/                      # Static assets
```

## Key Pages

### Home Page (`/`)
Landing page with sign-in/sign-up options

### Login (`/login`)
Employee login with email and password

### Register (`/register`)
New employee registration with company details

### Dashboard (`/home`)
Main hub showing:
- Current active ride status
- Quick ride booking
- Ride recommendations based on location
- Recent rides

### My Rides (`/myrides`)
Ride history and details:
- Past rides
- Ride costs and payments
- Driver ratings
- Receipt downloads

### RideDetails (`/ride/:id`)
Detailed view of a specific ride:
- Route visualization on map
- Driver information
- Real-time location tracking
- Payment details

### Profile (`/profile`)
User profile management:
- Personal information
- Wallet balance
- Payment methods
- Settings

## API Integration

The frontend communicates with the backend through the following services:

### Auth Service (`services/authAPI.js`)
```javascript
// Login
POST /api/user/login
// Register  
POST /api/user/register
// Get profile
GET /api/user/profile
// Update profile
PUT /api/user/profile
```

### Ride Service (`services/rideAPI.js`)
```javascript
// Book a ride
POST /api/ride/book
// Get current ride
GET /api/ride/current
// Get ride history
GET /api/ride/history
// Cancel a ride
PUT /api/ride/:id/cancel
```

### Wallet Service (`services/walletAPI.js`)
```javascript
// Get wallet balance
GET /api/wallet/balance
// Recharge wallet
POST /api/wallet/recharge
// Get transactions
GET /api/wallet/transactions
```

## State Management

The app uses React Context API for state management:

### UserContext
Manages:
- Current user data
- Authentication token
- User preferences
- Loading states

### UIContext
Manages:
- Toast notifications
- Modal visibility
- Loading indicators
- Global UI state

```javascript
// Usage example
import { useUser } from '../context/UserContext'

function MyComponent() {
  const { user, token, loading } = useUser()
  // component code
}
```

## Styling

The project uses Tailwind CSS for styling with a utility-first approach:

```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-800">Ride Summary</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    Book Ride
  </button>
</div>
```

## Development

### Run with Hot Module Reload
```bash
npm run dev
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Debugging
- React DevTools browser extension recommended
- Use console.log and debugger statements
- Check Network tab for API calls
- Use React DevTools Profiler for performance

## Environment Variables

Create `.env.local` in the project root:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api

# Map API Key (if using external maps)
VITE_MAPS_API_KEY=your_api_key_here

# Feature flags
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_ADVANCE_BOOKING=true
```

## Performance Optimization

- Code splitting with React Router lazy loading
- Image optimization for maps
- CSS minification via Tailwind
- Production build optimization with Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues
- Verify backend is running on correct port
- Check VITE_API_BASE_URL in .env.local
- Ensure CORS is enabled on backend

### Map Not Loading
- Verify Leaflet CSS is imported
- Check browser console for errors
- Ensure location permissions are granted

### Authentication Issues
- Clear browser cache and localStorage
- Check JWT token in storage
- Verify backend JWT_SECRET matches

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## License

ISC

## Support

For issues and contributions, please refer to the [main README](../README.md) in the root directory.
