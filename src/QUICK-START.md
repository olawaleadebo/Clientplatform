# BTM Travel CRM - Quick Start Guide

## Start the Application

### 1. Start Backend Server

#### Windows
```bat
cd backend
force-restart.bat
```

#### Mac/Linux
```bash
cd backend
chmod +x force-restart.sh
./force-restart.sh
```

**Wait for:** "BTM TRAVEL CRM SERVER - FULLY OPERATIONAL! ✅"

### 2. Start Frontend
(In a separate terminal/command prompt)

```bash
npm run dev
# or
yarn dev
```

### 3. Open Browser
Navigate to: `http://localhost:5173` (or the port shown in your terminal)

## Default Login

**Admin Account:**
- Username: `admin`
- Password: `admin123`

## Common Issues

### Manager Portal Shows 404 Errors?
```bash
cd backend
force-restart.bat       # Windows
./force-restart.sh      # Mac/Linux
```

### Backend Won't Start?
Kill old processes first:

**Windows:**
```bat
taskkill /F /IM deno.exe
cd backend
start.bat
```

**Mac/Linux:**
```bash
pkill -9 -f deno
cd backend
./start.sh
```

### Frontend Can't Connect to Backend?
1. Check backend is running on port 8000
2. Check `/utils/config.tsx` has: `export const BACKEND_URL = 'http://localhost:8000';`
3. Visit http://localhost:8000/health in browser to verify server is up

### Getting 503 Errors?
MongoDB is initializing. Wait 30 seconds and refresh.

## Verify Everything is Working

### Test Backend
```bash
cd backend
check-server-version.bat    # Windows
./check-server-version.sh   # Mac/Linux
```

Should show: `"version": "6.5.0-MANAGER-ENDPOINTS-VERIFIED-WITH-DEBUG"`

### Test Manager Endpoints
```bash
cd backend
test-manager-endpoints.bat  # Windows
./test-manager-endpoints.sh # Mac/Linux
```

All three endpoints should return JSON (not 404)

## User Roles

### Admin
- Full access to all features
- Can manage users, roles, permissions
- Access to Admin Settings tab
- Can see Manager Portal

### Manager
- Team oversight dashboard
- Can assign numbers to agents
- View agent performance
- Access Manager Portal

### Agent
- Daily call lists
- Client CRM
- Promo Sales
- Customer Service
- Agent Portal (streamlined interface)

## Key Features

### For Agents
- **Agent Portal** - Streamlined call interface with daily assignments
- **Classic View** - Full tabs (Prospective Client, Promo Sales, Customer Service)
- **3CX Integration** - Click-to-call, active call panel
- **Call Scripts** - Scripted prompts during calls
- **Number Claims** - Auto-locking system (10min default)

### For Managers
- **Team Performance** - Real-time metrics for all agents
- **Agent Monitoring** - Individual agent oversight
- **Number Bank** - Centralized client/customer database
- **Assignment Management** - Push numbers to agents daily
- **Analytics** - Call history, completion rates

### For Admins
- **User Management** - Create/edit/delete users
- **Role & Permissions** - Granular permission system
- **Database Manager** - Import/export/clear data
- **SMTP Settings** - Email configuration
- **3CX Settings** - Phone system integration
- **Archive Manager** - Auto-archive called numbers

## Database Collections

All data is stored in MongoDB:
- **Users** - User accounts and roles
- **Numbers Database** - Client/CRM numbers (Prospective Clients)
- **Customers Database** - Existing customers
- **Assignments** - Number assignments to agents
- **Call Logs** - Complete call history
- **Archive** - Archived/completed records

## Important Files

### Configuration
- `/utils/config.tsx` - Backend URL
- `/backend/mongodb.tsx` - Database connection
- `/backend/server.tsx` - Main backend server

### Documentation
- `/MANAGER-PORTAL-404-FIX.md` - Fix 404 errors
- `/backend/README.md` - Backend documentation
- `/backend/TROUBLESHOOTING-404.md` - Detailed troubleshooting
- This file - Quick start

## Need Help?

### Backend Issues
See: `/backend/TROUBLESHOOTING-404.md`

### Manager Portal 404s
See: `/MANAGER-PORTAL-404-FIX.md`

### General Questions
Check `/backend/README.md` for complete endpoint list and documentation

## Development Workflow

### Making Backend Changes
1. Edit `/backend/server.tsx`
2. Stop server (Ctrl+C)
3. Restart: `force-restart.bat` or `./force-restart.sh`
4. Verify: `check-server-version` script

### Making Frontend Changes
Hot reload is enabled - just save and see changes!

### Adding Users
1. Login as admin
2. Go to Admin Settings tab
3. Click "User Management"
4. Click "Add New User"
5. Fill details and select role
6. Save

### Importing Data
1. Go to Admin Settings
2. Click "Database Manager"
3. Choose Client or Customer import
4. Paste phone numbers (one per line)
5. Click Import

### Assigning Numbers to Agents
1. Go to Manager Portal (Manager/Admin only)
2. Click "Assignments" tab
3. Select agent, type (Client/Customer), count
4. Click "Assign Numbers"
5. Numbers automatically pushed to agent's daily list

## Tips

- **First time setup:** Run `/backend/force-restart.bat` to ensure latest code
- **MongoDB takes 10-30s** to initialize on first start
- **Claims auto-expire** after 10 minutes to prevent number hoarding
- **Daily archive** runs automatically via cron
- **Use Agent Portal** for streamlined calling experience
- **Manager can see all** agent activity in real-time

## Production Deployment

See `/backend/README.md` for deployment options:
- Deno Deploy
- Railway
- Render
- Fly.io

Update `BACKEND_URL` in `/utils/config.tsx` to your deployed URL.

---

**Ready to go!** Start with `force-restart.bat` / `./force-restart.sh` in the backend folder, then start your frontend dev server. 🚀
