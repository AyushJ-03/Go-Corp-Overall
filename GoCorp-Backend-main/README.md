# GoCorp Backend API

Backend service for the GoCorp corporate ride-sharing platform. Built with Node.js, Express, and MongoDB.

## Overview

This is the core API server that powers all GoCorp functionality including:
- Employee ride booking and management
- Driver assignment and tracking
- Intelligent ride clustering and batching
- Payment processing
- User and company management
- Real-time notifications

## Features

- **RESTful API** - Comprehensive REST endpoints for all operations
- **JWT Authentication** - Secure token-based authentication with OTP
- **MongoDB Integration** - Mongoose ODM for data persistence
- **Rate Limiting** - Protection against abuse with express-rate-limit
- **Input Validation** - express-validator for data validation
- **Error Handling** - Centralized error middleware for consistent responses
- **Async Operations** - Node Cron for scheduled tasks and polling
- **Payment Integration** - Razorpay for secure payment processing
- **Geospatial Features** - Turf.js and Geolib for location analysis
- **Email Notifications** - Nodemailer for email communications
- **CORS Support** - Cross-origin resource sharing configured

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+ (local or Atlas)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file (see Configuration section)
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### User Management
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Ride Management
- `POST /api/ride/book` - Book a new ride
- `GET /api/ride/current` - Get current active ride
- `GET /api/ride/history` - Get ride history
- `PUT /api/ride/:id/cancel` - Cancel a ride
- `PUT /api/ride/:id/complete` - Complete a ride

### Driver Management
- `POST /api/driver/register` - Register as driver
- `GET /api/driver/available` - Get available drivers
- `PUT /api/driver/:id/status` - Update driver status

### Polling & Clustering
- `POST /api/polling/submit-ride` - Submit ride to polling system
- `GET /api/polling/batches` - Get active batches

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/recharge` - Recharge wallet
- `POST /api/wallet/deduct` - Deduct from wallet

### Maps & Location
- `POST /api/maps/distance` - Calculate distance between points
- `POST /api/maps/route` - Get optimal route

## Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/gocorp
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gocorp

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Payment
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# External Services
OSRM_SERVER=https://router.project-osrm.org

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
src/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   ├── auth.middleware.js    # JWT authentication
│   └── error.middleware.js   # Error handling
├── modules/
│   ├── company/              # Company management
│   ├── driver/               # Driver operations
│   ├── maps/                 # Location services
│   ├── notification/         # Notification system
│   ├── office/               # Office management
│   ├── polling/              # Ride clustering
│   ├── ride/                 # Ride booking
│   ├── user/                 # User management
│   └── wallet/               # Wallet operations
└── utils/
    ├── ApiError.js           # Error class
    ├── ApiResponse.js        # Response wrapper
    ├── email.js              # Email service
    ├── fareBuffer.js         # Fare calculation
    ├── geo.js                # Geospatial utilities
    └── osrm.js               # Route optimization

server.js                      # Express app setup
```

## Module Details

### Ride Module
Handles ride booking, status tracking, and ride history. Implements validation for:
- Office hours compliance
- Duplicate booking prevention
- Location validation (one end must be office)
- Invited employees validation

### Polling Module
Implements intelligent ride clustering:
- 6-case clustering algorithm
- Automatic batching every 1 minute
- Driver assignment optimization
- Cluster dissolution handling

### Driver Module
Manages driver registration, availability, and assignments.

### Wallet Module
Handles prepaid wallet functionality with recharge and deduction operations.

## Development

```bash
# Start with auto-reload
npm run dev

# Run linting (if configured)
npm run lint

# Run tests (setup required)
npm test
```

## Dependencies

### Core
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Authentication & Security
- **jsonwebtoken** - JWT token generation/verification
- **bcrypt** / **bcryptjs** - Password hashing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

### External Services
- **razorpay** - Payment processing
- **nodemailer** - Email service
- **node-cron** - Task scheduling

### Geospatial
- **@turf/turf** - Geospatial analysis
- **geolib** - Geometry calculations

### Utilities
- **axios** - HTTP client
- **uuid** - ID generation
- **crypto-js** - Encryption
- **morgan** - HTTP logging
- **cookie-parser** - Cookie handling

## Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy"
}
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": []
}
```

Common status codes:
- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Server Error

## Security Considerations

- All passwords are hashed with bcrypt
- JWT tokens are required for protected routes
- Rate limiting prevents brute force attacks
- Input validation prevents injection attacks
- Helmet sets secure HTTP headers
- CORS is configured for frontend URLs only

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check MONGO_URI in .env matches your database

### Razorpay Integration
- Verify API keys are correct
- Test with Razorpay's test keys first
- Check Razorpay dashboard for rejected payments

### Email Not Sending
- Enable "Less secure app access" for Gmail accounts
- Use App Passwords for Gmail if 2FA is enabled
- Check EMAIL_USER and EMAIL_PASSWORD in .env

## Further Documentation

- See [SYSTEM_COMPLETE.md](./SYSTEM_COMPLETE.md) for detailed system architecture
- Check [TESTING_GUIDE_ALL_6_CASES.md](./TESTING_GUIDE_ALL_6_CASES.md) for testing the polling system

## License

ISC

## Support

For issues and questions, please create an issue in the main repository.
