# Manager Portal 404 Error - SOLUTION

## Problem
Manager Portal displays these errors:
```
404: /team-performance
404: /agent-monitoring/overview
404: /database/customers
```

## Solution Summary
The backend server needs to be restarted to load the manager portal endpoints.

## Quick Fix

### Windows (Easy Method)
1. Open Command Prompt or PowerShell
2. Navigate to backend folder:
   ```bat
   cd backend
   ```
3. Run the force restart script:
   ```bat
   force-restart.bat
   ```

### Mac/Linux (Easy Method)
1. Open Terminal
2. Navigate to backend folder:
   ```bash
   cd backend
   ```
3. Make scripts executable (first time only):
   ```bash
   chmod +x force-restart.sh
   ```
4. Run the force restart script:
   ```bash
   ./force-restart.sh
   ```

## Verify the Fix

After restarting, check if the endpoints are loaded:

### Windows
```bat
cd backend
check-server-version.bat
```

### Mac/Linux
```bash
cd backend
./check-server-version.sh
```

You should see:
```json
{
  "success": true,
  "version": "6.5.0-MANAGER-ENDPOINTS-VERIFIED-WITH-DEBUG",
  "managerEndpoints": {
    "/team-performance": { "status": "LOADED ✅" },
    "/agent-monitoring/overview": { "status": "LOADED ✅" },
    "/database/customers": { "status": "LOADED ✅" }
  }
}
```

## What Was Done

### 1. Verified Endpoints Exist ✅
All three manager endpoints are properly defined in `/backend/server.tsx`:
- Line 3021: `/team-performance` 
- Line 3111: `/agent-monitoring/overview`
- Line 3174: `/database/customers`

### 2. Added Debug Endpoint ✅
Created `/debug/manager-endpoints` to help diagnose the issue and verify the server is running the latest code.

### 3. Created Helper Scripts ✅

#### Force Restart (Kills old processes and starts fresh)
- `backend/force-restart.bat` (Windows)
- `backend/force-restart.sh` (Mac/Linux)

#### Server Version Check (Verifies latest code is running)
- `backend/check-server-version.bat` (Windows)
- `backend/check-server-version.sh` (Mac/Linux)

#### Endpoint Testing (Tests all 3 manager endpoints)
- `backend/test-manager-endpoints.bat` (Windows)
- `backend/test-manager-endpoints.sh` (Mac/Linux)

### 4. Updated Server Version ✅
Changed version from `6.4.0-MANAGER-ENDPOINTS-FIXED` to `6.5.0-MANAGER-ENDPOINTS-VERIFIED-WITH-DEBUG` so you can easily confirm the new code is running.

### 5. Created Documentation ✅
- `/backend/README.md` - Complete backend documentation
- `/backend/TROUBLESHOOTING-404.md` - Detailed troubleshooting guide
- This file - Quick fix reference

## Why This Happened

The endpoints were added to `server.tsx` but the backend server process was still running the old code. Deno doesn't auto-reload, so the server must be manually restarted to pick up code changes.

## Expected Server Console Output

When the server starts with the new code, you should see:

```
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
🟢                                                         🟢
🟢  BTM TRAVEL CRM SERVER - FULLY OPERATIONAL! ✅          🟢
🟢  VERSION: 6.5.0-MANAGER-ENDPOINTS-VERIFIED-WITH-DEBUG  🟢
🟢                                                         🟢
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢

✅ Manager endpoints: /team-performance, /agent-monitoring/overview
✅ Database endpoints: /database/clients, /database/customers
```

## Troubleshooting

### Still Getting 404 After Restart?

1. **Check if the server actually restarted:**
   - Look for the version number `6.5.0-MANAGER-ENDPOINTS-VERIFIED-WITH-DEBUG` in the console
   - If you see an older version, the old process is still running

2. **Manually kill all Deno processes:**
   
   **Windows:**
   ```bat
   taskkill /F /IM deno.exe
   ```
   
   **Mac/Linux:**
   ```bash
   pkill -9 -f deno
   # or
   killall -9 deno
   ```

3. **Wait 3 seconds, then start the server again:**
   ```bash
   cd backend
   deno run --allow-all server.tsx
   ```

### Getting 503 Instead of 404?

**This is GOOD!** 503 means the endpoints exist but MongoDB is still initializing. Just wait 30 seconds and refresh.

### Connection Timeout?

The server is not running. Start it with:
```bash
cd backend
start.bat        # Windows
./start.sh       # Mac/Linux
```

### Multiple Deno Processes Running?

**Windows:**
```bat
tasklist | find "deno"
```

**Mac/Linux:**
```bash
ps aux | grep deno
```

If you see multiple processes, kill them all and start fresh with `force-restart`.

## For Developers

### Backend Server Location
- ✅ **Correct:** `/backend/server.tsx`
- ❌ **Old/Wrong:** `/supabase/functions/server/index.tsx`

### Frontend Configuration
The frontend connects to the backend via `/utils/config.tsx`:
```typescript
export const BACKEND_URL = 'http://localhost:8000';
```

### Testing Endpoints Manually

#### Using curl (Windows/Mac/Linux):
```bash
# Test health
curl http://localhost:8000/health

# Test manager endpoints debug
curl http://localhost:8000/debug/manager-endpoints

# Test team performance
curl http://localhost:8000/team-performance

# Test agent monitoring
curl http://localhost:8000/agent-monitoring/overview

# Test customers database
curl http://localhost:8000/database/customers
```

#### Using PowerShell (Windows):
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/debug/manager-endpoints"
```

#### Using browser:
Open these URLs in your browser:
- http://localhost:8000/health
- http://localhost:8000/debug/manager-endpoints
- http://localhost:8000/test

## Next Steps

1. **Force restart the backend** using the scripts above
2. **Verify the endpoints** using check-server-version script
3. **Refresh the Manager Portal** in your browser
4. The Manager Portal should now load without 404 errors

## Need More Help?

See `/backend/TROUBLESHOOTING-404.md` for comprehensive troubleshooting steps.

## Files Modified

1. `/backend/server.tsx` - Added debug endpoint, updated version
2. `/backend/force-restart.bat` - New force restart script (Windows)
3. `/backend/force-restart.sh` - New force restart script (Mac/Linux)
4. `/backend/check-server-version.bat` - New version check (Windows)
5. `/backend/check-server-version.sh` - New version check (Mac/Linux)
6. `/backend/test-manager-endpoints.bat` - New endpoint test (Windows)
7. `/backend/test-manager-endpoints.sh` - New endpoint test (Mac/Linux)
8. `/backend/README.md` - New comprehensive backend documentation
9. `/backend/TROUBLESHOOTING-404.md` - New troubleshooting guide
10. `/backend/make-executable.sh` - Helper to make scripts executable
11. This file - Quick reference for the fix

---

**TL;DR:** Run `force-restart.bat` (Windows) or `./force-restart.sh` (Mac/Linux) in the `/backend` folder, then check with `check-server-version` script. Done! ✅
