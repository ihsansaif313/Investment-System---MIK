# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Click "Try Free"
3. Sign up with your email
4. Verify your email address

## Step 2: Create a Free Cluster
1. Choose "Build a Database"
2. Select "M0 Sandbox" (Free tier)
3. Choose your preferred cloud provider and region
4. Name your cluster (e.g., "investment-management")
5. Click "Create Cluster"

## Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `admin`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: "Atlas admin"
7. Click "Add User"

## Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

## Step 6: Update Your Backend
1. Open `backend/.env`
2. Replace the MONGODB_URI with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://admin:<password>@investment-management.xxxxx.mongodb.net/investment_management?retryWrites=true&w=majority
   ```

## Step 7: Test Connection
1. Restart your backend server
2. Check if it connects successfully
3. Your data will now be stored in the cloud!

## Benefits of MongoDB Atlas:
- ✅ No local installation issues
- ✅ Automatic backups
- ✅ High availability
- ✅ Free tier available
- ✅ Web-based management interface
- ✅ No corruption issues
