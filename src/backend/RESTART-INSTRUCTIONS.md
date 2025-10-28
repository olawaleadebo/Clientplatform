# 🚨 BACKEND SERVER RESTART REQUIRED

## The Problem
You're getting 404 errors because the backend server is not running the latest code with the Manager Portal endpoints.

## Quick Fix - Follow These Steps:

### Step 1: Kill Any Running Backend Servers
**Windows:**
```bash
cd backend
./kill-old-servers.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x kill-old-servers.sh
./kill-old-servers.sh
```

### Step 2: Start the Backend Server
**Windows:**
```bash
cd backend
./start.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x start.sh
./start.sh
```

### Step 3: Wait for MongoDB to Initialize
You should see these messages in the console:
```
✅ MongoDB connection pool ready!
🚀 BTM Travel CRM Server running on MongoDB!
🔗 Manager Operations: ✅ ALL LOADED
   - GET    /team-performance (Full team metrics)
   - GET    /agent-monitoring/overview
   - GET    /agent-monitoring/agent/:id
```

**IMPORTANT:** Wait about 10-30 seconds for MongoDB to fully initialize before refreshing the Manager Portal.

### Step 4: Verify the Server is Working
**Windows:**
```bash
cd backend
./verify-manager-endpoints.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x verify-manager-endpoints.sh
./verify-manager-endpoints.sh
```

You should see all endpoints returning status 200 (or 503 if MongoDB is still initializing).

### Step 5: Refresh Your Browser
After the server is running and MongoDB is initialized, refresh the Manager Portal in your browser.

## Troubleshooting

### If you still get 404 errors:
1. Make sure you're in the `/backend` directory when running commands
2. Check that port 8000 is not being used by another application
3. Look at the backend console logs for any errors
4. Try using the force restart script:
   - Windows: `./FORCE-RESTART-NOW.bat`
   - Mac/Linux: `chmod +x FORCE-RESTART-NOW.sh && ./FORCE-RESTART-NOW.sh`

### If you get MongoDB connection errors:
1. Wait 30 seconds - MongoDB takes time to initialize
2. Refresh the Manager Portal page
3. The portal will show "Connecting to database..." until MongoDB is ready

## Quick Test
Open this URL in your browser to test if the server is running:
```
http://localhost:8000/health
```

You should see a JSON response with `"status": "ok"` or `"status": "initializing"`.
