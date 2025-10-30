# 🔄 RESTART BACKEND TO FIX CALL TRACKER ERROR

## The Error You're Seeing:
```
[CALL TRACKER] Failed to load progress: Error: Server responded with 404: 
{"success":false,"error":"Endpoint not found","path":"/call-progress","method":"GET"}
```

## What's Wrong:
Your backend server is running **OLD CODE** without the new Call Progress endpoints.

## ✅ The Fix (Takes 30 seconds):

### Option 1: Use the Restart Script (EASIEST)

#### On Windows:
```batch
1. Open File Explorer
2. Navigate to your project folder → backend folder
3. Double-click: RESTART-FOR-CALL-TRACKER.bat
4. Wait for server to restart
5. Look for this message:
   "🟢 VERSION: 9.2.0 - CALL TRACKER INTEGRATED!"
```

#### On Mac/Linux:
```bash
cd backend
chmod +x RESTART-FOR-CALL-TRACKER.sh
./RESTART-FOR-CALL-TRACKER.sh
```

---

### Option 2: Manual Restart

#### Step 1: Stop the Old Server
**Windows:**
```batch
# Press Ctrl+C in the terminal where server is running
# Or in a new terminal:
taskkill /F /IM deno.exe
```

**Mac/Linux:**
```bash
# Press Ctrl+C in the terminal where server is running
# Or in a new terminal:
pkill -f "deno.*server.tsx"
# Or:
lsof -ti:8000 | xargs kill -9
```

#### Step 2: Start the New Server
```bash
cd backend
deno run --allow-all server.tsx
```

---

## ✅ How to Verify It's Fixed:

When the server starts, you should see:

```
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
🟢                                                         🟢
🟢  BTM TRAVEL CRM SERVER - FULLY OPERATIONAL! ✅          🟢
🟢  VERSION: 9.2.0 - CALL TRACKER INTEGRATED!             🟢  ← LOOK FOR THIS!
🟢                                                         🟢
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢

...

🔗 Call Progress & Recycling: ✅ NEW!                      ← AND THIS!
   - GET    /call-progress
   - POST   /call-progress/recycle
   - POST   /call-progress/archive-completed
   - POST   /call-progress/recycle-agent
```

---

## ✅ Test It Works:

1. **Go back to your app**
2. **Login as Manager** (username: manager, password: manager123)
3. **Go to Manager Portal**
4. **Click "Call Progress" tab**
5. **You should now see:**
   - No more 404 errors
   - Overall statistics card
   - Call progress data (if you have assignments)
   - No errors in console

---

## 🔍 Troubleshooting:

### "I still see 404 errors"
```
1. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
2. Check the backend terminal - is it showing version 9.2.0?
3. Check the backend logs - do you see the "Call Progress" endpoints listed?
4. Try restarting the backend one more time
```

### "Server won't start"
```
1. Make sure you're in the backend folder:
   cd backend
   
2. Make sure Deno is installed:
   deno --version
   
3. Check if port 8000 is already in use:
   # Windows:
   netstat -ano | findstr :8000
   
   # Mac/Linux:
   lsof -i :8000
   
4. Kill the process and try again
```

### "I see errors about MongoDB"
```
The Call Progress endpoints require MongoDB to be initialized.
The server will auto-initialize MongoDB when you first access it.
Just wait 5-10 seconds after starting the server, then try again.
```

---

## 📊 Expected Behavior After Fix:

### When you access Call Progress tab:
1. ✅ Page loads without errors
2. ✅ Overall statistics show (even if 0s)
3. ✅ Agent cards display if numbers are assigned
4. ✅ Progress bars render correctly
5. ✅ Recycle buttons work
6. ✅ Auto-refresh happens every 30 seconds

### In the backend console you'll see:
```
[BTM CRM Server] [GET] /call-progress
[CALL PROGRESS] Getting call progress for all agents
[MongoDB] Connected and ready!
```

---

## 🎯 Quick Command Reference:

### Start Backend:
```bash
cd backend
deno run --allow-all server.tsx
```

### Kill Old Backend:
```bash
# Windows:
taskkill /F /IM deno.exe

# Mac/Linux:
pkill -f "deno.*server.tsx"
```

### Check Backend Version:
```bash
curl http://localhost:8000/health
# Should show: "version": "9.2.0-CALL-TRACKER"
```

---

## 🚀 Summary:

1. **Stop** the old backend server (Ctrl+C or taskkill)
2. **Start** the new backend server (deno run --allow-all server.tsx)
3. **Look** for version 9.2.0 in the startup message
4. **Verify** the Call Progress endpoints are listed
5. **Test** in the app - Call Progress tab should work!

---

**That's it! The Call Tracker should now work perfectly! 🎉**

If you still have issues after restarting, check:
- Backend is actually running on port 8000
- MongoDB is connected
- You're logged in as Manager or Admin
- Browser cache is cleared (Ctrl+Shift+Delete)
