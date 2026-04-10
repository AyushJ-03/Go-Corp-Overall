# Finance Frontend-Backend Integration Guide

## Overview
This document explains the setup and usage of the integrated Finance/Wallet system connecting the Go-Corp-Admin frontend with the GoCorp-Backend.

## Components Integrated

### Backend (GoCorp-Backend-main)
**File:** `src/modules/wallet/wallet.routes.js` & `src/modules/wallet/wallet.controller.js`

**Endpoints:**
- `POST /api/wallet/add-money` - Add funds to office wallet
- `POST /api/wallet/block` - Block amount for a ride
- `POST /api/wallet/deduct` - Deduct final fare from wallet
- `POST /api/wallet/release` - Release blocked amount
- `GET /api/wallet/:officeId` - Get wallet details
- `GET /api/wallet/transactions/:officeId` - Get transaction history

### Frontend (Go-Corp-Admin)
**Files:**
- `src/services/walletAPI.js` - API service for all wallet calls
- `src/dashboard/pages/Finance.jsx` - Updated Finance component with live data

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in Go-Corp-Admin root (if not exists):
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Backend Setup

The wallet routes have been added to `server.js`:
```javascript
import walletRoutes from "./src/modules/wallet/wallet.routes.js";
app.use("/api/wallet", walletRoutes);
```

Ensure your backend is running:
```bash
cd GoCorp-Backend-main
npm install
npm start
```

### 3. Frontend Setup

The Finance component will automatically:
1. Fetch wallet data on component mount
2. Get transaction history
3. Calculate monthly totals dynamically
4. Handle add funds requests

```bash
cd Go-Corp-Admin
npm install
npm run dev
```

## Key Features

### Automatic Features
- **Real-time Data Loading**: Wallet and transaction data fetched from backend
- **Error Handling**: User-friendly error messages displayed
- **Loading States**: Loading spinner while data is fetched
- **Dynamic Calculation**: Monthly totals calculated from transaction data
- **Status Updates**: Reflects transaction status from backend

### User Interactions
1. **Add Funds**: Click "Add Funds" button to open form
2. **Quick Amount Buttons**: Click ₹500, ₹1000, ₹5000, ₹10000 for quick selection
3. **View Transactions**: Recent transactions displayed in table with status
4. **Filter Options**: Filter button available for future enhancement

## API Service Usage

The `walletAPI.js` service handles all API calls with authentication:

```javascript
import * as walletAPI from '../../services/walletAPI';

// Get wallet data
const wallet = await walletAPI.getWallet(officeId);

// Add money
await walletAPI.addMoney(officeId, amount);

// Get transactions
const transactions = await walletAPI.getTransactions(officeId);
```

## Authentication

The API service automatically includes Bearer token from localStorage:
```javascript
'Authorization': `Bearer ${localStorage.getItem('token')}`
```

Ensure your login system stores the token in localStorage during authentication.

## Office ID Configuration

The Finance component retrieves officeId from localStorage:
```javascript
const officeId = localStorage.getItem('officeId') || '6781b4d1e8b6c1234567890a';
```

Set this during login:
```javascript
localStorage.setItem('officeId', user.officeId);
localStorage.setItem('token', user.token);
```

## Data Flow

```
User Actions (Add Funds, View Transactions)
        ↓
Finance.jsx Component
        ↓
walletAPI.js (API Service)
        ↓
Backend /api/wallet/* Endpoints
        ↓
Database
        ↓
Response back to Component
        ↓
Update UI with Live Data
```

## Transaction Types

| Type | Description |
|------|-------------|
| CREDIT | Money added to wallet |
| DEBIT | Money withdrawn from wallet |
| BLOCK | Money blocked for a ride |

## Status Handling

| Status | Color |
|--------|-------|
| Completed | Green |
| Processing | Yellow |
| Failed | Red |

## Error Handling

All errors are displayed to the user in a red alert box at the top of the Finance page. Errors include:
- Network failures
- Invalid amounts
- Server errors
- Wallet insufficient balance

## Future Enhancements

1. **Export Statement**: PDF/CSV export functionality
2. **Download Feature**: Generate and download statements
3. **Filter Transactions**: Advanced filtering by date, type, amount
4. **Payment Gateway**: Integrate payment processor for "Add Funds"
5. **Real-time Updates**: WebSocket integration for live updates

## Troubleshooting

### Issue: "Failed to fetch wallet data"
- **Check**: Backend is running on correct port (3000)
- **Check**: Network connection to backend
- **Check**: officeId is correctly set in localStorage

### Issue: "Unauthorized"
- **Check**: Token is valid in localStorage
- **Check**: Authentication middleware is properly configured

### Issue: "CORS Error"
- **Check**: Backend has CORS enabled
- **Check**: API base URL matches backend URL

## Testing the Integration

1. **Add Funds Test**:
   - Navigate to Finance page
   - Click "Add Funds"
   - Enter amount
   - Click "Continue to Payment"
   - Verify response from backend

2. **View Transactions Test**:
   - Navigate to Finance page
   - Check if transactions load
   - Verify data formatting and calculations

3. **Error Handling Test**:
   - Stop backend server
   - Try to fetch data
   - Verify error message displays

## Notes

- All amounts are formatted in Indian Rupees (₹)
- Dates are formatted based on user's locale
- Monthly totals are calculated from all non-blocked transactions
- The system uses the office ID to isolate wallet data per company
