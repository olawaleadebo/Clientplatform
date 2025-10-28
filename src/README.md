# BTM Travel CRM - Customer Management Platform

A comprehensive CRM and customer management platform for BTMTravel with MongoDB backend integration.

---

## 🚀 Quick Start

### Prerequisites
- Deno runtime installed ([Download Deno](https://deno.land/))
- MongoDB Atlas account (or local MongoDB)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Initial Setup & First-Time Run

1. **Configure MongoDB Connection**
   ```bash
   # Edit backend/mongodb.tsx with your MongoDB credentials
   # Replace the connection string with your MongoDB Atlas URI
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   deno run --allow-net --allow-env server.tsx
   ```
   
   **✅ Success Indicators:**
   - You should see: `🚀 BTM Travel CRM Server running on MongoDB!`
   - Version displayed: `v6.0.0-ALL-ENDPOINTS-VERIFIED`
   - MongoDB status: `✅ MongoDB connection pool ready!`
   - All 50+ endpoints loaded

3. **Open Application**
   - Open your browser and navigate to the application
   - Or use a local development server

4. **First-Time Login**
   
   **Default Admin Account:**
   - Username: `admin`
   - Password: `admin123`
   
   **⚠️ Important:** Change the default password immediately after first login!

---

## 🔧 Common Issues & Solutions

### 🚨 Backend Server Not Responding (404 Errors)

**Symptoms:**
```
❌ [BACKEND] 404: {"success":false,"error":"Endpoint not found"}
```

**Cause:** Backend server is running old code or hasn't been restarted after updates.

**Solution:**
1. Stop the backend server (Ctrl+C in the terminal)
2. Restart it:
   ```bash
   cd backend
   deno run --allow-net --allow-env server.tsx
   ```
3. Wait for MongoDB to initialize (20-30 seconds)
4. Refresh your browser

---

### 🔐 Login Fails with "Invalid Credentials" (401 Error)

**Symptoms:**
```
❌ [BACKEND ERROR] 401: {"success":false,"error":"Invalid credentials"}
[LOGIN] No match found for username: manager
```

**Cause:** User doesn't exist in MongoDB database.

**Solution Option 1 - Use Admin Panel (Recommended):**
1. Login as `admin` (username: `admin`, password: `admin123`)
2. Go to Admin Settings → User Management
3. Create new users with appropriate roles

**Solution Option 2 - Initialize Default Users:**
1. Open browser console (F12)
2. Navigate to Network tab
3. Send POST request to `http://localhost:8000/setup/init`
4. This creates the default admin user if none exists

**Solution Option 3 - Create Manager User Manually:**
Use the System Initializer in the Admin panel to create missing users.

---

### ⏱️ MongoDB Initialization Timeout

**Symptoms:**
```
⏱️ Backend health check timeout - server may be starting up
```

**Cause:** MongoDB is still connecting (normal during startup).

**Solution:**
- Wait 20-30 seconds for MongoDB to fully initialize
- The app will automatically retry connections
- Look for: `✅ MongoDB connection pool ready!` in the backend terminal

---

### 🔌 Backend Connection Failed

**Symptoms:**
```
❌ Backend connection failed: TypeError: Failed to fetch
```

**Possible Causes & Solutions:**

1. **Backend not running:**
   - Start the backend: `cd backend && deno run --allow-net --allow-env server.tsx`

2. **Wrong backend URL:**
   - Check `utils/config.tsx` for correct backend URL
   - Default: `http://localhost:8000`

3. **Port already in use:**
   - Kill existing Deno processes
   - Windows: `taskkill /F /IM deno.exe`
   - Mac/Linux: `pkill -f "deno run"`
   - Restart backend server

4. **MongoDB connection issues:**
   - Verify MongoDB connection string in `backend/mongodb.tsx`
   - Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for development)
   - Ensure database user has read/write permissions

---

### 🎯 3CX Phone System Issues

**Symptoms:**
- Click-to-call not working
- Call panel not appearing
- Phone integration errors

**Solutions:**
1. Verify 3CX settings in Admin Settings → 3CX Settings
2. Check phone system API credentials
3. Ensure 3CX server is accessible from your network
4. Review browser console for specific error messages
5. Confirm WebRTC/SIP settings are correct

---

## 📋 Features

### User Roles & Portals

#### **Agent Portal**
- Focused daily call list interface
- Real-time progress tracking with daily targets
- Contact organization by status (pending/completed)
- 3CX phone integration with click-to-call
- Call scripts and outcome logging
- Quick access to assigned contacts
- Automatic number claiming and release

#### **Manager Portal**
- Team oversight dashboard with real-time metrics
- Assignment management (push numbers to agents)
- Performance analytics and team monitoring
- Number bank management
- Archive and recycling controls
- Toggle between modern portal and classic tabs view
- Granular permission management for team members
- Real-time agent monitoring and status tracking

#### **Admin Settings**
- Full system configuration and control
- User and role management (create/edit/delete users)
- SMTP email settings and testing
- 3CX phone system configuration
- Database management tools (import/export/reset)
- Login audit and security monitoring
- System health checks and diagnostics
- Email recipient management

### Core Modules

#### 1. **Prospective Client (CRM)**
- Centralized database-driven call lists
- Manager-controlled daily assignments
- Call scripting and prompts for consistency
- Outcome tracking and detailed logging
- Email integration for follow-ups
- Automatic archiving of completed calls
- Number recycling system

#### 2. **Promo Sales**
- Promotion management for adventure.btmtravel.net
- Campaign creation, editing, and scheduling
- Performance tracking and analytics
- Multi-channel promotion support

#### 3. **Customer Service**
- Existing customer database
- Booking details and reference management
- Contact history tracking
- Purchase history visualization
- Quick communication tools
- Customer segmentation (Retails/Corporate/Channel)

### Advanced Capabilities

- **Centralized Database Manager**: Manager/admin controlled number bank with daily assignments and filtering
- **Automatic Archiving**: Called numbers auto-archive and become available for recycling
- **3CX Integration**: Full phone system with call controls, active call panel, logging, and analytics
- **Flexible Permissions**: Granular role-based access control system
- **Nigerian Phone Format**: Automatic formatting for +234 XXX XXX XXXX
- **Modern UI**: Gradients, glassmorphism effects, smooth animations, responsive design

---

## 🎨 Design Philosophy

Modern, professional interface featuring:
- Gradient backgrounds with glassmorphism effects
- Smooth transitions and animations (motion/react)
- Responsive, mobile-friendly layout
- Intuitive navigation and workflows
- Real-time status updates
- Clean, minimalist design aesthetic

---

## 🔧 Technology Stack

- **Frontend**: React 18, Tailwind CSS v4, TypeScript
- **Backend**: Deno, TypeScript
- **Database**: MongoDB Atlas (cloud) or MongoDB (local)
- **Phone System**: 3CX Integration with WebRTC
- **Email**: SMTP Configuration
- **UI Components**: Shadcn/ui, Lucide React icons
- **Animation**: Motion (Framer Motion)
- **Charts**: Recharts
- **PDF/PPT Export**: jsPDF, pptxgen

---

## 📁 Project Structure

```
btm-travel-crm/
├── backend/
│   ├── server.tsx          # Main Deno backend server (50+ endpoints)
│   ├── mongodb.tsx         # MongoDB connection & queries
│   ├── ENDPOINTS.md        # Complete API documentation
│   ├── deno.json          # Deno configuration
│   ├── start.sh/.bat      # Quick start scripts
│   └── deploy.json        # Deployment config
├── components/
│   ├── AgentPortal.tsx    # Agent-focused daily call interface
│   ├── ManagerPortal.tsx  # Manager dashboard with team oversight
│   ├── ClientCRM.tsx      # Prospective clients module
│   ├── CustomerService.tsx # Customer management module
│   ├── PromoSales.tsx     # Promotions module
│   ├── AdminSettings.tsx  # System configuration
│   ├── DatabaseManager.tsx # Centralized database management
│   ├── NumberBankManager.tsx # Number assignment system
│   ├── ArchiveManager.tsx # Archive and recycling
│   ├── ThreeCXContext.tsx # Phone integration provider
│   ├── UserContext.tsx    # User authentication & state
│   └── ui/                # Shadcn UI components library
├── utils/
│   ├── backendService.tsx # API communication layer
│   ├── config.tsx         # App configuration
│   └── clipboard.tsx      # Utility functions
├── styles/
│   └── globals.css        # Global styles, themes & typography
├── App.tsx                # Main application component
├── index.html             # Entry point
└── README.md              # This file
```

---

## 🎯 Common Backend Commands

```bash
# Start backend server
cd backend
deno run --allow-net --allow-env server.tsx

# Start with file watching (auto-restart on changes)
cd backend
deno run --allow-net --allow-env --watch server.tsx

# Check backend health
curl http://localhost:8000/health

# Check all endpoints
curl http://localhost:8000/debug/endpoints

# Test server version
curl http://localhost:8000/test-setup

# Initialize default admin user
curl -X POST http://localhost:8000/setup/init

# View all users (debugging)
curl http://localhost:8000/debug/users
```

---

## 🔒 Security & Best Practices

### Production Deployment Checklist

- [ ] **Change default credentials** - Update admin password immediately
- [ ] **Secure MongoDB** - Use strong passwords and IP whitelisting
- [ ] **Environment variables** - Never commit connection strings to version control
- [ ] **HTTPS/SSL** - Use secure connections in production
- [ ] **Regular backups** - Schedule MongoDB database backups
- [ ] **Update dependencies** - Keep Deno and packages up to date
- [ ] **3CX Security** - Secure phone system credentials
- [ ] **SMTP Security** - Use app-specific passwords for email

### Important Security Notes

- **Figma Make** is not designed for collecting PII or securing highly sensitive data
- This is a prototype/development platform - conduct proper security audit before production use
- Consider implementing additional authentication layers (2FA, OAuth) for production
- Regularly review login audit logs in Admin panel

---

## 📖 Documentation

### In-App Documentation
- Click **"Help & Documentation"** button in the app header
- Access role-specific guides and tutorials
- View system status and health checks

### Backend API Documentation
- See `backend/ENDPOINTS.md` for complete API reference
- Lists all 50+ endpoints with parameters and examples

### Additional Resources
- **User Management**: Admin Settings → User Management
- **Call Scripts**: Admin Settings → Call Script Manager
- **Phone Settings**: Admin Settings → 3CX Settings
- **Email Settings**: Admin Settings → SMTP Settings

---

## 🔄 Development Workflow

### Making Changes to Backend

1. Edit `backend/server.tsx` or `backend/mongodb.tsx`
2. **Stop the running server** (Ctrl+C)
3. **Restart the server**:
   ```bash
   cd backend
   deno run --allow-net --allow-env server.tsx
   ```
4. Verify changes in terminal output
5. Test endpoints using browser or curl

### Making Changes to Frontend

1. Edit components in `/components` directory
2. Browser will hot-reload automatically (if using dev server)
3. Or refresh browser manually
4. Check browser console for errors

### Database Changes

1. Backup data first (use Database Manager export)
2. Make changes through Admin panel when possible
3. For direct MongoDB changes, update `backend/mongodb.tsx`
4. Restart backend server to apply changes
5. Test thoroughly before committing

---

## 🐛 Debugging Tips

### Enable Detailed Logging

```bash
# Backend - already includes detailed console logs
cd backend
deno run --allow-net --allow-env server.tsx

# Look for these key indicators:
# ✅ = Success
# ❌ = Error
# ⚠️ = Warning
# 🔍 = Debug info
```

### Browser Console

1. Open Developer Tools (F12)
2. Check Console tab for frontend errors
3. Check Network tab for failed API requests
4. Look for patterns in error messages

### Common Error Patterns

- **404 errors** → Backend needs restart
- **401 errors** → User doesn't exist or wrong credentials
- **503 errors** → MongoDB still initializing (wait 30 sec)
- **CORS errors** → Backend not running or wrong URL
- **Timeout errors** → MongoDB connection issue

---

## 📊 System Requirements

### Minimum Requirements
- **RAM**: 4GB
- **CPU**: Dual-core processor
- **Storage**: 500MB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet**: Stable connection for MongoDB Atlas

### Recommended
- **RAM**: 8GB or more
- **CPU**: Quad-core processor
- **Storage**: 1GB free space
- **Browser**: Latest version of Chrome or Edge
- **Internet**: High-speed connection

---

## 🚀 Quick Reference

### Default Credentials
```
Username: admin
Password: admin123
```

### Backend URL
```
http://localhost:8000
```

### Key Directories
```
/backend          → Server code
/components       → React components
/utils            → Helper functions
/styles           → CSS and themes
```

### Important Files
```
/backend/server.tsx      → Main backend server
/backend/mongodb.tsx     → Database connections
/App.tsx                 → Main React app
/utils/config.tsx        → Configuration
/utils/backendService.tsx → API calls
```

---

## 📝 Version History

### v6.0.0 (Current)
- ✅ All 50+ endpoints verified and operational
- ✅ Complete MongoDB integration
- ✅ Centralized database management
- ✅ Manager portal with team oversight
- ✅ Agent portal with focused call lists
- ✅ 3CX phone system integration
- ✅ Automatic archiving and recycling
- ✅ Flexible role-based permissions

---

## 📞 Support

### Getting Help

1. **Check this README** for common issues
2. **Review browser console** for error messages
3. **Check backend terminal** for server logs
4. **Use in-app Help** button for role-specific guides
5. **Review API docs** in `backend/ENDPOINTS.md`

### Reporting Issues

When reporting issues, include:
- Error messages (browser console + backend terminal)
- Steps to reproduce
- Expected vs actual behavior
- Server version (check `/test` endpoint)
- Browser and OS information

---

## 📝 License

Proprietary - BTM Travel

**Copyright © 2024 BTM Travel. All rights reserved.**

---

## 🙏 Acknowledgments

See `Attributions.md` for complete list of open-source libraries and contributors.

---

**⚡ Pro Tip**: After making any changes to backend code, always restart the server! The most common issue is forgetting to restart after updates.

**🎯 Next Steps**: 
1. Start the backend server
2. Login as admin
3. Create manager and agent users
4. Configure 3CX and SMTP settings
5. Start using the platform!

---

**Last Updated**: October 28, 2024
