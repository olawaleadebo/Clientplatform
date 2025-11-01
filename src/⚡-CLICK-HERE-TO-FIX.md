# ⚡ CLICK HERE TO FIX - Backend Not Available

## 🎯 Quick Fix (Choose One)

### Option 1: Double-Click to Start (Easiest)

**Windows Users:**
```
📁 Double-click: START-BACKEND-SIMPLE.bat
```

**Mac/Linux Users:**
```bash
# First time only - make it executable:
chmod +x START-BACKEND-SIMPLE.sh

# Then run:
./START-BACKEND-SIMPLE.sh
```

---

### Option 2: Manual Start

Open terminal/command prompt and run:

**Windows:**
```cmd
cd backend
deno run --allow-net --allow-env --allow-read --allow-write server.tsx
```

**Mac/Linux:**
```bash
cd backend
deno run --allow-net --allow-env --allow-read --allow-write server.tsx
```

---

## ✅ How to Know It's Working

You should see this in the terminal:
```
✅ MongoDB connected successfully!
🚀 Server running on http://localhost:8000
```

Then in your browser:
1. Refresh the page
2. Go to Admin Settings
3. You should see users and no more error messages!

---

## 🚨 Still Not Working?

### Check 1: Is Deno Installed?
```bash
deno --version
```

If you see an error, install Deno:
- **Windows**: https://deno.land/#installation
- **Mac**: `brew install deno` or `curl -fsSL https://deno.land/install.sh | sh`
- **Linux**: `curl -fsSL https://deno.land/install.sh | sh`

### Check 2: Is Port 8000 Busy?

**Windows:**
```cmd
netstat -ano | findstr :8000
```

**Mac/Linux:**
```bash
lsof -i :8000
```

If something is running on port 8000, kill it or change the backend port.

---

## 💡 Keep Backend Running

**IMPORTANT:** Keep the terminal/command window OPEN while using the app!

- Closing the terminal = Backend stops
- Backend stops = User management won't work

---

## 📋 What This Fixes

✅ User login
✅ Creating new users
✅ Editing users
✅ Deleting users
✅ All user management features

---

**After starting backend, click the "Retry Connection" button in the Admin panel!** 🎉
