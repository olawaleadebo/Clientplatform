# BTM Travel CRM Backend Server

MongoDB-based backend server for BTM Travel CRM platform.

## Quick Start

### Windows
```bat
cd backend
start.bat
```

### Mac/Linux
```bash
cd backend
chmod +x start.sh
./start.sh
```

## If You're Getting 404 Errors

Run the force restart script:

### Windows
```bat
cd backend
force-restart.bat
```

### Mac/Linux  
```bash
cd backend
chmod +x force-restart.sh
./force-restart.sh
```

See [TROUBLESHOOTING-404.md](./TROUBLESHOOTING-404.md) for detailed help.

## Server Information

- **Port:** 8000
- **URL:** http://localhost:8000
- **Version:** 6.5.0-MANAGER-ENDPOINTS-VERIFIED-WITH-DEBUG
- **Database:** MongoDB (Atlas)

## Available Scripts

| Script | Purpose |
|--------|---------|
| `start.bat` / `start.sh` | Start the server normally |
| `force-restart.bat` / `force-restart.sh` | Kill old processes and start fresh |
| `kill-old-servers.bat` / `kill-old-servers.sh` | Kill all Deno processes |
| `check-server-version.bat` / `check-server-version.sh` | Verify server is running latest code |
| `test-manager-endpoints.bat` / `test-manager-endpoints.sh` | Test manager portal endpoints |
| `verify-endpoints.bat` / `verify-endpoints.sh` | Test all major endpoints |
| `test-connection.bat` / `test-connection.sh` | Test server connectivity |

## Endpoints Overview

### Health & Status
- `GET /health` - Server health check
- `GET /test` - Full system test
- `GET /debug/manager-endpoints` - Manager endpoints diagnostic

### Authentication
- `POST /users/login` - User login
- `GET /users` - List users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Manager Portal (Fixed in v6.5.0)
- `GET /team-performance` ✅ - Team performance metrics
- `GET /agent-monitoring/overview` ✅ - Agent monitoring dashboard
- `GET /agent-monitoring/agent/:id` - Individual agent details

### Database
- `GET /database/clients` - All clients (CRM numbers)
- `GET /database/customers` ✅ - All customers
- `GET /database/customers/assigned/:id` - Assigned customers
- `POST /database/clients/import` - Import clients
- `POST /database/customers/import` - Import customers

### Assignments & Claims
- `GET /assignments` - All assignments
- `POST /assignments/claim` - Claim a number
- `POST /assignments/mark-called` - Mark as called
- `POST /claim-number` - Claim number (legacy)
- `POST /release-number` - Release claim
- `POST /extend-number-claim` - Extend claim

### Call Management
- `GET /call-logs` - Call history
- `POST /call-logs` - Log a call
- `GET /call-scripts` - Call scripts
- `POST /call-scripts` - Add script
- `GET /call-scripts/active/:type` - Active script

### Settings
- `GET /smtp-settings` - SMTP configuration
- `POST /smtp-settings` - Update SMTP
- `POST /smtp-test` - Test SMTP
- `GET /threecx-settings` - 3CX configuration
- `POST /threecx-settings` - Update 3CX
- `GET /email-recipients` - Email recipients list
- `POST /email-recipients` - Update recipients

### Admin Operations
- `POST /database/reset-all` - Reset all data
- `POST /admin/delete-selected-data` - Delete specific data
- `POST /cron/daily-archive` - Run archive job
- `DELETE /database/clients/clear-all` - Clear all clients

### Archive
- `GET /database/clients/archive` - Archived clients
- `GET /database/customers/archive` - Archived customers
- `POST /database/clients/archive/bulk-restore` - Restore clients
- `POST /database/customers/archive/bulk-restore` - Restore customers

## MongoDB Collections

- `users` - User accounts
- `numbers_database` - Client/CRM phone numbers
- `customers_database` - Customer records
- `number_assignments` - Assignment tracking
- `number_claims` - Number claim locks
- `call_logs` - Call history
- `call_scripts` - Call scripts
- `daily_progress` - Daily stats
- `promotions` - Promo sales
- `archive` - Archived records
- `login_audit` - Login attempts
- `smtp_settings` - Email config
- `threecx_settings` - Phone config
- `email_recipients` - Email lists

## MongoDB Connection

The server connects to MongoDB Atlas automatically. Connection details are in `mongodb.tsx`.

**First startup may take 10-30 seconds** while MongoDB connects. You'll see:
```
🔧 Starting MongoDB initialization in background...
✅ MongoDB connection pool ready!
```

## Troubleshooting

### Server won't start
1. Check if port 8000 is already in use
2. Kill old Deno processes: `force-restart.bat` / `force-restart.sh`

### Getting 404 errors
The server is running old code. Run `force-restart.bat` / `force-restart.sh`

### Getting 503 errors
MongoDB is initializing. Wait 30 seconds and try again.

### Connection timeout
1. Server is not running - start it with `start.bat` / `start.sh`
2. Wrong URL in `/utils/config.tsx` - should be `http://localhost:8000`

See [TROUBLESHOOTING-404.md](./TROUBLESHOOTING-404.md) for detailed troubleshooting.

## Development

### File Structure
```
backend/
├── server.tsx          # Main server file ⭐
├── mongodb.tsx         # MongoDB connection
├── start.bat           # Start script (Windows)
├── start.sh            # Start script (Mac/Linux)
├── force-restart.*     # Force restart scripts
├── check-server-version.*  # Version check
├── test-*.* / verify-*.*   # Test scripts
└── README.md           # This file
```

### Making Changes

1. Edit `server.tsx`
2. Stop the server (Ctrl+C)
3. Restart with `start.bat` / `start.sh`

**OR** just run `force-restart.bat` / `force-restart.sh`

### Adding New Endpoints

1. Add endpoint handler in `server.tsx` inside the main try block
2. Add endpoint to console log at bottom of file
3. Restart server
4. Test with curl or test scripts

Example:
```typescript
if (path === '/my-new-endpoint' && req.method === 'GET') {
  const readyCheck = checkMongoReady();
  if (readyCheck) return readyCheck;
  
  try {
    const collection = await getCollection(Collections.MY_COLLECTION);
    const data = await collection.find({}).toArray();
    
    return new Response(
      JSON.stringify({ success: true, data: convertMongoDocs(data) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

## Important Notes

- ✅ **USE THIS FILE:** `/backend/server.tsx`
- ❌ **DON'T USE:** `/supabase/functions/server/index.tsx` (old/deprecated)
- The server must be running for the frontend to work
- All endpoints require the server to be at `http://localhost:8000`
- Frontend config is at `/utils/config.tsx`

## Version History

- **6.5.0** - Added debug endpoint and force restart scripts to fix 404 issues
- **6.4.0** - Manager portal endpoints fixed
- **6.3.0** - All endpoints working
- **6.0.0** - MongoDB migration complete, Supabase removed
- **5.x** - Legacy Supabase version (deprecated)
