# GoCorp Driver Frontend

Driver-facing web application for the GoCorp ride-sharing platform. Built with React 19 and Vite.

## Overview

This application provides drivers with tools to:
- Accept and manage ride assignments
- Track current and upcoming rides
- View route optimization and navigation
- Manage earnings and payments
- Update driver availability status
- Receive ride notifications

## Features

- 🚗 **Ride Management** - Accept, track, and complete ride assignments
- 📍 **Route Navigation** - Interactive maps with optimal route guidance
- 📊 **Earnings Dashboard** - Real-time earnings tracking and breakdown
- 🔔 **Smart Notifications** - Instant alerts for new ride assignments
- ⏱️ **Availability Management** - Toggle online/offline status
- 📈 **Performance Metrics** - Track ratings and ride completion rates
- 📱 **Mobile Optimized** - Responsive design for smartphone usage
- ⚡ **Real-time Updates** - Live ride status and passenger location

## Tech Stack

- **React 19.2** - UI framework
- **Vite 8.0** - Build tool with HMR
- **React Router 7.13** - Client-side routing
- **Tailwind CSS 4.2** - Responsive styling
- **Axios 1.14** - HTTP client
- **Leaflet 1.9** - Interactive maps
- **Framer Motion 12.38** - Smooth animations
- **React Leaflet 5.0** - React Leaflet integration

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

# Frontend will run on http://localhost:5174 (or next available port)
```

### Build & Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── common/              # Shared components
│   ├── RideCard.jsx         # Active ride display
│   ├── EarningsWidget.jsx   # Earnings summary
│   ├── RouteMap.jsx         # Route visualization
│   └── ...                  # Other components
├── pages/
│   ├── DashboardPage.jsx    # Main driver dashboard
│   ├── SignInPage.jsx       # Driver login
│   ├── SignUpPage.jsx       # Driver registration
│   ├── ProfilePage.jsx      # Driver profile
│   ├── RideRequestPage.jsx  # Incoming ride notifications
│   ├── CustomerLocationPage.jsx  # Passenger pickup location
│   ├── DestinationPage.jsx  # Drop-off location
│   ├── ArrivedPage.jsx      # Arrival confirmation
│   ├── CompleteRidePage.jsx # Ride completion
│   ├── PaymentSuccessPage.jsx  # Payment confirmation
│   └── ...                  # Other pages
├── context/
│   ├── DriverAuthContext.jsx   # Driver auth state
│   ├── RideContext.jsx         # Ride state management
│   └── ...                     # Other contexts
├── services/
│   ├── driverAPI.js         # Driver endpoints
│   ├── rideAPI.js           # Ride endpoints
│   ├── officeAPI.js         # Office data
│   └── walletAPI.js         # Earnings/wallet
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
├── App.jsx                  # Main app
└── main.jsx                 # Entry point

public/                      # Static assets
```

## Key Pages

### Dashboard (`/`)
Main driver hub showing:
- Current ride status
- Earnings summary
- Available rides queue
- Performance metrics

### SignIn (`/signin`)
Driver authentication with email and password

### RideRequest
Incoming ride notification showing:
- Passenger details
- Pickup location
- Estimated fare
- Accept/Reject buttons

### CustomerLocation
Display passenger's current location for pickup

### Destination
Show drop-off location and route to destination

### Arrived
Confirm arrival at pickup location

### CompleteRide
Mark ride as completed and submit payment

### Profile
Driver profile management:
- Vehicle information
- Bank details for payouts
- Driver rating
- Preferences

## API Integration

### Driver Service (`services/driverAPI.js`)
```javascript
// Driver login
POST /api/driver/login
// Get driver profile
GET /api/driver/profile
// Update status
PUT /api/driver/status
// Accept ride
POST /api/driver/accept-ride
// Complete ride
POST /api/driver/complete-ride
```

### Ride Service (`services/rideAPI.js`)
```javascript
// Get assigned rides
GET /api/ride/assigned
// Get ride details
GET /api/ride/:id
// Get current ride
GET /api/ride/current
// Update ride status
PUT /api/ride/:id/status
```

### Wallet Service (`services/walletAPI.js`)
```javascript
// Get earnings
GET /api/wallet/earnings
// Get payment history
GET /api/wallet/history
// Request payout
POST /api/wallet/payout
```

## State Management

### DriverAuthContext
Manages:
- Driver authentication
- Driver profile data
- Login/logout operations
- Driver availability status

### RideContext
Manages:
- Current assigned ride
- Ride history
- Ride notifications
- Ride status updates

## Development

### Start with Hot Reload
```bash
npm run dev
```

### Linting
```bash
npm run lint
npm run lint -- --fix
```

## Environment Variables

Create `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAPS_API_KEY=optional_maps_key
```

## Features by Workflow

### Accepting a Ride
1. Driver comes online
2. Receives ride notification (RideRequestPage)
3. Views passenger details and location
4. Accepts or rejects offer
5. Gets assigned ride

### Navigation Flow
1. View pickup location (CustomerLocationPage)
2. Navigate to passenger
3. Confirm arrival (ArrivedPage)
4. View drop-off location (DestinationPage)
5. Navigate to destination
6. Complete ride (CompleteRidePage)

### Payment Flow
1. Ride completed
2. Automatic deduction from wallet
3. Payment success confirmation (PaymentSuccessPage)
4. Earnings updated in dashboard

## Troubleshooting

### Backend Connection
- Verify backend is running
- Check VITE_API_BASE_URL matches backend
- Test API health: `curl http://localhost:5000/api/health`

### Maps Not Loading
- Check Leaflet CSS import
- Verify browser location permissions
- Check console for errors

### Login Issues
- Clear cache and localStorage
- Verify backend JWT configuration
- Check driver credentials

## Performance Tips

- Use React DevTools Profiler to identify bottlenecks
- Lazy load heavy components
- Optimize map rendering for mobile devices
- Monitor API response times

## License

ISC

## Support

For issues and contributions, refer to the [main README](../README.md).
