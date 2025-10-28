# Troubleshooting 404 Errors for Manager Portal Endpoints

## Problem
The Manager Portal shows these errors:
```
404: /team-performance
404: /agent-monitoring/overview  
404: /database/customers
```

## Root Cause
The backend server is running **OLD CODE** that doesn't have these endpoints. Even though the endpoints exist in `server.tsx`, the running server process needs to be restarted to load them.

## Solution

### Quick Fix (Recommended)

**Windows:**
```bat
cd backend
force-restart.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x force-restart.sh
./force-restart.sh
```

### Verify the Fix

**Windows:**
```bat
cd backend
check-server-version.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x check-server-version.sh
./check-server-version.sh
```

You should see:
```json
{
  "success": true,
  "message": "Manager endpoints diagnostic",
  "version": "6.5.0-MANAGER-ENDPOINTS-VERIFIED-WITH-DEBUG",
  "managerEndpoints": {
    "/team-performance": {
      "status": "LOADED ✅"
    },
    "/agent-monitoring/overview": {
      "status": "LOADED ✅"
    },
    "/database/customers": {
      "status": "LOADED ✅"
    }
  }
}
```

If you still see 404, proceed to Manual Fix below.

### Manual Fix (If Quick Fix Doesn't Work)

1. **Kill ALL Deno processes:**

   **Windows:**
   ```bat
   taskkill /F /IM deno.exe
   ```

   **Mac/Linux:**
   ```bash
   pkill -9 -f deno
   # OR
   killall -9 deno
   ```

2. **Wait 3 seconds** for ports to release

3. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

4. **Start the server:**
   ```bash
   deno run --allow-all server.tsx
   ```

5. **Verify the server started with NEW code** - Look for this in the console:
   ```
   🟢 BTM TRAVEL CRM SERVER - FULLY OPERATIONAL! ✅
   🟢 VERSION: 6.5.0-MANAGER-ENDPOINTS-VERIFIED-WITH-DEBUG
   
   ✅ Manager endpoints: /team-performance, /agent-monitoring/overview
   ✅ Database endpoints: /database/clients, /database/customers
   ```

## Verification Steps

### Test 1: Check Server Version
```bash
curl http://localhost:8000/debug/manager-endpoints
```

Expected: JSON with "LOADED ✅" for all endpoints

### Test 2: Test Each Endpoint
```bash
curl http://localhost:8000/team-performance
curl http://localhost:8000/agent-monitoring/overview
curl http://localhost:8000/database/customers
```

Expected: Either `{"success": true, ...}` OR `{"success": false, "error": "Database is initializing"}` (503)

**Note:** 503 errors are OK during first 10-30 seconds while MongoDB connects. 404 errors mean old code is running.

## Common Issues

### Issue: "Connection refused" or "Cannot connect"
**Solution:** The server is not running. Start it with `force-restart.bat` or `force-restart.sh`

### Issue: 503 errors instead of 404
**Solution:** This is GOOD! The endpoints exist, MongoDB is just initializing. Wait 30 seconds and refresh.

### Issue: Still getting 404 after restart
**Solution:** 
1. Check if multiple Deno processes are running: `tasklist | find "deno"` (Windows) or `ps aux | grep deno` (Mac/Linux)
2. Kill ALL of them
3. Make sure you're in the `/backend` folder when starting the server
4. Check you're running `server.tsx`, NOT `/supabase/functions/server/index.tsx`

### Issue: "Database is initializing" for more than 2 minutes
**Solution:** Check MongoDB connection string in environment or mongodb.tsx. The connection might be failing.

## File Locations

- **Correct Server File:** `/backend/server.tsx` ✅
- **OLD Server File (DON'T USE):** `/supabase/functions/server/index.tsx` ❌
- **Backend Config:** `/utils/config.tsx` (should point to `http://localhost:8000`)

## Still Not Working?

If you've tried all the above and still getting 404s:

1. Open `/backend/server.tsx` in a text editor
2. Search for "3021" - you should see the `/team-performance` endpoint
3. Search for "3111" - you should see the `/agent-monitoring/overview` endpoint  
4. Search for "3174" - you should see the `/database/customers` endpoint

If these lines exist, the problem is definitely that the wrong server is running.

## Contact

If none of these solutions work, please provide:
1. Output of `check-server-version.bat` or `check-server-version.sh`
2. First 50 lines of server console output
3. Running processes: `tasklist | find "deno"` (Windows) or `ps aux | grep deno` (Mac/Linux)
