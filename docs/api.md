# TierFlow - API Documentation

The TierFlow platform provides RESTful APIs for authentication, investments, dashboard analytics, automated ROI calculation, and multi-level referral hierarchy tracking.

**Base URL**: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST`
- **Route**: `/auth/register`
- **Request Body**:
```json
{
  "fullName": "Jane Sagar",
  "email": "jane@tierflow.com",
  "mobileNumber": "+919876543210",
  "password": "password123",
  "referralCode": "TFL123456" // Optional sponsor referral code
}
```
- **Success Response (201 Created)**:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "6ae20...",
      "fullName": "Jane Sagar",
      "email": "jane@tierflow.com",
      "mobileNumber": "+919876543210",
      "referralCode": "TFL998811",
      "walletBalance": 0,
      "totalRoiEarned": 0,
      "totalLevelIncomeEarned": 0,
      "accountStatus": "Active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### Login User
- **Method**: `POST`
- **Route**: `/auth/login`
- **Request Body**:
```json
{
  "email": "Aman@tierflow.com",
  "password": "password123"
}
```
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Logged in successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### Get Current User Profile
- **Method**: `GET`
- **Route**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "user": { ... }
  }
}
```

---

## 2. Investment Endpoints

### Get Available Plans
- **Method**: `GET`
- **Route**: `/investments/plans`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Array of 4 configured plans: Growth Plan A, Growth Plan B, Wealth Plan, Premium Plan.

### Create Investment
- **Method**: `POST`
- **Route**: `/investments`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "planId": "growth-b",
  "amount": 25000
}
```
- **Success Response (201 Created)**:
```json
{
  "status": "success",
  "message": "Investment created successfully",
  "data": {
    "investment": {
      "_id": "6ae20...",
      "user": "...",
      "investmentAmount": 25000,
      "planDetails": {
        "planId": "growth-b",
        "planName": "Growth Plan B",
        "durationDays": 120
      },
      "startDate": "2024-10-15T00:00:00.000Z",
      "endDate": "2025-02-12T00:00:00.000Z",
      "dailyRoiPercentage": 1.5,
      "investmentStatus": "Active"
    }
  }
}
```

### List My Investments
- **Method**: `GET`
- **Route**: `/investments?status=Active&page=1&limit=10`
- **Headers**: `Authorization: Bearer <token>`

---

## 3. Dashboard Endpoints

### Summary Overview
- **Method**: `GET`
- **Route**: `/dashboard/summary`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns 4 KPI metrics (`totalInvestments`, `dailyRoi`, `totalLevelIncome`, `walletBalance`), recent investments list, recent earnings list, and referral statistics.

### Earnings Chart
- **Method**: `GET`
- **Route**: `/dashboard/earnings?period=30d`
- **Query Params**: `period` (`7d`, `30d`, `3m`, `1y`)
- **Headers**: `Authorization: Bearer <token>`

---

## 4. ROI History Endpoints

### Get ROI History
- **Method**: `GET`
- **Route**: `/roi-history?page=1&limit=10`
- **Headers**: `Authorization: Bearer <token>`

### Trigger Daily ROI (Development & Testing)
- **Method**: `POST`
- **Route**: `/roi-history/process-daily`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**: `{ "date": "2024-10-30" }` (optional)
- **Response**: Summary of credited, skipped (idempotent), and total credited amount.

---

## 5. Referral Endpoints

### Get Direct Referrals
- **Method**: `GET`
- **Route**: `/referrals/direct`
- **Headers**: `Authorization: Bearer <token>`

### Get Complete Referral Tree
- **Method**: `GET`
- **Route**: `/referrals/tree`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Root user node, nested level 1 children, level 2 sub-branches, and level 3 nodes with summary counts.

### Get Referral Income History
- **Method**: `GET`
- **Route**: `/referrals/income?level=1&page=1&limit=10`
- **Headers**: `Authorization: Bearer <token>`
