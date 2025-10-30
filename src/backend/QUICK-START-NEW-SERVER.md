# 🚀 Quick Start - Backend Server v9.2.0

## New in This Version:
✅ Call Progress Tracking endpoints
✅ Number Recycling system
✅ Auto-completion tracking
✅ Manager dashboard integration

---

## Starting the Server:

### Windows:
```batch
cd backend
deno run --allow-all server.tsx
```

### Mac/Linux:
```bash
cd backend
deno run --allow-all server.tsx
```

---

## What You Should See:

```
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
🟢                                                         🟢
🟢  BTM TRAVEL CRM SERVER - FULLY OPERATIONAL! ✅          🟢
🟢  VERSION: 9.2.0 - CALL TRACKER INTEGRATED!             🟢
🟢                                                         🟢
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢

═══════════════════════════════════════════════════════════
📅 Server started: 2025-10-30T...
✅ ALL 57+ endpoints loaded and verified
✅ User Management: /users, /users/login, /login-audit
✅ Manager endpoints (BEFORE MongoDB check):
   - /team-performance ✅
   - /agent-monitoring/overview ✅
   - /database/clients ✅
   - /database/customers ✅
🔗 Call Progress & Recycling: ✅ NEW!
   - GET    /call-progress
   - POST   /call-progress/recycle
   - POST   /call-progress/archive-completed
   - POST   /call-progress/recycle-agent
✅ Admin endpoints: /database/reset-all, /cron/daily-archive
✅ Customer endpoints: All CRUD operations ready
═══════════════════════════════════════════════════════════
```

---

## New Endpoints Available:

### GET /call-progress
Returns daily call completion progress for all agents
- Shows completed vs uncompleted calls
- Separates CRM and Customer Service
- Auto-refreshes every 30 seconds

### POST /call-progress/recycle
Recycles all uncompleted calls back to database
- Returns numbers to available pool
- Deletes assignment records
- Available for reassignment

### POST /call-progress/archive-completed
Archives all completed calls
- Moves to archive collection
- Preserves for reporting
- Cleans up active assignments

### POST /call-progress/recycle-agent
Recycles specific agent's uncompleted numbers
- Filters by username and type
- Useful for sick days / early departures
- Returns count of recycled numbers

---

## Health Check:

```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "ok",
  "version": "9.2.0-CALL-TRACKER",
  "mongodb": "connected",
  "timestamp": "..."
}
```

---

## Test the New Endpoints:

### Test 1: Check Call Progress
```bash
curl http://localhost:8000/call-progress
```

Expected response:
```json
{
  "success": true,
  "progress": [...]
}
```

### Test 2: Health Check
```bash
curl http://localhost:8000/test
```

Should show all endpoints including Call Progress ones.

---

## Stopping the Server:

Press `Ctrl+C` in the terminal

Or kill it:
```bash
# Windows:
taskkill /F /IM deno.exe

# Mac/Linux:
pkill -f "deno.*server.tsx"
```

---

## Troubleshooting:

### Port Already in Use:
```bash
# Find what's using port 8000:
# Windows:
netstat -ano | findstr :8000

# Mac/Linux:
lsof -i :8000

# Kill it and restart
```

### MongoDB Connection Issues:
```
Server will auto-initialize MongoDB on first request.
Wait 5-10 seconds after starting, then try accessing an endpoint.
```

### 404 Errors in Frontend:
```
Make sure this server is running!
Check the version shows: 9.2.0-CALL-TRACKER
Check the Call Progress endpoints are listed in startup log
```

---

## Next Steps:

1. ✅ Server running on http://localhost:8000
2. ✅ MongoDB auto-initializes on first request
3. ✅ Call Progress endpoints ready
4. ✅ Manager Portal can now access Call Progress tab
5. ✅ Test the Call Completion Tracker!

---

**Server Version:** 9.2.0-CALL-TRACKER  
**Port:** 8000  
**Database:** MongoDB Atlas  
**Status:** Ready for Production! 🚀
