# GoCorp Admin Dashboard

Admin dashboard for the GoCorp corporate ride-sharing platform. Built with React 19 and Vite.

## Overview

The admin dashboard provides administrators with comprehensive tools to:
- Manage companies and offices
- Monitor ride operations and metrics
- Manage user and driver accounts
- Configure system settings and policies
- View analytics and reporting
- Handle disputes and support issues

## Features

- 📊 **Analytics Dashboard** - Real-time metrics and KPIs
- 🏢 **Company Management** - Multi-company administration
- 👥 **User Management** - Employee and driver administration
- 🚗 **Ride Monitoring** - Track all rides and operations
- 💰 **Financial Management** - Revenue, earnings, and payouts
- ⚙️ **System Configuration** - Office hours, rates, and policies
- 📈 **Reporting** - Detailed reports and insights
- 🔐 **Secure Access** - Role-based access control

## Tech Stack

- **React 19.2** - UI framework
- **Vite 8.0** - Build tool
- **React Router 7.13** - Navigation
- **Tailwind CSS 4.2** - Styling
- **Axios 1.14** - HTTP client
- **Framer Motion 12.38** - Animations
- **ESLint 9.39** - Code quality

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:5000
- Admin account on the backend

### Installation

```bash
# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=GoCorp Admin
EOF

# Start development server
npm run dev

# Dashboard will run on http://localhost:5175 (or next available port)
```

### Build & Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Output in dist/ folder ready for hosting
```

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Top navigation
│   ├── Sidebar.jsx         # Side navigation
│   ├── Hero.jsx            # Landing section
│   ├── AppShowcaseSection.jsx  # Features showcase
│   ├── ValuePropsSection.jsx   # Value propositions
│   ├── ProblemSection.jsx      # Problem statement
│   ├── Footer.jsx          # Footer
│   └── ...                 # Other components
├── dashboard/
│   ├── Layout.jsx          # Admin layout
│   ├── components/         # Dashboard components
│   │   ├── MetricsCard.jsx
│   │   ├── RidesList.jsx
│   │   ├── UsersList.jsx
│   │   ├── AnalyticsChart.jsx
│   │   └── ...
│   └── pages/
│       ├── Overview.jsx           # Dashboard overview
│       ├── Users.jsx              # User management
│       ├── Drivers.jsx            # Driver management
│       ├── Rides.jsx              # Ride monitoring
│       ├── Companies.jsx          # Company settings
│       ├── Analytics.jsx          # Reports and analytics
│       ├── Settings.jsx           # System configuration
│       └── ...
├── pages/
│   ├── LandingPage.jsx     # Public landing page
│   ├── Login.jsx           # Admin login
│   ├── Signup.jsx          # Admin signup
│   └── ...                 # Other pages
├── services/
│   ├── adminAPI.js         # Admin endpoints
│   ├── authAPI.js          # Authentication
│   ├── walletAPI.js        # Financial data
│   └── ...                 # Other services
├── components/
│   ├── ProtectedRoute.jsx  # Route protection
│   └── ...
├── App.jsx                 # Main app
├── App.css                 # Global styles
└── main.jsx                # Entry point

public/                      # Static assets
```

## Dashboard Features

### Overview Page
- Key metrics (total rides, revenue, users, drivers)
- Ride trends chart
- Recent activity feed
- System health status

### User Management
- List all employees
- View user details and ride history
- Enable/disable user accounts
- Handle user disputes

### Driver Management
- View all drivers and status
- Verify and approve new drivers
- Track driver performance metrics
- Manage driver documents

### Ride Monitoring
- Real-time ride tracking
- View ride details and routes
- Track ride status changes
- Handle ride disputes

### Company Settings
- Manage multiple companies
- Configure office locations
- Set office hours and ride policies
- Manage shift schedules

### Analytics & Reports
- Ride statistics and trends
- Revenue and financial reports
- User and driver analytics
- Custom report generation

### System Configuration
- Fare structure and pricing
- Ride clustering parameters
- Notification settings
- Email templates

## API Integration

### Admin Service (`services/adminAPI.js`)
```javascript
// Admin login
POST /api/admin/login
// Get dashboard metrics
GET /api/admin/metrics
// Get all users
GET /api/admin/users
// Get all drivers
GET /api/admin/drivers
// Get all rides
GET /api/admin/rides
```

### Company Service
```javascript
// Manage companies
GET/POST/PUT /api/company/*
// Manage offices
GET/POST/PUT /api/office/*
```

### Ride Service
```javascript
// View all rides
GET /api/ride/all
// Get ride analytics
GET /api/ride/analytics
```

## State Management

The dashboard uses React Context for:
- Admin authentication
- Dashboard data
- UI state
- Filters and preferences

## Styling

Uses Tailwind CSS for responsive, utility-first styling with custom components.

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

### Building
```bash
npm run build
```

## Environment Variables

Create `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=GoCorp Admin
VITE_APP_LOGO=./logo.png
```

## Protected Routes

Admin pages are protected by authentication. Access requires:
1. Valid admin login credentials
2. Active session token
3. Proper admin role/permissions

## Key Workflows

### Onboarding a New Company
1. Click "Add Company"
2. Enter company details
3. Configure office locations
4. Set shift schedules
5. Invite admin users

### Managing a User Dispute
1. View dispute in dashboard
2. Review ride details
3. Check timestamps and locations
4. Issue refund if needed
5. Document resolution

### Monitoring Real-time Operations
1. Access Overview page
2. View live ride metrics
3. Monitor active rides
4. Track driver locations
5. Respond to issues

## Performance Optimization

- Component code splitting
- Lazy loading of dashboard pages
- Chart optimization for large datasets
- Caching API responses
- Image optimization

## Security Considerations

- Secure JWT token handling
- Protected API endpoints
- Role-based access control
- Audit logging of admin actions
- Session management

## Troubleshooting

### Login Issues
- Verify backend is running
- Check admin credentials
- Clear browser cache/localStorage

### Dashboard Not Loading
- Check API connectivity
- Verify VITE_API_BASE_URL
- Check browser console for errors

### Charts/Analytics Not Displaying
- Verify data API endpoints
- Check browser console
- Ensure sufficient data available

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

The admin dashboard can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps
- Any static hosting service

Build output in `dist/` folder is production-ready.

## License

ISC

## Support

For issues and contributions, refer to the [main README](../README.md).
