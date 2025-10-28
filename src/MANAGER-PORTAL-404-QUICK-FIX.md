# 🚨 MANAGER PORTAL 404 ERRORS - QUICK FIX

## What's Wrong?
You're seeing these errors:
```
❌ /team-performance - 404
❌ /agent-monitoring/overview - 404  
❌ /database/customers - 404
```

This means your backend server is either **not running** or running **old code**.

---

## ⚡ FASTEST FIX (Copy & Paste)

### Windows Users:
```bash
cd backend
fix-404-errors.bat
```

### Mac/Linux Users:
```bash
cd backend
chmod +x fix-404-errors.sh
./fix-404-errors.sh
```

**That's it!** The script will:
1. Kill old server processes
2. Start fresh server with latest code
3. Wait for MongoDB to initialize
4. Test all endpoints
5. Tell you when it's ready

---

## 📋 Manual Fix (If Scripts Don't Work)

### Step 1: Stop Old Server
**Windows:**
```bash
cd backend
taskkill /F /IM deno.exe
```

**Mac/Linux:**
```bash
cd backend
pkill -f "deno.*server.tsx"
```

### Step 2: Start New Server
**Windows:**
```bash
cd backend
deno run --allow-net --allow-env --allow-read server.tsx
```

**Mac/Linux:**
```bash
cd backend
deno run --allow-net --allow-env --allow-read server.tsx
```

### Step 3: Wait & Watch
You should see:
```
✅ MongoDB connection pool ready!
🚀 BTM Travel CRM Server running on MongoDB!
🔗 Manager Operations: ✅ ALL LOADED
   - GET    /team-performance (Full team metrics)
```

**IMPORTANT:** Wait 30 seconds for MongoDB to initialize!

### Step 4: Test It
Open in browser: http://localhost:8000/health

Should show: `"status": "ok"` or `"status": "initializing"`

### Step 5: Refresh Manager Portal
Go back to your CRM and refresh the Manager Portal page.

---

## 🔍 Still Not Working?

### Run Diagnostics:
**Windows:**
```bash
cd backend
diagnose-404.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x diagnose-404.sh
./diagnose-404.sh
```

### Common Issues:

**❌ Port 8000 already in use:**
- Another app is using port 8000
- Kill all Deno processes and try again
- Restart your computer if needed

**❌ MongoDB connection errors:**
- This is NORMAL during first 30 seconds
- Just wait and try again
- The portal will show "Connecting to database..."

**❌ Still getting 404:**
- Make sure you're in the `/backend` directory
- Check that `server.tsx` file exists
- Try running `deno cache server.tsx` first

---

## ✅ Success Indicators

You know it's working when you see:

1. **In server console:**
   ```
   ✅ MongoDB connection pool ready!
   🔗 Manager Operations: ✅ ALL LOADED
   ```

2. **In browser (http://localhost:8000/health):**
   ```json
   {"status": "ok", "mongodb": "connected"}
   ```

3. **In Manager Portal:**
   - No 404 errors in browser console
   - Team member cards showing data
   - No "Connecting to database..." alert

---

## 📞 Need Help?

1. Check the server console for error messages
2. Check browser console (F12) for errors
3. Make sure MongoDB connection string is set in environment
4. Verify all files exist in `/backend` folder

---

**Last Resort:** Restart your entire development environment and run the fix script again.
