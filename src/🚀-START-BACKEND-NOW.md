# 🚀 START BACKEND SERVER NOW

## ⚠️ ERROR: Backend Not Available

You're seeing this error because the **MongoDB backend server is not running**.

```
[ADMIN] ❌ Backend not available - user management requires MongoDB connection
```

## ✅ SOLUTION: Start the Backend (Easy)

### Windows Users:
**Double-click this file:**
```
START-BACKEND-SIMPLE.bat
```

### Mac/Linux Users:
**Run this command in terminal:**
```bash
chmod +x START-BACKEND-SIMPLE.sh
./START-BACKEND-SIMPLE.sh
```

---

## 📋 What Happens Next

1. ✅ Backend server starts on `http://localhost:8000`
2. ✅ MongoDB database connects
3. ✅ User management becomes available
4. ✅ All features work normally

---

## ⚡ Quick Start (Alternative)

If the above doesn't work, try:

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

## 🔍 How to Know It's Working

When backend is running, you'll see:
```
✅ MongoDB connected successfully!
🚀 Server running on http://localhost:8000
```

---

## 💡 Important Notes

1. **Keep the terminal/command window OPEN** - Closing it stops the backend
2. **Backend MUST run** for user management (login, create users, etc.)
3. **Other features** like call tracking have offline mode, but users need backend

---

## 🚨 Still Having Issues?

### Check if Deno is installed:
```bash
deno --version
```

If you get an error, install Deno from: https://deno.land/

### Check if port 8000 is already in use:

**Windows:**
```cmd
netstat -ano | findstr :8000
```

**Mac/Linux:**
```bash
lsof -i :8000
```

If something is using port 8000, kill it or change the backend port.

---

## ✅ Once Backend is Running

1. Refresh your browser
2. Try logging in again
3. All features should work!

The error message will disappear once backend connects successfully! 🎉
