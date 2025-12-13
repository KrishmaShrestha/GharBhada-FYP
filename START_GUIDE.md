# 🚀 GharBhada - Complete Startup Guide

## 📋 Prerequisites
- Node.js (v16 or higher)
- MySQL database running
- Git (optional)

## 🛠️ Setup Instructions

### 1. **Database Setup**
```sql
-- Create database
CREATE DATABASE gharbhada;
USE gharbhada;

-- Run the schema (from backend/database/schema.sql)
-- This creates all necessary tables
```

### 2. **Backend Setup**
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create test users (optional but recommended)
node test-users.js

# Start backend server
npm start
```
**Backend will run on: http://localhost:5000**

### 3. **Frontend Setup**
```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```
**Frontend will run on: http://localhost:5173**

## 🔑 Test Login Credentials

### **Admin Account**
- **Email:** admin@gharbhada.com
- **Password:** password123
- **Access:** Complete system management

### **Owner Account**
- **Email:** owner@test.com
- **Password:** password123
- **Access:** Property management, booking approvals

### **Tenant Account**
- **Email:** tenant@test.com
- **Password:** password123
- **Access:** Property search, booking, payments

## 🎯 Testing the Complete Flow

### **1. Admin Flow**
1. Login with admin credentials
2. Go to Admin Dashboard
3. Approve any pending users/properties
4. Monitor system activity

### **2. Owner Flow**
1. Login with owner credentials
2. Go to Owner Dashboard
3. Add new property (with photos)
4. Wait for admin approval
5. Manage booking requests
6. Track payments

### **3. Tenant Flow**
1. Login with tenant credentials
2. Go to Tenant Dashboard
3. Browse properties
4. Click "View Details" → "Book Now"
5. Fill booking form
6. Set lease terms
7. Sign agreement
8. Make payment

## 🔧 Troubleshooting

### **Login Issues**
- Check browser console for errors
- Verify backend is running on port 5000
- Check database connection
- Ensure user status is "Active"

### **Navigation Issues**
- Clear browser cache and localStorage
- Check network tab for API errors
- Verify all routes are properly defined

### **Database Issues**
- Ensure MySQL is running
- Check database credentials in backend/config/db.js
- Run schema.sql to create tables
- Run test-users.js to create test accounts

## 📱 Complete Feature List

### ✅ **Authentication System**
- Role-based registration (Tenant/Owner/Admin)
- Secure login with JWT tokens
- Admin approval system
- Password hashing with bcrypt

### ✅ **Property Management**
- Property listing with photos
- Admin approval workflow
- Advanced search and filtering
- Property verification system

### ✅ **Booking System**
- Complete tenant application
- Owner approval/rejection
- Lease term negotiation
- Digital agreement signing

### ✅ **Payment Processing**
- Security deposit payments
- Monthly rent with utilities
- Multiple payment methods (eSewa, Khalti, Bank)
- Payment history and receipts

### ✅ **Admin Dashboard**
- User management (approve/suspend)
- Property oversight
- System analytics
- Transaction monitoring

### ✅ **Owner Dashboard**
- Property management
- Booking request handling
- Payment tracking
- Tenant communication

### ✅ **Tenant Dashboard**
- Property browsing
- Booking management
- Payment history
- Agreement access

## 🎨 **Design Features**
- Responsive design for all devices
- Modern teal color scheme (#0d9488)
- Intuitive navigation
- Real-time status updates
- Professional UI/UX

## 🚀 **Ready for Production**
The platform includes:
- Complete user authentication
- End-to-end rental workflow
- Payment integration
- Admin oversight
- Responsive design
- Error handling
- Data validation

**Perfect for your Final Year Project demonstration!** 🎓

## 📞 **Support**
If you encounter any issues:
1. Check the console logs
2. Verify database connection
3. Ensure all dependencies are installed
4. Check that both servers are running

**Happy coding!** ✨