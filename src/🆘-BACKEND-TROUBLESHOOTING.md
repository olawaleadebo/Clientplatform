# 🆘 BACKEND SERVER TROUBLESHOOTING

## 🚨 Error: "Backend server not responding"

This error means the backend server is **NOT RUNNING** or cannot be reached.

---

## ✅ QUICK FIX (Choose ONE method):

### 🪟 **METHOD 1: Windows (Easiest)**
**Double-click this file in your project folder:**
```
🔴-START-BACKEND-FIXED.bat
```

### 🍎 **METHOD 2: Mac/Linux (Easiest)**
**Run in terminal from project folder:**
```bash
chmod +x 🔴-START-BACKEND-FIXED.sh
./🔴-START-BACKEND-FIXED.sh
```

### ⚙️ **METHOD 3: Manual Start**
**Run these commands in terminal:**
```bash
cd backend
deno run --allow-all server.tsx
```

---

## ✅ How to verify it's working:

After running ONE of the methods above, you should see:

```
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢��🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
🟢                                                         🟢
🟢  BTM TRAVEL CRM SERVER - FULLY OPERATIONAL! ✅          🟢
🟢  VERSION: 9.2.0 - CALL TRACKER INTEGRATED!             🟢
🟢                                                         🟢
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢

[MongoDB] ✅ Connected successfully
```

**⚠️ IMPORTANT:** Keep this terminal window **OPEN** while using the CRM!

---

## 🔧 Still not working? Try these:

### 1️⃣ **Check if Deno is installed:**
```bash
deno --version
```

**If you see "command not found":**
- Install Deno from: https://deno.land/
- **Windows:** `irm https://deno.land/install.ps1 | iex`
- **Mac/Linux:** `curl -fsSL https://deno.land/install.sh | sh`

### 2️⃣ **Kill any existing Deno processes:**

**Windows:**
```cmd
taskkill /F /IM deno.exe
```

**Mac/Linux:**
```bash
killall deno
```

Then try starting the server again.

### 3️⃣ **Check if port 8000 is in use:**

**Windows:**
```cmd
netstat -ano | findstr :8000
```

**Mac/Linux:**
```bash
lsof -i :8000
```

If you see any process using port 8000, kill it and try again.

### 4️⃣ **Restart your computer**
Sometimes the simplest solution works! After restart, run the start script again.

---

## 📝 Important Notes:

✅ The backend server **MUST** be running for the CRM to work  
✅ Keep the terminal window **OPEN** while using the CRM  
✅ You need to start it **every time** you use the CRM  
✅ One backend server can serve **multiple browser tabs/users**  

---

## 🎯 After backend is running:

1. ✅ You see the green "FULLY OPERATIONAL" message
2. ✅ You see "[MongoDB] ✅ Connected successfully"
3. ✅ The terminal stays open and shows logs
4. ✅ **NOW** refresh your browser and the CRM should work!

---

## 🆘 Still having issues?

Check these files for more help:
- `⚡-START-SERVER-FIRST.md` - Step-by-step startup guide
- `QUICK-START.md` - Complete setup instructions
- `README.md` - Full documentation

---

**Remember:** The backend server is like turning on your computer - you need to do it every time before using the CRM! 🚀
