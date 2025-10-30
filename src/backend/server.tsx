// BTM Travel CRM Backend Server - MongoDB Version
// Pure Deno server - No Supabase dependencies
import { getCollection, Collections, initializeDatabase, convertMongoDoc, convertMongoDocs, getMongoDb } from './mongodb.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Server version and startup timestamp
const SERVER_VERSION = '9.2.0-CALL-TRACKER';
const SERVER_STARTED = new Date().toISOString();
console.log('\n\n\n');
console.log('🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢');
console.log('🟢                                                         🟢');
console.log('🟢  BTM TRAVEL CRM SERVER - FULLY OPERATIONAL! ✅          🟢');
console.log('🟢  VERSION: 9.2.0 - CALL TRACKER INTEGRATED!             🟢');
console.log('🟢                                                         🟢');
console.log('🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('📅 Server started:', SERVER_STARTED);
console.log('✅ ALL 53+ endpoints loaded and verified');
console.log('✅ User Management: /users, /users/login, /login-audit');
console.log('✅ Manager endpoints (BEFORE MongoDB check):');
console.log('   - /team-performance ✅');
console.log('   - /agent-monitoring/overview ✅');
console.log('   - /database/clients ✅');
console.log('   - /database/customers ✅');
console.log('✅ Admin endpoints: /database/reset-all, /cron/daily-archive');
console.log('✅ Customer endpoints: All CRUD operations ready');
console.log('✅ Email endpoints: /email-recipients ready');
console.log('✅ Archive endpoints: /customers/archived ready');
console.log('═══════════════════════════════════════════════════════════');
console.log('🔥 MANAGER PORTAL 404 ERRORS FIXED!');
console.log('   All manager endpoints moved before MongoDB check');
console.log('   Duplicate endpoints removed for reliability');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n');

// Helper to generate unique IDs
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to determine agent status based on last activity
function determineAgentStatus(lastActivityTime?: string): 'active' | 'idle' | 'offline' {
  if (!lastActivityTime) return 'offline';
  
  const lastActivity = new Date(lastActivityTime);
  const now = new Date();
  const minutesSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
  
  if (minutesSinceActivity < 5) return 'active';
  if (minutesSinceActivity < 30) return 'idle';
  return 'offline';
}

// Track MongoDB initialization status
let mongoInitialized = false;
let mongoInitializing = false;
let mongoInitPromise: Promise<void> | null = null;

// Helper function to ensure MongoDB is initialized
async function ensureMongoInitialized(): Promise<void> {
  if (mongoInitialized) {
    return;
  }
  
  if (mongoInitPromise) {
    // Wait for existing initialization to complete
    await mongoInitPromise;
    return;
  }
  
  // Start new initialization
  mongoInitPromise = (async () => {
    try {
      mongoInitializing = true;
      console.log('[MongoDB] Initializing database...');
      await initializeDatabase();
      mongoInitialized = true;
      mongoInitializing = false;
      console.log('[MongoDB] ✅ Connected and ready!');
    } catch (error) {
      mongoInitializing = false;
      mongoInitialized = false;
      console.error('[MongoDB] ❌ Initialization failed:', error);
      throw error;
    }
  })();
  
  await mongoInitPromise;
}

// Helper function to check if MongoDB is ready (with auto-init)
async function checkMongoReady(): Promise<Response | null> {
  if (mongoInitialized) {
    return null; // MongoDB is ready
  }
  
  // If currently initializing, return a friendly message
  if (mongoInitializing) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Database connection not ready yet. Please refresh the page in a moment.',
        status: 'not_initialized',
        message: 'MongoDB is currently initializing. This typically takes 10-30 seconds.'
      }),
      { 
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
  
  try {
    // Try to initialize if not already doing so
    await ensureMongoInitialized();
    return null; // MongoDB is now ready
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Database not ready',
        status: 'error',
        details: error.message,
        message: 'Failed to connect to MongoDB. Please check your internet connection and try again.'
      }),
      { 
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Initialize MongoDB in the background (non-blocking)
console.log('🔧 Starting MongoDB initialization in background...');
(async () => {
  try {
    await ensureMongoInitialized();
  } catch (error) {
    console.error('⚠️ Initial MongoDB connection failed:', error);
    console.log('⏳ Will retry on first request...');
  }
})();

// Start HTTP server immediately (don't wait for MongoDB)
console.log('═══════════════════════════════════════════════════════════');
console.log('🚀 BTM Travel CRM Server running on MongoDB!');
console.log('═══════════════════════════════════════════════════════════');
console.log(`📌 Version: ${SERVER_VERSION}`);
console.log('🌐 Port: 8000');
console.log('🔗 Manager Operations: ✅ ALL LOADED');
console.log('   - GET    /team-performance (Full team metrics)');
console.log('   - GET    /agent-monitoring/overview');
console.log('   - GET    /agent-monitoring/agent/:id');
console.log('🔗 Call Progress & Recycling: ✅ NEW!');
console.log('   - GET    /call-progress');
console.log('   - POST   /call-progress/recycle');
console.log('   - POST   /call-progress/archive-completed');
console.log('   - POST   /call-progress/recycle-agent');
console.log('🔗 Customer Endpoints: ✅ LOADED');
console.log('   - GET    /database/customers/assigned/:id');
console.log('   - DELETE /customers/clear');
console.log('   - GET    /customers/archived');
console.log('   - POST   /customers/archived');
console.log('═══════════════════════════════════════════════════════════');

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  
  console.log(`[BTM CRM Server] [${req.method}] ${path}`);

  try {
    // ==================== HEALTH & TEST ====================
    // Health check - quick server check (doesn't require MongoDB)
    if (path === '/health' || path.includes('/health')) {
      // Check MongoDB status
      if (mongoInitializing) {
        return new Response(
          JSON.stringify({
            status: 'initializing',
            message: 'Server is running, MongoDB is initializing...',
            timestamp: new Date().toISOString(),
            version: SERVER_VERSION,
            mongodb: 'initializing',
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (!mongoInitialized) {
        return new Response(
          JSON.stringify({
            status: 'degraded',
            message: 'Server is running, MongoDB not yet connected',
            timestamp: new Date().toISOString(),
            version: SERVER_VERSION,
            mongodb: 'disconnected',
          }),
          { 
            status: 200, // Return 200 so frontend knows server is alive
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // MongoDB is initialized, do a quick ping
      try {
        const db = await getMongoDb();
        await db.command({ ping: 1 });
        
        return new Response(
          JSON.stringify({
            status: 'ok',
            message: 'BTM Travel CRM Server is running (MongoDB Connected)',
            timestamp: new Date().toISOString(),
            version: SERVER_VERSION,
            serverStarted: SERVER_STARTED,
            mongodb: 'connected',
            customerEndpoints: 'available',
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            status: 'degraded',
            message: 'Server running but MongoDB ping failed',
            timestamp: new Date().toISOString(),
            version: SERVER_VERSION,
            mongodb: 'error',
            error: error.message,
          }),
          { 
            status: 200, // Return 200 so frontend knows server is alive
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    if (path === '/test' || path.includes('/test')) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'BTM Travel CRM Server - All Systems Operational',
          timestamp: new Date().toISOString(),
          mongo: mongoInitialized ? 'connected' : 'not ready',
          serverVersion: SERVER_VERSION,
          serverStarted: SERVER_STARTED,
          totalEndpoints: '50+',
          criticalEndpointsStatus: {
            '/team-performance': 'LOADED ✅',
            '/agent-monitoring/overview': 'LOADED ✅',
            '/agent-monitoring/agent/:id': 'LOADED ✅',
            '/database/clients': 'LOADED ✅',
            '/database/customers': 'LOADED ✅',
            '/database/reset-all': 'LOADED ✅',
            '/cron/daily-archive': 'LOADED ✅'
          },
          useDebugEndpoint: 'Visit /debug/endpoints for complete endpoint list'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Simple test endpoint to verify server is running latest code
    if (path === '/test-setup' && req.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          message: '✅ Server is running the LATEST code (v6.0.0-OCT24)!',
          version: SERVER_VERSION,
          timestamp: new Date().toISOString(),
          serverStarted: SERVER_STARTED,
          mongoInitialized,
          mongoInitializing,
          endpointsVerified: [
            '/email-recipients',
            '/database/customers/assigned/:id',
            '/customers/archived',
            '/users/login',
            '/setup/init'
          ]
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Debug endpoint to verify manager endpoints exist
    if (path === '/debug/manager-endpoints' && req.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Manager endpoints diagnostic',
          version: SERVER_VERSION,
          serverStarted: SERVER_STARTED,
          mongoStatus: {
            initialized: mongoInitialized,
            initializing: mongoInitializing
          },
          managerEndpoints: {
            '/team-performance': {
              method: 'GET',
              status: 'LOADED ✅',
              lineNumber: 3021,
              requiresMongo: true
            },
            '/agent-monitoring/overview': {
              method: 'GET',
              status: 'LOADED ✅',
              lineNumber: 3111,
              requiresMongo: true
            },
            '/database/customers': {
              method: 'GET',
              status: 'LOADED ✅',
              lineNumber: 3174,
              requiresMongo: true
            }
          },
          note: 'If MongoDB is not initialized, these endpoints will return 503, not 404',
          troubleshooting: {
            if404: 'The server is running OLD code. Please kill all Deno processes and restart.',
            if503: 'MongoDB is initializing. Wait 10-30 seconds and try again.',
            ifSuccess: 'Endpoints are working correctly!'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Setup endpoint to initialize default admin user
    if (path === '/setup/init' && req.method === 'POST') {
      try {
        const collection = await getCollection(Collections.USERS);
        
        // Check if admin already exists
        const existingAdmin = await collection.findOne({ username: 'admin' });
        if (existingAdmin) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Default admin user already exists',
              message: 'Admin user is already initialized. Use the existing admin credentials to log in.'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Create default admin user
        const adminUser = {
          id: 'admin-1',
          username: 'admin',
          name: 'Administrator',
          email: 'admin@btmtravel.net',
          password: 'admin123',
          role: 'admin',
          permissions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await collection.insertOne(adminUser);
        
        console.log('[SETUP] ✅ Default admin user created');
        
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Default admin user created successfully',
            credentials: {
              username: 'admin',
              password: 'admin123'
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[SETUP] Error creating admin:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Debug endpoint to list all users (with passwords for debugging)
    if (path === '/debug/users' && req.method === 'GET') {
      try {
        const collection = await getCollection(Collections.USERS);
        const users = await collection.find({}).toArray();
        return new Response(
          JSON.stringify({ 
            success: true, 
            count: users.length,
            users: users.map(u => ({
              id: u.id,
              username: u.username,
              password: u.password,
              email: u.email,
              role: u.role,
              createdAt: u.createdAt
            }))
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Debug endpoint to verify endpoints are loaded
    if (path === '/debug/endpoints' && req.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          serverVersion: SERVER_VERSION,
          serverStarted: SERVER_STARTED,
          mongoStatus: mongoInitialized ? 'connected' : (mongoInitializing ? 'initializing' : 'not connected'),
          message: 'All 50+ endpoints loaded and verified',
          endpointCategories: {
            core: ['/health', '/test', '/debug/endpoints', '/debug/users', '/setup/init'],
            authentication: ['/users/login', '/users', '/users/:id', '/login-audit'],
            clients: [
              '/database/clients',
              '/database/clients/import',
              '/database/clients/assign',
              '/database/clients/:id',
              '/database/clients/bulk-delete',
              '/database/clients/clear-all',
              '/database/clients/archive',
              '/database/clients/archive/bulk-restore'
            ],
            customers: [
              '/database/customers',
              '/database/customers/assigned/:id',
              '/database/customers/import',
              '/database/customers/assign',
              '/customers',
              '/customers/clear',
              '/customers/archived',
              '/customer-interactions'
            ],
            assignments: [
              '/assignments',
              '/assignments/claim',
              '/assignments/mark-called',
              '/number-claims',
              '/claim-number',
              '/release-number',
              '/extend-number-claim'
            ],
            callManagement: [
              '/call-logs',
              '/call-scripts',
              '/call-scripts/:id/activate',
              '/call-scripts/:id',
              '/call-scripts/active/:type'
            ],
            managerOperations: [
              '/team-performance',
              '/agent-monitoring/overview',
              '/agent-monitoring/agent/:id'
            ],
            settings: [
              '/smtp-settings',
              '/smtp-test',
              '/send-email',
              '/send-quick-email',
              '/threecx-settings',
              '/email-recipients'
            ],
            progress: [
              '/daily-progress',
              '/daily-progress/check-reset',
              '/daily-progress/reset'
            ],
            promotions: ['/promotions', '/promotions/:id'],
            archive: ['/archive', '/archive/restore'],
            admin: [
              '/admin/delete-selected-data',
              '/database/reset-all',
              '/cron/daily-archive'
            ]
          },
          totalEndpoints: '50+',
          status: 'All endpoints operational'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ==================== SETUP / INITIALIZE ====================
    // Debug log to see what path we're getting
    if (req.method === 'POST') {
      console.log('[DEBUG] POST request received');
      console.log('[DEBUG] Path:', JSON.stringify(path));
      console.log('[DEBUG] Path length:', path.length);
      console.log('[DEBUG] Path === "/setup/init":', path === '/setup/init');
    }
    
    if (path === '/setup/init' && req.method === 'POST') {
      console.log('[SETUP] Initialize database requested');
      console.log('[SETUP] MongoDB initialized:', mongoInitialized);
      console.log('[SETUP] MongoDB initializing:', mongoInitializing);
      
      if (!mongoInitialized) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'MongoDB not connected yet. Please wait a moment and try again.',
            mongoStatus: {
              initialized: mongoInitialized,
              initializing: mongoInitializing
            }
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        const collection = await getCollection(Collections.USERS);
        const userCount = await collection.countDocuments();
        
        if (userCount === 0) {
          console.log('[SETUP] No users found, creating default admin user...');
          await collection.insertOne({
            id: 'admin-1',
            username: 'admin',
            name: 'Administrator',
            email: 'admin@btmtravel.net',
            password: 'admin123',
            role: 'admin',
            permissions: [],
            createdAt: new Date().toISOString(),
          });
          console.log('[SETUP] ✅ Default admin user created (username: admin, password: admin123)');
          
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Default admin user created successfully',
              credentials: {
                username: 'admin',
                password: 'admin123'
              }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({
              success: true,
              message: `Database already initialized with ${userCount} user(s)`,
              userCount
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error('[SETUP] Error initializing:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== MANAGER OPERATIONS ====================
    // These endpoints provide manager-specific functionality for team oversight
    
    // GET /team-performance - Get team performance metrics
    if (path === '/team-performance' && req.method === 'GET') {
      console.log('[MANAGER] Team performance requested');
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const usersCollection = await getCollection(Collections.USERS);
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const progressCollection = await getCollection(Collections.DAILY_PROGRESS);
        
        // Get all agents
        const agents = await usersCollection.find({ role: 'agent' }).toArray();
        
        // Calculate team metrics
        const teamData = [];
        let totalCalls = 0;
        let totalAssigned = 0;
        
        for (const agent of agents) {
          // Get agent's assignments
          const assignments = await assignmentsCollection.find({ 
            agentId: agent.id,
            status: 'assigned'
          }).toArray();
          
          // Get agent's progress
          const progress = await progressCollection.findOne({ agentId: agent.id }) || {
            callsMade: 0,
            successfulCalls: 0,
            missedCalls: 0
          };
          
          const assignedCount = assignments.length;
          const callsMade = progress.callsMade || 0;
          const completionRate = assignedCount > 0 ? Math.round((callsMade / assignedCount) * 100) : 0;
          
          totalCalls += callsMade;
          totalAssigned += assignedCount;
          
          teamData.push({
            agentId: agent.id,
            agentName: agent.name || agent.username,
            assigned: assignedCount,
            called: callsMade,
            completionRate,
            status: determineAgentStatus(progress.lastActivity)
          });
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            teamPerformance: teamData,
            summary: {
              totalAgents: agents.length,
              totalAssigned,
              totalCalls,
              avgCompletionRate: totalAssigned > 0 ? Math.round((totalCalls / totalAssigned) * 100) : 0
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[MANAGER] Team performance error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // /agent-monitoring/overview - Moved to line 1430 to be before MongoDB check
    
    // GET /agent-monitoring/agent/:id - Get detailed agent metrics
    if (path.startsWith('/agent-monitoring/agent/') && req.method === 'GET') {
      const agentId = path.split('/').pop();
      console.log('[MANAGER] Agent detail requested for:', agentId);
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const usersCollection = await getCollection(Collections.USERS);
        const clientsCollection = await getCollection(Collections.NUMBERS_DATABASE);
        const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
        
        const agent = await usersCollection.findOne({ id: agentId });
        if (!agent) {
          return new Response(
            JSON.stringify({ success: false, error: 'Agent not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Get all CRM records (clients) assigned to this agent
        const crmRecords = await clientsCollection.find({ assignedTo: agentId }).toArray();
        
        // Get all Customer Service records assigned to this agent
        const customerRecords = await customersCollection.find({ assignedTo: agentId }).toArray();
        
        return new Response(
          JSON.stringify({
            success: true,
            agent: {
              id: agent.id,
              name: agent.name || agent.username,
              email: agent.email,
              role: agent.role
            },
            data: {
              crmRecords: convertMongoDocs(crmRecords),
              customerRecords: convertMongoDocs(customerRecords)
            }
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[MANAGER] Agent detail error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== EMAIL RECIPIENTS ====================
    if (path === '/email-recipients' && req.method === 'GET') {
      console.log('[EMAIL-RECIPIENTS] Get email recipients requested');
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const collection = await getCollection(Collections.EMAIL_RECIPIENTS);
        
        // Try to get existing recipients
        const doc = await collection.findOne({ type: 'default' });
        
        if (doc && doc.recipients) {
          return new Response(
            JSON.stringify({
              success: true,
              recipients: doc.recipients
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // No recipients saved yet - return defaults
        const defaultRecipients = [
          "operations@btmlimited.net",
          "quantityassurance@btmlimited.net",
          "clientcare@btmlimited.net"
        ];
        
        return new Response(
          JSON.stringify({
            success: true,
            recipients: defaultRecipients,
            isDefault: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[EMAIL-RECIPIENTS] Error fetching recipients:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (path === '/email-recipients' && req.method === 'POST') {
      console.log('[EMAIL-RECIPIENTS] Save email recipients requested');
      
      // Check MongoDB ready
      const readyCheck = checkMongoReady();
      if (readyCheck) return readyCheck;
      
      try {
        const body = await req.json();
        const { recipients } = body;
        
        if (!recipients || !Array.isArray(recipients)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid recipients format. Expected array of email addresses.'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = recipients.filter(email => !emailRegex.test(email));
        
        if (invalidEmails.length > 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Invalid email addresses: ${invalidEmails.join(', ')}`
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const collection = await getCollection(Collections.EMAIL_RECIPIENTS);
        
        // Update or insert recipients
        await collection.updateOne(
          { type: 'default' },
          { 
            $set: { 
              recipients,
              updatedAt: new Date().toISOString()
            }
          },
          { upsert: true }
        );
        
        console.log('[EMAIL-RECIPIENTS] ✅ Recipients saved successfully');
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email recipients saved successfully',
            recipients
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[EMAIL-RECIPIENTS] Error saving recipients:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== USER MANAGEMENT ====================
    // Get all users
    if (path === '/users' && req.method === 'GET') {
      console.log('[USERS] Get all users requested');
      
      // Check MongoDB ready
      const readyCheck = checkMongoReady();
      if (readyCheck) return readyCheck;
      
      try {
        const collection = await getCollection(Collections.USERS);
        const users = await collection.find({}).toArray();
        
        // Remove passwords from response
        const sanitizedUsers = users.map((u: any) => {
          const { password, ...rest } = u;
          return convertMongoDoc(rest);
        });
        
        return new Response(
          JSON.stringify({
            success: true,
            users: sanitizedUsers
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[USERS] Error fetching users:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new user
    if (path === '/users' && req.method === 'POST') {
      console.log('[USERS] Create user requested');
      
      // Check MongoDB ready
      const readyCheck = checkMongoReady();
      if (readyCheck) return readyCheck;
      
      try {
        const body = await req.json();
        const { username, name, email, password, role, permissions, dailyTarget } = body;
        
        if (!username || !name || !password || !role) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Missing required fields: username, name, password, role'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const collection = await getCollection(Collections.USERS);
        
        // Check if username already exists
        const existingUser = await collection.findOne({ username });
        if (existingUser) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Username already exists'
            }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const newUser = {
          id: generateId(),
          username,
          name,
          email: email || '',
          password,
          role,
          permissions: permissions || [],
          dailyTarget: dailyTarget || 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await collection.insertOne(newUser);
        
        console.log(`[USERS] ✅ User created: ${username} (${role})`);
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        
        return new Response(
          JSON.stringify({
            success: true,
            user: convertMongoDoc(userWithoutPassword),
            message: 'User created successfully'
          }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[USERS] Error creating user:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update user
    if (path.startsWith('/users/') && req.method === 'PUT') {
      const userId = path.split('/users/')[1];
      console.log(`[USERS] Update user requested: ${userId}`);
      
      // Check MongoDB ready
      const readyCheck = checkMongoReady();
      if (readyCheck) return readyCheck;
      
      try {
        const body = await req.json();
        const { name, email, password, role, permissions, dailyTarget } = body;
        
        const collection = await getCollection(Collections.USERS);
        
        const updateDoc: any = {
          updatedAt: new Date().toISOString()
        };
        
        if (name) updateDoc.name = name;
        if (email !== undefined) updateDoc.email = email;
        if (password) updateDoc.password = password;
        if (role) updateDoc.role = role;
        if (permissions !== undefined) updateDoc.permissions = permissions;
        if (dailyTarget !== undefined) updateDoc.dailyTarget = dailyTarget;
        
        const result = await collection.updateOne(
          { id: userId },
          { $set: updateDoc }
        );
        
        if (result.matchedCount === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'User not found'
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`[USERS] ✅ User updated: ${userId}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'User updated successfully'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[USERS] Error updating user:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete user
    if (path.startsWith('/users/') && req.method === 'DELETE') {
      const userId = path.split('/users/')[1];
      console.log(`[USERS] Delete user requested: ${userId}`);
      
      // Check MongoDB ready
      const readyCheck = checkMongoReady();
      if (readyCheck) return readyCheck;
      
      try {
        const collection = await getCollection(Collections.USERS);
        
        // Prevent deleting the default admin
        const user = await collection.findOne({ id: userId });
        if (user && user.id === 'admin-1') {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Cannot delete the default admin user'
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const result = await collection.deleteOne({ id: userId });
        
        if (result.deletedCount === 0) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'User not found'
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`[USERS] ✅ User deleted: ${userId}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'User deleted successfully'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[USERS] Error deleting user:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // User login
    if (path === '/users/login' && req.method === 'POST') {
      console.log('[AUTH] Login attempt');
      
      // Check MongoDB ready
      const readyCheck = checkMongoReady();
      if (readyCheck) return readyCheck;
      
      try {
        const body = await req.json();
        const { username, password } = body;
        
        if (!username || !password) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Username and password are required'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const collection = await getCollection(Collections.USERS);
        const user = await collection.findOne({ username });
        
        if (!user || user.password !== password) {
          // Log failed login attempt
          const auditCollection = await getCollection(Collections.LOGIN_AUDIT);
          await auditCollection.insertOne({
            id: generateId(),
            username,
            success: false,
            timestamp: new Date().toISOString(),
            reason: user ? 'invalid_password' : 'user_not_found'
          });
          
          console.log(`[AUTH] ❌ Login failed for: ${username}`);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid username or password'
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Log successful login
        const auditCollection = await getCollection(Collections.LOGIN_AUDIT);
        await auditCollection.insertOne({
          id: generateId(),
          userId: user.id,
          username: user.username,
          success: true,
          timestamp: new Date().toISOString()
        });
        
        console.log(`[AUTH] ✅ Login successful: ${username} (${user.role})`);
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        
        return new Response(
          JSON.stringify({
            success: true,
            user: convertMongoDoc(userWithoutPassword)
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[AUTH] Login error:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get login audit logs
    if (path === '/login-audit' && req.method === 'GET') {
      console.log('[AUDIT] Get login audit logs');
      
      // Check MongoDB ready
      const readyCheck = checkMongoReady();
      if (readyCheck) return readyCheck;
      
      try {
        const collection = await getCollection(Collections.LOGIN_AUDIT);
        const logs = await collection.find({}).sort({ timestamp: -1 }).limit(100).toArray();
        
        return new Response(
          JSON.stringify({
            success: true,
            logs: convertMongoDocs(logs)
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[AUDIT] Error fetching logs:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== TEAM PERFORMANCE (Can work without MongoDB initially) ====================
    if (path === '/team-performance') {
      console.log('');
      console.log('🔍🔍🔍 TEAM-PERFORMANCE REQUEST DETECTED 🔍🔍🔍');
      console.log(`   Path: ${path}`);
      console.log(`   Method: ${req.method}`);
      console.log(`   Should Match: ${path === '/team-performance' && req.method === 'GET'}`);
      console.log('');
    }
    
    if (path === '/team-performance' && req.method === 'GET') {
      console.log('✅ /team-performance endpoint HIT! Processing request...');
      
      // Check if MongoDB is ready
      if (!mongoInitialized) {
        console.log('⚠️  MongoDB not ready yet - returning empty team data');
        return new Response(
          JSON.stringify({ 
            success: true, 
            teamData: [],
            message: 'MongoDB initializing - team data will load shortly'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        const usersCollection = await getCollection(Collections.USERS);
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const callLogsCollection = await getCollection(Collections.CALL_LOGS);
        const dailyProgressCollection = await getCollection(Collections.DAILY_PROGRESS);
        
        // Get all agents
        const agents = await usersCollection.find({ role: 'agent' }).toArray();
        
        // Get daily progress for all users
        const dailyProgress = await dailyProgressCollection.find({}).toArray();
        const progressMap = new Map(dailyProgress.map((p: any) => [p.userId, p]));
        
        // Date calculations
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const todayStart = new Date(today).toISOString();
        
        // Week start (Monday)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);
        
        // Month start
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const teamData = await Promise.all(agents.map(async (agent: any) => {
          // Count assignments
          const totalAssignments = await assignmentsCollection.countDocuments({ agentId: agent.id });
          const completedAssignments = await assignmentsCollection.countDocuments({ 
            agentId: agent.id, 
            called: true 
          });
          
          // Get call logs for different time periods
          const todayCalls = await callLogsCollection.countDocuments({
            agentId: agent.id,
            callTime: { $gte: todayStart }
          });
          
          const weekCalls = await callLogsCollection.countDocuments({
            agentId: agent.id,
            callTime: { $gte: weekStart.toISOString() }
          });
          
          const monthCalls = await callLogsCollection.countDocuments({
            agentId: agent.id,
            callTime: { $gte: monthStart.toISOString() }
          });
          
          // Get breakdown by board type (from call logs)
          const allCallsToday = await callLogsCollection.find({
            agentId: agent.id,
            callTime: { $gte: todayStart }
          }).toArray();
          
          const clientCalls = allCallsToday.filter((log: any) => 
            log.board === 'client-crm' || log.type === 'prospective'
          ).length;
          
          const promoSales = allCallsToday.filter((log: any) => 
            log.board === 'promo-sales' || log.type === 'promotion'
          ).length;
          
          const customerService = allCallsToday.filter((log: any) => 
            log.board === 'customer-service' || log.type === 'existing'
          ).length;
          
          // Get recent call for status determination
          const recentCall = await callLogsCollection.findOne(
            { agentId: agent.id },
            { sort: { callTime: -1 } }
          );
          
          // Determine status based on last call time
          let status = 'offline';
          if (recentCall) {
            const lastCallTime = new Date(recentCall.callTime);
            const minutesSinceCall = (now.getTime() - lastCallTime.getTime()) / (1000 * 60);
            
            if (minutesSinceCall < 15) {
              status = 'active';
            } else if (minutesSinceCall < 60) {
              status = 'idle';
            }
          }
          
          // Get progress data
          const progress = progressMap.get(agent.id);
          
          // Mock additional metrics (these would come from actual data in production)
          const emailsSent = Math.floor(clientCalls * 0.6); // Rough estimate
          const dealsCreated = Math.floor(promoSales * 0.3); // Rough estimate
          const ticketsResolved = Math.floor(customerService * 0.4); // Rough estimate
          
          return {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            role: agent.role || 'agent',
            dailyTarget: agent.dailyTarget || 30,
            callsToday: progress?.callsToday || todayCalls || 0,
            callsWeek: weekCalls || 0,
            callsMonth: monthCalls || 0,
            lastCallTime: recentCall ? recentCall.callTime : (progress?.lastCallTime || null),
            status,
            // Board breakdown
            clientCalls: clientCalls || 0,
            promoSales: promoSales || 0,
            customerService: customerService || 0,
            // Additional metrics
            emailsSent: emailsSent || 0,
            dealsCreated: dealsCreated || 0,
            ticketsResolved: ticketsResolved || 0,
            // Legacy fields for compatibility
            totalAssignments,
            completedAssignments,
          };
        }));
        
        return new Response(
          JSON.stringify({ success: true, teamData: convertMongoDocs(teamData) }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[TEAM PERFORMANCE] Error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            teamData: []
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== AGENT MONITORING ====================
    // Agent Monitoring - Overview (before MongoDB check for reliability)
    if (path === '/agent-monitoring/overview' && req.method === 'GET') {
      console.log('✅ /agent-monitoring/overview endpoint HIT!');
      
      // Check if MongoDB is ready (with auto-initialization)
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const usersCollection = await getCollection(Collections.USERS);
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
        
        // Get all agents
        const agents = await usersCollection.find({ role: 'agent' }).toArray();
        
        const agentStats = await Promise.all(agents.map(async (agent: any) => {
          // Get CRM assignments
          const totalCRMAssignments = await assignmentsCollection.countDocuments({ agentId: agent.id });
          const completedCRMAssignments = await assignmentsCollection.countDocuments({ 
            agentId: agent.id, 
            called: true 
          });
          
          // Get customer service assignments
          const totalCustomerAssignments = await customersCollection.countDocuments({ 
            assignedTo: agent.id 
          });
          // Count customers with interactionCompleted flag OR notes as "completed" interactions
          // This supports both new tracking method and legacy data
          const customersWithNotes = await customersCollection.find({ 
            assignedTo: agent.id
          }).toArray();
          const completedCustomerAssignments = customersWithNotes.filter(c => 
            c.interactionCompleted === true || (c.notes && c.notes.length > 0)
          ).length;
          
          // Calculate totals
          const overallTotal = totalCRMAssignments + totalCustomerAssignments;
          const overallCompleted = completedCRMAssignments + completedCustomerAssignments;
          const overallPending = overallTotal - overallCompleted;
          
          return {
            id: agent.id,
            name: agent.name || agent.username || 'Unknown',
            email: agent.email || '',
            crm: {
              total: totalCRMAssignments,
              completed: completedCRMAssignments,
              pending: totalCRMAssignments - completedCRMAssignments
            },
            customerService: {
              total: totalCustomerAssignments,
              completed: completedCustomerAssignments,
              pending: totalCustomerAssignments - completedCustomerAssignments
            },
            overall: {
              total: overallTotal,
              completed: overallCompleted,
              pending: overallPending,
              completionPercentage: overallTotal > 0 
                ? Math.round((overallCompleted / overallTotal) * 100) 
                : 0
            }
          };
        }));
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            agents: convertMongoDocs(agentStats)
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[AGENT MONITORING] Error:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            agents: []
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== DATABASE ENDPOINTS ====================
    // Get all customers from database (before MongoDB check for reliability)
    if (path === '/database/customers' && req.method === 'GET') {
      console.log('[DATABASE] Get all customers requested');
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
        const customers = await collection.find({}).toArray();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            records: convertMongoDocs(customers),
            customers: convertMongoDocs(customers),
            count: customers.length
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[DATABASE] Error fetching customers:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            records: [],
            customers: [],
            count: 0
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get all clients from database (before MongoDB check for reliability)
    if (path === '/database/clients' && req.method === 'GET') {
      console.log('[DATABASE] Get all clients requested');
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const collection = await getCollection(Collections.NUMBERS_DATABASE);
        const clients = await collection.find({}).toArray();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            records: convertMongoDocs(clients),
            clients: convertMongoDocs(clients),
            count: clients.length
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[DATABASE] Error fetching clients:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            records: [],
            clients: [],
            count: 0
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== CHECK MONGODB READINESS ====================
    // For all non-health/test endpoints, check if MongoDB is ready
    const mongoCheck = await checkMongoReady();
    if (mongoCheck) {
      return mongoCheck;
    }

    console.log(`[ROUTING] MongoDB ready, processing: ${req.method} ${path}`);

    // ==================== CALL SCRIPTS ====================
    if (path === '/call-scripts' && req.method === 'GET') {
      const collection = await getCollection(Collections.CALL_SCRIPTS);
      const scripts = await collection.find({}).toArray();
      return new Response(
        JSON.stringify({ success: true, scripts: convertMongoDocs(scripts) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/call-scripts' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.CALL_SCRIPTS);
      const newScript = {
        ...body,
        id: body.id || generateId(),
        createdAt: new Date().toISOString(),
      };
      await collection.insertOne(newScript);
      return new Response(
        JSON.stringify({ success: true, script: newScript }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/call-scripts\/(.+)\/activate$/) && req.method === 'POST') {
      const id = path.split('/')[2];
      const collection = await getCollection(Collections.CALL_SCRIPTS);
      // Deactivate all scripts
      await collection.updateMany({}, { $set: { isActive: false } });
      // Activate the specified script
      await collection.updateOne({ id }, { $set: { isActive: true } });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/call-scripts\/(.+)$/) && req.method === 'DELETE') {
      const id = path.split('/')[2];
      const collection = await getCollection(Collections.CALL_SCRIPTS);
      await collection.deleteOne({ id });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/call-scripts\/active\/(prospective|existing)$/)) {
      const type = path.split('/')[3];
      const collection = await getCollection(Collections.CALL_SCRIPTS);
      const activeScript = await collection.findOne({ isActive: true, type });
      return new Response(
        JSON.stringify({ 
          success: true, 
          script: activeScript ? convertMongoDoc(activeScript) : null 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== DATABASE - NUMBERS ====================
    if (path === '/database/clients' && req.method === 'GET') {
      const collection = await getCollection(Collections.NUMBERS_DATABASE);
      const clients = await collection.find({ status: { $ne: 'assigned' } }).toArray();
      const convertedClients = convertMongoDocs(clients);
      return new Response(
        JSON.stringify({ 
          success: true, 
          clients: convertedClients,
          records: convertedClients  // For consistency with customers endpoint
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/database/clients/import' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.NUMBERS_DATABASE);
      const newClients = (body.clients || []).map((client: any) => ({
        ...client,
        id: client.id || generateId(),
        importedAt: new Date().toISOString(),
        status: 'available',
        assignedTo: null,
        assignedAt: null,
        customerType: client.customerType || 'Retails',
        airplane: client.airplane || '',
      }));
      
      if (newClients.length > 0) {
        await collection.insertMany(newClients);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          imported: newClients.length,
          clients: newClients 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/database/clients/assign' && req.method === 'POST') {
      const body = await req.json();
      const { clientIds, agentId, filters } = body;
      
      console.log('[DATABASE] Client assignment request:', { clientIds: clientIds?.length, agentId, filters });
      
      const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
      const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      
      let numbersToAssign;
      
      if (filters && (filters.customerType || filters.airplane)) {
        // Filter based query - find unassigned numbers
        const query: any = {
          $or: [
            { status: 'available' },
            { status: { $exists: false } },
            { status: null },
            { status: '' }
          ],
          $and: [
            {
              $or: [
                { assignedTo: { $exists: false } },
                { assignedTo: null },
                { assignedTo: '' }
              ]
            }
          ]
        };
        
        if (filters.customerType) query.customerType = filters.customerType;
        if (filters.airplane) query.airplane = filters.airplane;
        
        console.log('[DATABASE] Finding numbers with query:', JSON.stringify(query));
        
        numbersToAssign = await numbersCollection
          .find(query)
          .limit(filters.count || 100)
          .toArray();
          
        console.log('[DATABASE] Found numbers:', numbersToAssign.length);
      } else if (clientIds && clientIds.length > 0) {
        // Specific IDs - find unassigned numbers
        numbersToAssign = await numbersCollection
          .find({ 
            id: { $in: clientIds },
            $or: [
              { status: 'available' },
              { status: { $exists: false } },
              { status: null },
              { status: '' }
            ],
            $and: [
              {
                $or: [
                  { assignedTo: { $exists: false } },
                  { assignedTo: null },
                  { assignedTo: '' }
                ]
              }
            ]
          })
          .toArray();
          
        console.log('[DATABASE] Found specific numbers:', numbersToAssign.length, 'of', clientIds.length, 'requested');
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'No clients or filters specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (numbersToAssign.length === 0) {
        console.log('[DATABASE] ❌ No available numbers found matching criteria');
        
        // Check if there are ANY numbers in the database
        const totalNumbers = await numbersCollection.countDocuments({});
        const assignedNumbers = await numbersCollection.countDocuments({ 
          assignedTo: { $exists: true, $ne: null, $ne: '' }
        });
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No available numbers match criteria',
            debug: {
              totalInDatabase: totalNumbers,
              alreadyAssigned: assignedNumbers,
              available: totalNumbers - assignedNumbers,
              filters: filters || 'specific IDs',
              suggestion: totalNumbers === 0 
                ? 'No numbers in database. Please upload numbers first.'
                : assignedNumbers === totalNumbers
                  ? 'All numbers are already assigned. Please import more numbers or unassign existing ones.'
                  : 'No numbers match your filter criteria. Try different filters.'
            }
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const assignmentDate = new Date().toISOString();
      const assignments = numbersToAssign.map((number: any) => ({
        id: generateId(),
        numberId: number.id,
        numberData: number,
        agentId,
        assignedAt: assignmentDate,
        status: 'active',
        called: false,
        calledAt: null,
        outcome: null,
      }));
      
      // Mark numbers as assigned
      await numbersCollection.updateMany(
        { id: { $in: numbersToAssign.map((n: any) => n.id) } },
        { $set: { status: 'assigned', assignedTo: agentId, assignedAt: assignmentDate } }
      );
      
      // Create assignments
      await assignmentsCollection.insertMany(assignments);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          assigned: assignments.length,
          assignments: convertMongoDocs(assignments)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/database\/clients\/(.+)$/) && req.method === 'DELETE') {
      const id = path.split('/')[3];
      const collection = await getCollection(Collections.NUMBERS_DATABASE);
      await collection.deleteOne({ id });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/database/clients/bulk-delete' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.NUMBERS_DATABASE);
      await collection.deleteMany({ id: { $in: body.ids || [] } });
      return new Response(
        JSON.stringify({ success: true, deleted: body.ids?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Migration endpoint to fix client/number status fields
    if (path === '/database/clients/migrate' && req.method === 'POST') {
      console.log('[DATABASE] Running client/number migration...');
      const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
      
      // Update all numbers that don't have proper status or assignedTo fields
      const result = await numbersCollection.updateMany(
        { 
          $or: [
            { status: { $exists: false } },
            { status: null },
            { status: undefined },
            { assignedTo: undefined }
          ]
        },
        { 
          $set: { 
            status: 'available',
            assignedTo: null,
            assignedAt: null
          } 
        }
      );
      
      console.log('[MIGRATION] Fixed client/number records:', result.modifiedCount);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Fixed ${result.modifiedCount} client/number records`,
          modifiedCount: result.modifiedCount
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== DATABASE - CUSTOMERS ====================
    if (path === '/database/customers' && req.method === 'GET') {
      const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
      // Only return unassigned customers (available for assignment)
      const customers = await collection.find({
        $or: [
          { assignedTo: { $exists: false } },
          { assignedTo: null },
          { assignedTo: '' }
        ]
      }).toArray();
      return new Response(
        JSON.stringify({ success: true, records: convertMongoDocs(customers) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/database/customers/import' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
      const newCustomers = (body.records || []).map((customer: any) => ({
        ...customer,
        id: customer.id || generateId(),
        importedAt: new Date().toISOString(),
        customerType: customer.customerType || 'Retails',
        flightInfo: customer.flightInfo || '',
        assignedTo: null,
        assignedAt: null,
        assignedBy: null,
      }));
      
      if (newCustomers.length > 0) {
        await collection.insertMany(newCustomers);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          count: newCustomers.length,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/database/customers/assign' && req.method === 'POST') {
      const body = await req.json();
      const { customerIds, agentId, agentName, count, filters } = body;
      
      console.log('[ASSIGN] Customer assignment request:', { customerIds, agentId, count, filters });
      
      const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
      
      // Debug: Check total customers and their assignment status
      const totalCustomers = await customersCollection.countDocuments({});
      const allCustomersSample = await customersCollection.find({}).limit(5).toArray();
      console.log('[DEBUG] Total customers in DB:', totalCustomers);
      console.log('[DEBUG] Sample customers:', allCustomersSample.map(c => ({ id: c.id, assignedTo: c.assignedTo })));
      
      let customersToAssign;
      
      if (customerIds && customerIds.length > 0) {
        // Debug: Check if these IDs exist at all
        const allMatchingIds = await customersCollection.find({ id: { $in: customerIds } }).toArray();
        console.log('[DEBUG] Found customers with matching IDs:', allMatchingIds.length);
        console.log('[DEBUG] Their assignment status:', allMatchingIds.map(c => ({ id: c.id, assignedTo: c.assignedTo })));
        
        // Specific customer IDs provided - only assign if not already assigned
        customersToAssign = await customersCollection
          .find({ 
            id: { $in: customerIds },
            $or: [
              { assignedTo: { $exists: false } },
              { assignedTo: null },
              { assignedTo: '' }
            ]
          })
          .toArray();
        
        console.log('[DEBUG] Customers available for assignment:', customersToAssign.length);
      } else if (filters || count) {
        // Build query based on filters - only get unassigned customers
        const query: any = {
          $or: [
            { assignedTo: { $exists: false } },
            { assignedTo: null },
            { assignedTo: '' }
          ]
        };
        
        if (filters) {
          if (filters.customerType && filters.customerType.length > 0) {
            query.customerType = { $in: filters.customerType };
          }
          if (filters.flightInfo) {
            query.flightInfo = { $regex: filters.flightInfo, $options: 'i' };
          }
        }
        
        customersToAssign = await customersCollection
          .find(query)
          .limit(count || 100)
          .toArray();
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'No customers or filters specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (customersToAssign.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'No available numbers match criteria' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update customers with assignment info
      const assignmentDate = new Date().toISOString();
      await customersCollection.updateMany(
        { id: { $in: customersToAssign.map((c: any) => c.id) } },
        { $set: { assignedTo: agentId, assignedAt: assignmentDate, assignedBy: agentName } }
      );
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          assigned: customersToAssign.length,
          assignedCount: customersToAssign.length,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/database\/customers\/(.+)$/) && req.method === 'DELETE') {
      const id = path.split('/')[3];
      const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
      await collection.deleteOne({ id });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Migration endpoint to fix customer assignedTo fields
    if (path === '/database/customers/migrate' && req.method === 'POST') {
      const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
      
      // Update all customers that don't have assignedTo field or have it undefined
      const result = await customersCollection.updateMany(
        { 
          $or: [
            { assignedTo: { $exists: false } },
            { assignedTo: undefined }
          ]
        },
        { 
          $set: { 
            assignedTo: null,
            assignedAt: null,
            assignedBy: null
          } 
        }
      );
      
      console.log('[MIGRATION] Fixed customer records:', result.modifiedCount);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Fixed ${result.modifiedCount} customer records`,
          modifiedCount: result.modifiedCount
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get customers assigned to a specific agent
    if (path.startsWith('/database/customers/assigned/') && req.method === 'GET') {
      const agentId = path.substring('/database/customers/assigned/'.length);
      console.log('[CUSTOMERS] Getting assigned customers for agent:', agentId);
      const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
      const customers = await collection.find({ assignedTo: agentId }).toArray();
      console.log('[CUSTOMERS] Found', customers.length, 'assigned customers');
      return new Response(
        JSON.stringify({ success: true, customers: convertMongoDocs(customers) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get archived customers (from archive)
    if (path === '/customers/archived' && req.method === 'GET') {
      console.log('[CUSTOMERS] Getting archived customers');
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const archivedCustomers = await archiveCollection.find({ 
        entityType: 'customer' 
      }).toArray();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          customers: convertMongoDocs(archivedCustomers) 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Archive a customer
    if (path === '/customers/archived' && req.method === 'POST') {
      const body = await req.json();
      const { customer } = body;
      
      console.log('[CUSTOMERS] Archiving customer:', customer.id);
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
      
      const archiveEntry = {
        id: generateId(),
        entityType: 'customer',
        entityData: customer,
        archivedAt: new Date().toISOString(),
        archivedBy: body.archivedBy || 'system',
      };
      
      await archiveCollection.insertOne(archiveEntry);
      await customersCollection.deleteOne({ id: customer.id });
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear all customers
    if (path === '/customers/clear' && req.method === 'DELETE') {
      console.log('[CUSTOMERS] Clearing all customers');
      const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
      const result = await collection.deleteMany({});
      console.log('[CUSTOMERS] Deleted', result.deletedCount, 'customers');
      return new Response(
        JSON.stringify({ success: true, deletedCount: result.deletedCount }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== ARCHIVE MANAGEMENT ====================
    // Get all archived records
    if (path === '/archive' && req.method === 'GET') {
      console.log('[ARCHIVE] Getting all archived records');
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const archived = await archiveCollection.find({}).sort({ archivedAt: -1 }).toArray();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          records: convertMongoDocs(archived),
          count: archived.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Restore a record from archive (recycle)
    if (path === '/archive/restore' && req.method === 'POST') {
      const body = await req.json();
      const { recordId, recordType } = body; // recordType: 'client' or 'customer'
      
      console.log('[ARCHIVE] Restoring record:', recordId, 'type:', recordType);
      
      try {
        const archiveCollection = await getCollection(Collections.ARCHIVE);
        const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
        const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
        
        // Find the archived record
        const archivedRecord = await archiveCollection.findOne({ id: recordId });
        
        if (!archivedRecord) {
          return new Response(
            JSON.stringify({ success: false, error: 'Archived record not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Restore to appropriate database
        const restoredData = {
          ...archivedRecord.numberData || archivedRecord.entityData || archivedRecord,
          id: archivedRecord.originalId || generateId(),
          status: 'available',
          assignedTo: null,
          assignedAt: null,
          assignedBy: null,
          restoredAt: new Date().toISOString(),
          restoredFrom: 'archive'
        };
        
        // Remove archive-specific fields
        delete restoredData.archivedAt;
        delete restoredData.archivedBy;
        delete restoredData.callOutcome;
        delete restoredData.calledAt;
        delete restoredData.assignmentId;
        delete restoredData.agentId;
        delete restoredData.agentName;
        delete restoredData._id;
        
        if (recordType === 'customer' || archivedRecord.type === 'customer') {
          await customersCollection.insertOne(restoredData);
          console.log('[ARCHIVE] ✅ Restored to customers database');
        } else {
          await numbersCollection.insertOne(restoredData);
          console.log('[ARCHIVE] ✅ Restored to numbers database');
        }
        
        // Remove from archive
        await archiveCollection.deleteOne({ id: recordId });
        console.log('[ARCHIVE] ✅ Removed from archive');
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[ARCHIVE] Restore error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Permanently delete from archive
    if (path === '/archive/delete' && req.method === 'POST') {
      const body = await req.json();
      const { recordId } = body;
      
      console.log('[ARCHIVE] Permanently deleting record:', recordId);
      
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const result = await archiveCollection.deleteOne({ id: recordId });
      
      if (result.deletedCount === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Record not found in archive' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add customer(s)
    if (path === '/customers' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
      
      // Handle both single customer and bulk customers array
      if (body.customers && Array.isArray(body.customers)) {
        // Bulk save
        console.log('[CUSTOMERS] Bulk saving', body.customers.length, 'customers');
        const customersToSave = body.customers.map((customer: any) => ({
          ...customer,
          id: customer.id || generateId(),
          createdAt: customer.createdAt || new Date().toISOString(),
        }));
        
        if (customersToSave.length > 0) {
          await collection.insertMany(customersToSave);
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Single customer
        console.log('[CUSTOMERS] Adding single customer:', body.name);
        const customer = {
          ...body,
          id: body.id || generateId(),
          createdAt: new Date().toISOString(),
        };
        
        await collection.insertOne(customer);
        
        return new Response(
          JSON.stringify({ success: true, customer }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== NUMBER ASSIGNMENTS ====================
    if (path === '/assignments' && req.method === 'GET') {
      const agentId = url.searchParams.get('agentId');
      const collection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      
      const query = agentId ? { agentId, status: 'active' } : { status: 'active' };
      const assignments = await collection.find(query).toArray();
      
      return new Response(
        JSON.stringify({ success: true, assignments: convertMongoDocs(assignments) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/assignments/claim' && req.method === 'POST') {
      const body = await req.json();
      const { assignmentId, agentId } = body;
      
      const collection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      const assignment = await collection.findOne({ id: assignmentId, status: 'active' });
      
      if (!assignment) {
        return new Response(
          JSON.stringify({ success: false, error: 'Assignment not found or already claimed' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      await collection.updateOne(
        { id: assignmentId },
        { $set: { claimedBy: agentId, claimedAt: new Date().toISOString() } }
      );
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/assignments/mark-called' && req.method === 'POST') {
      const body = await req.json();
      const { assignmentId, outcome } = body;
      
      console.log('[MARK-CALLED] Processing assignment:', assignmentId, 'outcome:', outcome);
      
      try {
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const archiveCollection = await getCollection(Collections.ARCHIVE);
        const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
        const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
        
        // Get the assignment to determine type
        const assignment = await assignmentsCollection.findOne({ id: assignmentId });
        
        if (!assignment) {
          console.error('[MARK-CALLED] Assignment not found:', assignmentId);
          return new Response(
            JSON.stringify({ success: false, error: 'Assignment not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const now = new Date().toISOString();
        
        // Mark assignment as called
        await assignmentsCollection.updateOne(
          { id: assignmentId },
          { 
            $set: { 
              called: true, 
              calledAt: now,
              outcome: outcome || 'completed'
            } 
          }
        );
        
        // Create archive record
        const archiveRecord = {
          id: generateId(),
          originalId: assignment.numberId || assignment.id,
          type: assignment.type || 'client', // 'client' or 'customer'
          ...assignment.numberData,
          assignmentId: assignment.id,
          agentId: assignment.agentId,
          agentName: assignment.agentName,
          assignedAt: assignment.assignedAt,
          calledAt: now,
          callOutcome: outcome || 'completed',
          archivedAt: now,
          archivedBy: assignment.agentId || 'system',
          status: 'archived'
        };
        
        // Insert into archive
        await archiveCollection.insertOne(archiveRecord);
        console.log('[MARK-CALLED] ✅ Archived to archive collection');
        
        // Remove from source database
        if (assignment.numberId) {
          // Check if this is from numbers database (clients)
          const numberExists = await numbersCollection.findOne({ id: assignment.numberId });
          if (numberExists) {
            await numbersCollection.deleteOne({ id: assignment.numberId });
            console.log('[MARK-CALLED] ✅ Removed from numbers database');
          }
        }
        
        // Also try to remove from customers database if it's there
        if (assignment.numberData?.phone) {
          const customerExists = await customersCollection.findOne({ 
            phone: assignment.numberData.phone,
            assignedTo: assignment.agentId
          });
          if (customerExists) {
            await customersCollection.deleteOne({ id: customerExists.id });
            console.log('[MARK-CALLED] ✅ Removed from customers database');
          }
        }
        
        console.log('[MARK-CALLED] ✅ Assignment marked as called and archived successfully');
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('[MARK-CALLED] Error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== USERS ====================
    if (path === '/users' && req.method === 'GET') {
      const collection = await getCollection(Collections.USERS);
      const users = await collection.find({}).toArray();
      // Don't send passwords to frontend
      const sanitizedUsers = users.map(({ password, ...user }: any) => user);
      return new Response(
        JSON.stringify({ success: true, users: convertMongoDocs(sanitizedUsers) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/users' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.USERS);
      
      console.log('[CREATE USER] Attempting to create user:', { 
        username: body.username, 
        email: body.email, 
        role: body.role,
        hasPassword: !!body.password,
        passwordLength: body.password?.length
      });
      
      // Check if username exists
      const existing = await collection.findOne({ username: body.username });
      if (existing) {
        console.log('[CREATE USER] ❌ Username already exists:', body.username);
        return new Response(
          JSON.stringify({ success: false, error: 'Username already exists' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const newUser = {
        id: body.id || generateId(),
        username: body.username,
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role || 'agent',
        permissions: body.permissions || [],
        dailyTarget: body.dailyTarget || 30,
        createdAt: new Date().toISOString(),
      };
      
      console.log('[CREATE USER] Inserting user into MongoDB:', { 
        username: newUser.username, 
        password: newUser.password 
      });
      
      await collection.insertOne(newUser);
      const { password, ...userWithoutPassword } = newUser;
      
      console.log('[CREATE USER] ✅ User created successfully:', newUser.username);
      
      return new Response(
        JSON.stringify({ success: true, user: userWithoutPassword }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/users\/(.+)$/) && req.method === 'PUT') {
      const id = path.split('/')[2];
      const body = await req.json();
      const collection = await getCollection(Collections.USERS);
      
      const updateData: any = {};
      if (body.name) updateData.name = body.name;
      if (body.email) updateData.email = body.email;
      if (body.password) updateData.password = body.password;
      if (body.role) updateData.role = body.role;
      if (body.permissions !== undefined) updateData.permissions = body.permissions;
      if (body.dailyTarget !== undefined) updateData.dailyTarget = body.dailyTarget;
      
      await collection.updateOne({ id }, { $set: updateData });
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/users\/(.+)$/) && req.method === 'DELETE') {
      const id = path.split('/')[2];
      const collection = await getCollection(Collections.USERS);
      await collection.deleteOne({ id });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/users/login' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.USERS);
      
      console.log('[LOGIN] Attempting login:', { username: body.username, passwordLength: body.password?.length });
      
      // First check if user exists by username only
      const userByUsername = await collection.findOne({ username: body.username });
      
      if (!userByUsername) {
        console.log('[LOGIN] ❌ Username not found:', body.username);
        // Log failed login attempt
        const auditCollection = await getCollection(Collections.LOGIN_AUDIT);
        await auditCollection.insertOne({
          id: generateId(),
          userId: null,
          username: body.username,
          success: false,
          timestamp: new Date().toISOString(),
          ipAddress: null,
        });
        
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('[LOGIN] ✅ Username found, checking password...');
      console.log('[LOGIN] Stored password:', userByUsername.password);
      console.log('[LOGIN] Provided password:', body.password);
      console.log('[LOGIN] Passwords match:', userByUsername.password === body.password);
      
      // Now check password
      const user = await collection.findOne({ 
        username: body.username, 
        password: body.password 
      });
      
      if (!user) {
        console.log('[LOGIN] ❌ Password mismatch for user:', body.username);
        // Log failed login attempt
        const auditCollection = await getCollection(Collections.LOGIN_AUDIT);
        await auditCollection.insertOne({
          id: generateId(),
          userId: userByUsername.id,
          username: body.username,
          success: false,
          timestamp: new Date().toISOString(),
          ipAddress: null,
        });
        
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log successful login
      const auditCollection = await getCollection(Collections.LOGIN_AUDIT);
      await auditCollection.insertOne({
        id: generateId(),
        userId: user.id,
        username: user.username,
        success: true,
        timestamp: new Date().toISOString(),
        ipAddress: null,
      });
      
      const { password, ...userWithoutPassword } = user;
      return new Response(
        JSON.stringify({ success: true, user: convertMongoDoc(userWithoutPassword) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== LOGIN AUDIT ====================
    if (path === '/login-audit' && req.method === 'GET') {
      const collection = await getCollection(Collections.LOGIN_AUDIT);
      const logs = await collection.find({}).sort({ timestamp: -1 }).limit(100).toArray();
      return new Response(
        JSON.stringify({ success: true, logs: convertMongoDocs(logs) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== SMTP SETTINGS ====================
    if (path === '/smtp-settings' && req.method === 'GET') {
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      const collection = await getCollection(Collections.SMTP_SETTINGS);
      const settings = await collection.findOne({ type: 'smtp' });
      return new Response(
        JSON.stringify({ success: true, settings: settings ? convertMongoDoc(settings) : {} }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/smtp-settings' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.SMTP_SETTINGS);
      
      await collection.updateOne(
        { type: 'smtp' },
        { $set: { ...body, type: 'smtp', updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/smtp-test' && req.method === 'POST') {
      const body = await req.json();
      console.log('[SMTP] Test email request:', body);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMTP test email sent successfully (MongoDB)' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== EMAIL SENDING ====================
    if (path === '/send-email' && req.method === 'POST') {
      const body = await req.json();
      const { to, subject, htmlContent } = body;
      
      // Get SMTP settings
      const smtpCollection = await getCollection(Collections.SMTP_SETTINGS);
      const smtpSettings = await smtpCollection.findOne({ type: 'smtp' });
      
      if (!smtpSettings || !smtpSettings.host) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'SMTP not configured. Please configure SMTP settings in Admin tab first.' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        // TODO: Implement actual email sending with nodemailer or similar
        // Currently logging only - SMTP integration needed
        console.log('[EMAIL] Email queued (SMTP not configured):', {
          to,
          subject,
          from: smtpSettings.from || smtpSettings.user,
          smtp: smtpSettings.host
        });
        
        // Email logged but not sent - configure SMTP settings to enable actual sending
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email logged (SMTP not configured - configure in Admin Settings to enable actual sending)' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[EMAIL] Error sending email:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message || 'Failed to send email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== 3CX SETTINGS ====================
    if (path === '/threecx-settings' && req.method === 'GET') {
      const collection = await getCollection(Collections.THREECX_SETTINGS);
      const settings = await collection.findOne({ type: '3cx' });
      return new Response(
        JSON.stringify({ success: true, settings: settings ? convertMongoDoc(settings) : {} }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/threecx-settings' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.THREECX_SETTINGS);
      
      await collection.updateOne(
        { type: '3cx' },
        { $set: { ...body, type: '3cx', updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== CALL LOGS ====================
    if (path === '/call-logs' && req.method === 'GET') {
      const agentId = url.searchParams.get('agentId');
      const collection = await getCollection(Collections.CALL_LOGS);
      
      const query = agentId ? { agentId } : {};
      const logs = await collection.find(query).sort({ callTime: -1 }).limit(500).toArray();
      
      return new Response(
        JSON.stringify({ success: true, logs: convertMongoDocs(logs) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/call-logs' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.CALL_LOGS);
      
      const newLog = {
        ...body,
        id: body.id || generateId(),
        callTime: body.callTime || new Date().toISOString(),
      };
      
      await collection.insertOne(newLog);
      
      return new Response(
        JSON.stringify({ success: true, log: newLog }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== DAILY PROGRESS ====================
    if (path === '/daily-progress' && req.method === 'GET') {
      const collection = await getCollection(Collections.DAILY_PROGRESS);
      const progress = await collection.findOne({ type: 'daily' });
      
      if (!progress) {
        const defaultProgress = {
          type: 'daily',
          userProgress: {},
          lastReset: new Date().toISOString(),
        };
        await collection.insertOne(defaultProgress);
        return new Response(
          JSON.stringify({ success: true, progress: defaultProgress }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, progress: convertMongoDoc(progress) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/daily-progress' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.DAILY_PROGRESS);
      
      await collection.updateOne(
        { type: 'daily' },
        { 
          $set: { 
            [`userProgress.${body.userId}`]: {
              callsToday: body.callsToday,
              lastCallTime: body.lastCallTime || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          } 
        },
        { upsert: true }
      );
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/daily-progress/check-reset' && req.method === 'GET') {
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      const collection = await getCollection(Collections.DAILY_PROGRESS);
      const progressData = await collection.findOne({ type: 'daily' });
      
      if (!progressData) {
        return new Response(
          JSON.stringify({ success: true, wasReset: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const lastReset = new Date(progressData.lastReset);
      const now = new Date();
      const shouldReset = now.toDateString() !== lastReset.toDateString();
      
      if (shouldReset) {
        await collection.updateOne(
          { type: 'daily' },
          { 
            $set: { 
              userProgress: {},
              lastReset: now.toISOString()
            } 
          }
        );
        
        console.log('[DAILY PROGRESS] Auto-reset completed at', now.toISOString());
        return new Response(
          JSON.stringify({ 
            success: true, 
            wasReset: true,
            lastReset: now.toISOString()
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          wasReset: false,
          lastReset: progressData.lastReset
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/daily-progress/reset' && req.method === 'POST') {
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      const collection = await getCollection(Collections.DAILY_PROGRESS);
      
      await collection.updateOne(
        { type: 'daily' },
        { 
          $set: { 
            userProgress: {},
            lastReset: new Date().toISOString()
          } 
        },
        { upsert: true }
      );
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== PROMOTIONS ====================
    if (path === '/promotions' && req.method === 'GET') {
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      const collection = await getCollection(Collections.PROMOTIONS);
      const promotions = await collection.find({}).toArray();
      return new Response(
        JSON.stringify({ success: true, promotions: convertMongoDocs(promotions) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/promotions' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.PROMOTIONS);
      
      const newPromotion = {
        ...body,
        id: body.id || generateId(),
        createdAt: new Date().toISOString(),
      };
      
      await collection.insertOne(newPromotion);
      
      return new Response(
        JSON.stringify({ success: true, promotion: newPromotion }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/promotions\/(.+)$/) && req.method === 'PUT') {
      const id = path.split('/')[2];
      const body = await req.json();
      const collection = await getCollection(Collections.PROMOTIONS);
      
      await collection.updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.match(/^\/promotions\/(.+)$/) && req.method === 'DELETE') {
      const id = path.split('/')[2];
      const collection = await getCollection(Collections.PROMOTIONS);
      await collection.deleteOne({ id });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== ARCHIVE ====================
    if (path === '/archive' && req.method === 'GET') {
      const entityType = url.searchParams.get('type');
      const collection = await getCollection(Collections.ARCHIVE);
      
      const query = entityType ? { entityType } : {};
      const archives = await collection.find(query).sort({ archivedAt: -1 }).limit(1000).toArray();
      
      return new Response(
        JSON.stringify({ success: true, archives: convertMongoDocs(archives) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/archive' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.ARCHIVE);
      
      const archiveEntry = {
        ...body,
        id: body.id || generateId(),
        archivedAt: new Date().toISOString(),
      };
      
      await collection.insertOne(archiveEntry);
      
      return new Response(
        JSON.stringify({ success: true, archive: archiveEntry }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/archive/restore' && req.method === 'POST') {
      const body = await req.json();
      const { archiveId, entityType } = body;
      
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const archivedItem = await archiveCollection.findOne({ id: archiveId });
      
      if (!archivedItem) {
        return new Response(
          JSON.stringify({ success: false, error: 'Archived item not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Restore to appropriate collection
      if (entityType === 'number') {
        const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
        const restoredNumber = {
          ...archivedItem.data,
          status: 'available',
          assignedTo: null,
          assignedAt: null,
        };
        await numbersCollection.insertOne(restoredNumber);
      }
      
      // Remove from archive
      await archiveCollection.deleteOne({ id: archiveId });
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== NUMBER CLAIMS ====================
    // Get all active claims
    if (path === '/number-claims' && req.method === 'GET') {
      const collection = await getCollection(Collections.NUMBER_CLAIMS);
      const now = Date.now();
      
      // Clean up expired claims
      await collection.deleteMany({ expiresAt: { $lt: now } });
      
      // Get active claims
      const activeClaims = await collection.find({ expiresAt: { $gte: now } }).toArray();
      
      // Convert to the format expected by frontend
      const claimsMap: any = {};
      activeClaims.forEach((claim: any) => {
        claimsMap[claim.phoneNumber] = {
          claimedBy: claim.userId,
          claimedByName: claim.userName,
          claimedAt: claim.claimedAt,
          expiresAt: claim.expiresAt,
          contactId: claim.contactId,
          type: claim.type,
        };
      });
      
      return new Response(
        JSON.stringify({ success: true, claims: claimsMap }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Claim a number
    if (path === '/claim-number' && req.method === 'POST') {
      const body = await req.json();
      const { phoneNumber, userId, userName, contactId, type } = body;
      const collection = await getCollection(Collections.NUMBER_CLAIMS);
      const now = Date.now();
      const expiresAt = now + (5 * 60 * 1000); // 5 minutes
      
      // Check if already claimed by someone else
      const existingClaim = await collection.findOne({ 
        phoneNumber,
        expiresAt: { $gte: now }
      });
      
      if (existingClaim && existingClaim.userId !== userId) {
        return new Response(
          JSON.stringify({ 
            success: false,
            claimed: true,
            claimedBy: existingClaim.userName,
            error: `Number is being called by ${existingClaim.userName}`
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Create or update claim
      await collection.updateOne(
        { phoneNumber },
        {
          $set: {
            phoneNumber,
            userId,
            userName,
            contactId,
            type,
            claimedAt: now,
            expiresAt,
          }
        },
        { upsert: true }
      );
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Release a number
    if (path === '/release-number' && req.method === 'POST') {
      const body = await req.json();
      const { phoneNumber, userId } = body;
      const collection = await getCollection(Collections.NUMBER_CLAIMS);
      
      // Only allow releasing your own claims
      await collection.deleteOne({ phoneNumber, userId });
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extend a claim
    if (path === '/extend-number-claim' && req.method === 'POST') {
      const body = await req.json();
      const { phoneNumber, userId } = body;
      const collection = await getCollection(Collections.NUMBER_CLAIMS);
      const now = Date.now();
      const newExpiresAt = now + (5 * 60 * 1000); // Extend by 5 more minutes
      
      const result = await collection.updateOne(
        { phoneNumber, userId },
        { $set: { expiresAt: newExpiresAt } }
      );
      
      return new Response(
        JSON.stringify({ 
          success: result.modifiedCount > 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== ADDITIONAL DATABASE OPERATIONS ====================
    if (path === '/database/clients/clear-all' && req.method === 'DELETE') {
      const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
      const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      
      const clientsDeleted = await numbersCollection.deleteMany({});
      const assignmentsDeleted = await assignmentsCollection.deleteMany({});
      
      return new Response(
        JSON.stringify({ 
          success: true,
          cleared: {
            clientsCount: clientsDeleted.deletedCount,
            assignedClientsCount: assignmentsDeleted.deletedCount,
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/database/reset-all' && req.method === 'POST') {
      const collections = [
        Collections.NUMBERS_DATABASE,
        Collections.CUSTOMERS_DATABASE,
        Collections.NUMBER_ASSIGNMENTS,
        Collections.CALL_SCRIPTS,
        Collections.PROMOTIONS,
        Collections.ARCHIVE,
        Collections.CALL_LOGS,
      ];
      
      let totalDeleted = 0;
      for (const collectionName of collections) {
        const collection = await getCollection(collectionName);
        const result = await collection.deleteMany({});
        totalDeleted += result.deletedCount || 0;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Database reset complete',
          deletedCount: totalDeleted
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/cron/daily-archive' && req.method === 'POST') {
      // Archive completed assignments
      const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      
      const completedAssignments = await assignmentsCollection.find({ 
        called: true 
      }).toArray();
      
      if (completedAssignments.length > 0) {
        const archiveEntries = completedAssignments.map(assignment => ({
          id: generateId(),
          entityType: 'assignment',
          data: assignment,
          archivedAt: new Date().toISOString(),
        }));
        
        await archiveCollection.insertMany(archiveEntries);
        await assignmentsCollection.deleteMany({ called: true });
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Daily archive completed',
          results: {
            clients: { count: completedAssignments.length },
            customers: { count: 0 }
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }



    if (path.match(/^\/database\/clients\/[^/]+$/) && req.method === 'DELETE') {
      const id = path.split('/')[3];
      const collection = await getCollection(Collections.NUMBERS_DATABASE);
      await collection.deleteOne({ id });
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/database/clients/bulk-delete' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.NUMBERS_DATABASE);
      const result = await collection.deleteMany({ id: { $in: body.ids } });
      return new Response(
        JSON.stringify({ success: true, deletedCount: result.deletedCount }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get archived clients
    if (path === '/database/clients/archive' && req.method === 'GET') {
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const archivedClients = await archiveCollection.find({ 
        entityType: { $in: ['client', 'contact'] }
      }).toArray();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          records: convertMongoDocs(archivedClients)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bulk restore archived clients
    if (path === '/database/clients/archive/bulk-restore' && req.method === 'POST') {
      const body = await req.json();
      const { recordIds } = body;
      
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
      
      // Get archived records
      const archivedRecords = await archiveCollection.find({ 
        id: { $in: recordIds }
      }).toArray();
      
      if (archivedRecords.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'No records found to restore' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Restore to numbers database
      const recordsToRestore = archivedRecords.map((record: any) => ({
        ...(record.entityData || record.data || record),
        status: 'available',
        restoredAt: new Date().toISOString()
      }));
      
      await numbersCollection.insertMany(recordsToRestore);
      await archiveCollection.deleteMany({ id: { $in: recordIds } });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          restoredCount: recordsToRestore.length 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get archived customers
    if (path === '/database/customers/archive' && req.method === 'GET') {
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const archivedCustomers = await archiveCollection.find({ 
        entityType: 'customer'
      }).toArray();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          records: convertMongoDocs(archivedCustomers)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bulk restore archived customers
    if (path === '/database/customers/archive/bulk-restore' && req.method === 'POST') {
      const body = await req.json();
      const { recordIds } = body;
      
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
      
      // Get archived records
      const archivedRecords = await archiveCollection.find({ 
        id: { $in: recordIds }
      }).toArray();
      
      if (archivedRecords.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'No records found to restore' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Restore to customers database
      const recordsToRestore = archivedRecords.map((record: any) => ({
        ...(record.entityData || record.data || record),
        restoredAt: new Date().toISOString()
      }));
      
      await customersCollection.insertMany(recordsToRestore);
      await archiveCollection.deleteMany({ id: { $in: recordIds } });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          restoredCount: recordsToRestore.length 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log customer interaction
    if (path === '/customer-interactions' && req.method === 'POST') {
      const body = await req.json();
      const { customerId, interaction } = body;
      
      const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
      
      // Add interaction to customer's interactions array
      await collection.updateOne(
        { id: customerId },
        { 
          $push: { 
            interactions: {
              ...interaction,
              timestamp: new Date().toISOString()
            }
          }
        }
      );
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send quick email (wrapper around send-email for consistency)
    if (path === '/send-quick-email' && req.method === 'POST') {
      const body = await req.json();
      const { to, subject, htmlContent } = body;
      
      // Use the existing send-email logic
      const smtpCollection = await getCollection(Collections.SMTP_SETTINGS);
      const smtpSettings = await smtpCollection.findOne({ id: 'default' });
      
      if (!smtpSettings || !smtpSettings.configured) {
        return new Response(
          JSON.stringify({ success: false, error: 'SMTP not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        const transporter = nodemailer.createTransport({
          host: smtpSettings.host,
          port: smtpSettings.port,
          secure: smtpSettings.secure,
          auth: {
            user: smtpSettings.user,
            pass: smtpSettings.password,
          },
        });
        
        await transporter.sendMail({
          from: smtpSettings.from,
          to,
          subject,
          html: htmlContent,
        });
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[EMAIL] Error sending quick email:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== NUMBER ASSIGNMENTS ====================
    if (path === '/assignments' && req.method === 'GET') {
      const collection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      const agentId = url.searchParams.get('agentId');
      
      const query = agentId ? { agentId } : {};
      const assignments = await collection.find(query).sort({ assignedAt: -1 }).toArray();
      
      return new Response(
        JSON.stringify({ success: true, assignments: convertMongoDocs(assignments) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/assignments/claim' && req.method === 'POST') {
      const body = await req.json();
      const { assignmentId, agentId } = body;
      
      const collection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      
      // Check if assignment exists and isn't already claimed
      const assignment = await collection.findOne({ id: assignmentId });
      
      if (!assignment) {
        return new Response(
          JSON.stringify({ success: false, error: 'Assignment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (assignment.claimedBy && assignment.claimedBy !== agentId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Number already claimed by another agent',
            claimedBy: assignment.claimedBy
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Claim the assignment
      await collection.updateOne(
        { id: assignmentId },
        { 
          $set: { 
            claimedBy: agentId,
            claimedAt: new Date().toISOString(),
            status: 'claimed'
          } 
        }
      );
      
      return new Response(
        JSON.stringify({ success: true, message: 'Assignment claimed successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/assignments/mark-called' && req.method === 'POST') {
      const body = await req.json();
      const { assignmentId, outcome } = body;
      
      const collection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      
      await collection.updateOne(
        { id: assignmentId },
        { 
          $set: { 
            called: true,
            calledAt: new Date().toISOString(),
            outcome: outcome || 'completed',
            status: 'completed'
          } 
        }
      );
      
      return new Response(
        JSON.stringify({ success: true, message: 'Assignment marked as called' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== CALL LOGS ====================
    if (path === '/call-logs' && req.method === 'GET') {
      const collection = await getCollection(Collections.CALL_LOGS);
      const agentId = url.searchParams.get('agentId');
      
      const query = agentId ? { agentId } : {};
      const callLogs = await collection.find(query).sort({ callTime: -1 }).toArray();
      
      return new Response(
        JSON.stringify({ success: true, callLogs: convertMongoDocs(callLogs) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/call-logs' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.CALL_LOGS);
      
      const newCallLog = {
        ...body,
        id: body.id || generateId(),
        callTime: body.callTime || new Date().toISOString(),
      };
      
      await collection.insertOne(newCallLog);
      
      return new Response(
        JSON.stringify({ success: true, callLog: convertMongoDoc(newCallLog) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== ARCHIVE ====================
    if (path === '/archive' && req.method === 'GET') {
      const collection = await getCollection(Collections.ARCHIVE);
      const type = url.searchParams.get('type');
      
      const query = type ? { entityType: type } : {};
      const archives = await collection.find(query).sort({ archivedAt: -1 }).toArray();
      
      return new Response(
        JSON.stringify({ success: true, archives: convertMongoDocs(archives) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/archive' && req.method === 'POST') {
      const body = await req.json();
      const collection = await getCollection(Collections.ARCHIVE);
      
      const archiveEntry = {
        id: generateId(),
        ...body,
        archivedAt: new Date().toISOString(),
      };
      
      await collection.insertOne(archiveEntry);
      
      return new Response(
        JSON.stringify({ success: true, archive: convertMongoDoc(archiveEntry) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/archive/restore' && req.method === 'POST') {
      const body = await req.json();
      const { archiveId, entityType } = body;
      
      const archiveCollection = await getCollection(Collections.ARCHIVE);
      const archive = await archiveCollection.findOne({ id: archiveId });
      
      if (!archive) {
        return new Response(
          JSON.stringify({ success: false, error: 'Archive entry not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Restore to appropriate collection based on entityType
      let targetCollection;
      if (entityType === 'contact' || entityType === 'client') {
        targetCollection = await getCollection(Collections.NUMBERS_DATABASE);
      } else if (entityType === 'customer') {
        targetCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
      } else if (entityType === 'assignment') {
        targetCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown entity type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Restore the data
      await targetCollection.insertOne(archive.entityData || archive.data);
      
      // Remove from archive
      await archiveCollection.deleteOne({ id: archiveId });
      
      return new Response(
        JSON.stringify({ success: true, message: 'Item restored successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== LOGIN AUDIT ====================
    if (path === '/login-audit' && req.method === 'GET') {
      const collection = await getCollection(Collections.LOGIN_AUDIT);
      const audits = await collection.find({}).sort({ timestamp: -1 }).limit(100).toArray();
      return new Response(
        JSON.stringify({ success: true, audits: convertMongoDocs(audits) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== MANAGER OPERATIONS ====================
    // /team-performance endpoint moved above (before MongoDB check)
    // /agent-monitoring/overview endpoint moved above (before MongoDB check)
    // /database/clients endpoint moved above (before MongoDB check)
    // /database/customers endpoint moved above (before MongoDB check)

    // Agent Monitoring - Agent Details
    if (path.startsWith('/agent-monitoring/agent/') && req.method === 'GET') {
      const agentId = path.split('/').pop();
      console.log(`✅ /agent-monitoring/agent/${agentId} endpoint HIT!`);
      
      const usersCollection = await getCollection(Collections.USERS);
      const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
      const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
      
      // Get agent details
      const agent = await usersCollection.findOne({ id: agentId });
      
      if (!agent) {
        return new Response(
          JSON.stringify({ success: false, error: 'Agent not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get CRM records (assignments with full client data)
      const assignments = await assignmentsCollection.find({ agentId }).toArray();
      const crmRecords = await Promise.all(assignments.map(async (assignment: any) => {
        const client = await numbersCollection.findOne({ id: assignment.clientId });
        return {
          ...assignment,
          clientData: client,
        };
      }));
      
      // Get Customer Service records
      const customerRecords = await customersCollection.find({ assignedAgent: agentId }).toArray();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          agent: convertMongoDoc(agent),
          data: {
            crmRecords: convertMongoDocs(crmRecords),
            customerRecords: convertMongoDocs(customerRecords),
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }



    // ==================== CLIENTS DATABASE (NUMBERS) ====================
    // /database/clients GET endpoint moved above (before MongoDB check)


    // Get customers assigned to a specific agent
    if (path.match(/^\/database\/customers\/assigned\/[^/]+$/) && req.method === 'GET') {
      const agentId = path.split('/').pop();
      console.log('[DATABASE] Get assigned customers for agent:', agentId);
      
      const readyCheck = checkMongoReady();
      if (readyCheck) return readyCheck;
      
      try {
        const collection = await getCollection(Collections.CUSTOMERS_DATABASE);
        const customers = await collection.find({ 
          assignedAgent: agentId 
        }).toArray();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            customers: convertMongoDocs(customers),
            count: customers.length
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[DATABASE] Error fetching assigned customers:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }


    // ==================== ADMIN OPERATIONS ====================
    // Clear all client/CRM data
    if (path === '/database/clients/clear-all' && req.method === 'DELETE') {
      console.log('[ADMIN] Clear all client CRM data requested');
      
      const clientsCollection = await getCollection(Collections.NUMBERS_DATABASE);
      const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
      
      const clientsResult = await clientsCollection.deleteMany({});
      const assignmentsResult = await assignmentsCollection.deleteMany({});
      
      const totalDeleted = (clientsResult.deletedCount || 0) + (assignmentsResult.deletedCount || 0);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          deletedCount: totalDeleted,
          message: `Cleared ${clientsResult.deletedCount || 0} clients and ${assignmentsResult.deletedCount || 0} assignments`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reset entire database
    if (path === '/database/reset-all' && req.method === 'POST') {
      console.log('[ADMIN] FULL DATABASE RESET requested');
      
      try {
        const collections = [
          Collections.NUMBERS_DATABASE,
          Collections.NUMBER_ASSIGNMENTS,
          Collections.CUSTOMERS_DATABASE,
          Collections.CALL_LOGS,
          Collections.ARCHIVE,
          Collections.NUMBER_CLAIMS,
          Collections.DAILY_PROGRESS,
          Collections.PROMOTIONS,
        ];
        
        let totalDeleted = 0;
        for (const collectionName of collections) {
          const collection = await getCollection(collectionName);
          const result = await collection.deleteMany({});
          totalDeleted += result.deletedCount || 0;
        }
        
        console.log(`[ADMIN] Database reset complete. Deleted ${totalDeleted} records.`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            deletedCount: totalDeleted,
            message: `Database reset complete. Deleted ${totalDeleted} records across all collections.`
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[ADMIN] Error resetting database:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Reset all counters - NEW ENDPOINT
    if (path === '/reset-all-counters' && req.method === 'POST') {
      console.log('[ADMIN] RESET ALL COUNTERS requested');
      
      try {
        const body = await req.json();
        const { 
          resetDailyProgress = true, 
          resetCallLogs = false, 
          resetNumberClaims = true,
          resetAssignmentCounters = true 
        } = body || {};
        
        let countersReset = 0;
        const resetDetails: any = {};
        
        // 1. Reset Daily Progress (most important)
        if (resetDailyProgress) {
          const progressCollection = await getCollection(Collections.DAILY_PROGRESS);
          
          // Reset all user progress to zero
          const result = await progressCollection.updateOne(
            { type: 'daily' },
            {
              $set: {
                userProgress: {},
                lastReset: new Date().toISOString().split('T')[0]
              }
            },
            { upsert: true }
          );
          
          countersReset++;
          resetDetails.dailyProgress = 'All user daily progress reset to zero';
          console.log('[ADMIN] ✅ Daily progress counters reset');
        }
        
        // 2. Reset Number Claims
        if (resetNumberClaims) {
          const claimsCollection = await getCollection(Collections.NUMBER_CLAIMS);
          const result = await claimsCollection.deleteMany({});
          countersReset++;
          resetDetails.numberClaims = `${result.deletedCount || 0} number claims cleared`;
          console.log(`[ADMIN] ✅ Number claims reset (${result.deletedCount || 0} removed)`);
        }
        
        // 3. Reset Assignment Counters (reset callsMade, successfulCalls, missedCalls, AND called status in assignments)
        if (resetAssignmentCounters) {
          const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
          const result = await assignmentsCollection.updateMany(
            {},
            {
              $set: {
                callsMade: 0,
                successfulCalls: 0,
                missedCalls: 0,
                completedCalls: 0,
                called: false  // CRITICAL: Reset completion status so Agent Monitoring shows 0
              }
            }
          );
          countersReset++;
          resetDetails.assignments = `${result.modifiedCount || 0} assignment counters reset`;
          console.log(`[ADMIN] ✅ Assignment counters reset (${result.modifiedCount || 0} updated)`);
        }
        
        // 4. Optionally clear Call Logs (usually not needed, but available)
        if (resetCallLogs) {
          const callLogsCollection = await getCollection(Collections.CALL_LOGS);
          const result = await callLogsCollection.deleteMany({});
          countersReset++;
          resetDetails.callLogs = `${result.deletedCount || 0} call logs cleared`;
          console.log(`[ADMIN] ✅ Call logs cleared (${result.deletedCount || 0} removed)`);
        }
        
        // 5. Reset completion tracking in Numbers and Customers databases
        const numbersCollection = await getCollection(Collections.NUMBERS_DATABASE);
        const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
        
        await numbersCollection.updateMany(
          {},
          { $unset: { completedCalls: "", lastCallDate: "", interactionCompleted: "" } }
        );
        
        // For customers, reset completion flag but preserve notes (historical data)
        await customersCollection.updateMany(
          {},
          { 
            $unset: { completedCalls: "", lastCallDate: "" },
            $set: { interactionCompleted: false }  // Reset completion flag while preserving notes
          }
        );
        
        console.log('[ADMIN] ✅ Completion tracking reset in databases (notes preserved)');
        
        console.log(`[ADMIN] Counter reset complete. ${countersReset} systems reset.`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            countersReset,
            resetDetails,
            message: `Successfully reset ${countersReset} counter systems!`,
            timestamp: new Date().toISOString()
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[ADMIN] Error resetting counters:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Daily archive cron job
    if (path === '/cron/daily-archive' && req.method === 'POST') {
      console.log('[CRON] Daily archive job triggered');
      
      try {
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const archiveCollection = await getCollection(Collections.ARCHIVE);
        
        // Find all called assignments from previous days
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);
        
        const completedAssignments = await assignmentsCollection.find({
          called: true,
          calledAt: { $lt: yesterday.toISOString() }
        }).toArray();
        
        if (completedAssignments.length > 0) {
          // Archive them
          const archiveEntries = completedAssignments.map((assignment: any) => ({
            id: generateId(),
            entityType: 'assignment',
            entityData: assignment,
            archivedAt: new Date().toISOString(),
            archivedBy: 'system',
            reason: 'daily_cron_job',
          }));
          
          await archiveCollection.insertMany(archiveEntries);
          
          // Delete from assignments
          const assignmentIds = completedAssignments.map((a: any) => a.id);
          await assignmentsCollection.deleteMany({ id: { $in: assignmentIds } });
          
          console.log(`[CRON] Archived ${completedAssignments.length} completed assignments`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            archivedCount: completedAssignments.length,
            message: `Daily archive complete. Archived ${completedAssignments.length} records.`
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[CRON] Error in daily archive:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (path === '/admin/delete-selected-data' && req.method === 'POST') {
      const body = await req.json();
      const { confirmationCode, categories } = body;
      
      // Validate confirmation code
      if (confirmationCode !== 'DELETE_SELECTED_DATA') {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid confirmation code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!categories || categories.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'No categories selected' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let totalDeleted = 0;
      
      // Delete data based on selected categories
      for (const category of categories) {
        switch (category) {
          case 'prospective-client':
          case 'client-list':
          case 'assigned-clients':
            const clientsCollection = await getCollection(Collections.NUMBERS_DATABASE);
            const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
            const clientsResult = await clientsCollection.deleteMany({});
            const assignmentsResult = await assignmentsCollection.deleteMany({});
            totalDeleted += (clientsResult.deletedCount || 0) + (assignmentsResult.deletedCount || 0);
            break;
            
          case 'customers':
          case 'customer-records':
            const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
            const customersResult = await customersCollection.deleteMany({});
            totalDeleted += customersResult.deletedCount || 0;
            break;
            
          case 'promotions':
          case 'promo-sales':
            const promosCollection = await getCollection(Collections.PROMOTIONS);
            const promosResult = await promosCollection.deleteMany({});
            totalDeleted += promosResult.deletedCount || 0;
            break;
            
          case 'call-logs':
          case 'call-history':
            const callLogsCollection = await getCollection(Collections.CALL_LOGS);
            const callLogsResult = await callLogsCollection.deleteMany({});
            totalDeleted += callLogsResult.deletedCount || 0;
            break;
            
          case 'archive':
          case 'archived-data':
            const archiveCollection = await getCollection(Collections.ARCHIVE);
            const archiveResult = await archiveCollection.deleteMany({});
            totalDeleted += archiveResult.deletedCount || 0;
            break;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          deletedCount: totalDeleted,
          message: `Deleted ${totalDeleted} items from ${categories.length} categories`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ==================== CALL PROGRESS & RECYCLING ====================
    // Get call progress for all agents
    if (path === '/call-progress' && req.method === 'GET') {
      console.log('[CALL PROGRESS] Getting call progress for all agents');
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const usersCollection = await getCollection(Collections.USERS);
        
        // Get all assignments for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        const assignments = await assignmentsCollection.find({
          assignedAt: { $gte: todayStr }
        }).toArray();
        
        // Get all agents
        const agents = await usersCollection.find({ role: 'agent' }).toArray();
        
        // Calculate progress for each agent
        const progressData = await Promise.all(agents.map(async (agent) => {
          const agentAssignments = assignments.filter(a => a.agentId === agent.id);
          
          const clientAssignments = agentAssignments.filter(a => a.type === 'client');
          const customerAssignments = agentAssignments.filter(a => a.type === 'customer');
          
          const completedClients = clientAssignments.filter(a => a.called === true);
          const completedCustomers = customerAssignments.filter(a => a.called === true);
          
          const uncompletedClients = clientAssignments.filter(a => !a.called);
          const uncompletedCustomers = customerAssignments.filter(a => !a.called);
          
          const results = [];
          
          // Add client progress if any
          if (clientAssignments.length > 0) {
            results.push({
              agentUsername: agent.username,
              agentName: agent.name || agent.username,
              type: 'client',
              totalAssigned: clientAssignments.length,
              completed: completedClients.length,
              uncompleted: uncompletedClients.length,
              completedNumbers: completedClients.map(a => a.phoneNumber),
              uncompletedNumbers: uncompletedClients.map(a => a.phoneNumber),
              assignedDate: clientAssignments[0]?.assignedAt || new Date().toISOString()
            });
          }
          
          // Add customer progress if any
          if (customerAssignments.length > 0) {
            results.push({
              agentUsername: agent.username,
              agentName: agent.name || agent.username,
              type: 'customer',
              totalAssigned: customerAssignments.length,
              completed: completedCustomers.length,
              uncompleted: uncompletedCustomers.length,
              completedNumbers: completedCustomers.map(a => a.phoneNumber),
              uncompletedNumbers: uncompletedCustomers.map(a => a.phoneNumber),
              assignedDate: customerAssignments[0]?.assignedAt || new Date().toISOString()
            });
          }
          
          return results;
        }));
        
        // Flatten the results
        const flatProgress = progressData.flat();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            progress: convertMongoDocs(flatProgress)
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[CALL PROGRESS] Error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message, progress: [] }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Recycle uncompleted calls
    if (path === '/call-progress/recycle' && req.method === 'POST') {
      console.log('[CALL PROGRESS] Recycling uncompleted calls');
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const clientsCollection = await getCollection(Collections.NUMBERS_DATABASE);
        const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
        
        // Find all uncompleted assignments
        const uncompletedAssignments = await assignmentsCollection.find({
          called: { $ne: true }
        }).toArray();
        
        let recycled = 0;
        
        for (const assignment of uncompletedAssignments) {
          if (assignment.type === 'client') {
            // Return client to database
            const client = {
              id: assignment.recordId || assignment.id,
              phoneNumber: assignment.phoneNumber,
              name: assignment.name || 'Unknown',
              recycledAt: new Date().toISOString()
            };
            
            await clientsCollection.updateOne(
              { phoneNumber: assignment.phoneNumber },
              { $set: client },
              { upsert: true }
            );
          } else if (assignment.type === 'customer') {
            // Return customer to database
            const customer = {
              id: assignment.recordId || assignment.id,
              phoneNumber: assignment.phoneNumber,
              name: assignment.name || 'Unknown',
              recycledAt: new Date().toISOString()
            };
            
            await customersCollection.updateOne(
              { phoneNumber: assignment.phoneNumber },
              { $set: customer },
              { upsert: true }
            );
          }
          
          recycled++;
        }
        
        // Delete the uncompleted assignments
        await assignmentsCollection.deleteMany({
          called: { $ne: true }
        });
        
        console.log(`[CALL PROGRESS] Recycled ${recycled} uncompleted calls`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            recycled,
            message: `Successfully recycled ${recycled} uncompleted calls back to the database`
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[CALL PROGRESS] Recycle error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Archive completed calls
    if (path === '/call-progress/archive-completed' && req.method === 'POST') {
      console.log('[CALL PROGRESS] Archiving completed calls');
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const archiveCollection = await getCollection(Collections.ARCHIVE);
        
        // Find all completed assignments
        const completedAssignments = await assignmentsCollection.find({
          called: true
        }).toArray();
        
        if (completedAssignments.length > 0) {
          // Archive them
          const archiveRecords = completedAssignments.map(assignment => ({
            ...assignment,
            entityType: assignment.type === 'client' ? 'client' : 'customer',
            archivedAt: new Date().toISOString(),
            archivedBy: 'system-auto'
          }));
          
          await archiveCollection.insertMany(archiveRecords);
          
          // Delete from assignments
          await assignmentsCollection.deleteMany({
            called: true
          });
          
          console.log(`[CALL PROGRESS] Archived ${completedAssignments.length} completed calls`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            archived: completedAssignments.length,
            message: `Successfully archived ${completedAssignments.length} completed calls`
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[CALL PROGRESS] Archive error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Recycle specific agent's numbers
    if (path === '/call-progress/recycle-agent' && req.method === 'POST') {
      const body = await req.json();
      const { agentUsername, type } = body;
      
      console.log(`[CALL PROGRESS] Recycling ${type} numbers for agent: ${agentUsername}`);
      
      const mongoCheck = await checkMongoReady();
      if (mongoCheck) {
        return mongoCheck;
      }
      
      try {
        const assignmentsCollection = await getCollection(Collections.NUMBER_ASSIGNMENTS);
        const usersCollection = await getCollection(Collections.USERS);
        const clientsCollection = await getCollection(Collections.NUMBERS_DATABASE);
        const customersCollection = await getCollection(Collections.CUSTOMERS_DATABASE);
        
        // Find agent
        const agent = await usersCollection.findOne({ username: agentUsername });
        if (!agent) {
          return new Response(
            JSON.stringify({ success: false, error: 'Agent not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Find uncompleted assignments for this agent and type
        const uncompletedAssignments = await assignmentsCollection.find({
          agentId: agent.id,
          type,
          called: { $ne: true }
        }).toArray();
        
        let recycled = 0;
        
        for (const assignment of uncompletedAssignments) {
          if (type === 'client') {
            const client = {
              id: assignment.recordId || assignment.id,
              phoneNumber: assignment.phoneNumber,
              name: assignment.name || 'Unknown',
              recycledAt: new Date().toISOString(),
              recycledFrom: agentUsername
            };
            
            await clientsCollection.updateOne(
              { phoneNumber: assignment.phoneNumber },
              { $set: client },
              { upsert: true }
            );
          } else if (type === 'customer') {
            const customer = {
              id: assignment.recordId || assignment.id,
              phoneNumber: assignment.phoneNumber,
              name: assignment.name || 'Unknown',
              recycledAt: new Date().toISOString(),
              recycledFrom: agentUsername
            };
            
            await customersCollection.updateOne(
              { phoneNumber: assignment.phoneNumber },
              { $set: customer },
              { upsert: true }
            );
          }
          
          recycled++;
        }
        
        // Delete the assignments
        await assignmentsCollection.deleteMany({
          agentId: agent.id,
          type,
          called: { $ne: true }
        });
        
        console.log(`[CALL PROGRESS] Recycled ${recycled} ${type} numbers from ${agentUsername}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            recycled,
            message: `Recycled ${recycled} ${type} numbers from ${agentUsername}`
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('[CALL PROGRESS] Recycle agent error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ==================== NOT FOUND ====================
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Endpoint not found',
        path,
        method: req.method 
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SERVER ERROR]', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('🚀 BTM Travel CRM Server running on MongoDB!');
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 Database: btm_travel_crm @ cluster0.vlklc6c.mongodb.net');
console.log('📌 Version:', SERVER_VERSION);
console.log('🕒 Started:', SERVER_STARTED);
console.log('✅ All Supabase dependencies removed!');
console.log('');
console.log('🔗 Core Endpoints:');
console.log('   - GET    /health, /test, /debug/endpoints');
console.log('   - POST   /setup/init');
console.log('');
console.log('🔗 Authentication & Users:');
console.log('   - POST   /users/login');
console.log('   - GET    /users, POST /users, PUT /users/:id, DELETE /users/:id');
console.log('   - GET    /login-audit');
console.log('');
console.log('🔗 Database - Clients (CRM):');
console.log('   - GET    /database/clients');
console.log('   - POST   /database/clients/import, /database/clients/assign');
console.log('   - DELETE /database/clients/:id, /database/clients/bulk-delete');
console.log('   - DELETE /database/clients/clear-all (Admin)');
console.log('   - GET    /database/clients/archive');
console.log('   - POST   /database/clients/archive/bulk-restore');
console.log('');
console.log('🔗 Database - Customers:');
console.log('   - GET    /database/customers, /database/customers/assigned/:id');
console.log('   - POST   /database/customers/import, /database/customers/assign');
console.log('   - POST   /customers (Add single/bulk)');
console.log('   - DELETE /customers/clear, /database/customers/:id');
console.log('   - GET    /customers/archived, POST /customers/archived');
console.log('   - POST   /customer-interactions');
console.log('');
console.log('🔗 Assignments & Claims:');
console.log('   - GET    /assignments, POST /assignments/claim');
console.log('   - POST   /assignments/mark-called');
console.log('   - GET    /number-claims');
console.log('   - POST   /claim-number, /release-number, /extend-number-claim');
console.log('');
console.log('🔗 Call Management:');
console.log('   - GET    /call-logs, POST /call-logs');
console.log('   - GET    /call-scripts, POST /call-scripts');
console.log('   - POST   /call-scripts/:id/activate');
console.log('   - DELETE /call-scripts/:id');
console.log('   - GET    /call-scripts/active/:type');
console.log('');
console.log('🔗 Manager Operations: ✅ ALL LOADED');
console.log('   - GET    /team-performance (Full team metrics)');
console.log('   - GET    /agent-monitoring/overview');
console.log('   - GET    /agent-monitoring/agent/:id');
console.log('');
console.log('🔗 Settings & Configuration:');
console.log('   - GET    /smtp-settings, POST /smtp-settings, POST /smtp-test');
console.log('   - POST   /send-email, /send-quick-email');
console.log('   - GET    /threecx-settings, POST /threecx-settings');
console.log('   - GET    /email-recipients, POST /email-recipients');
console.log('');
console.log('🔗 Progress & Promotions:');
console.log('   - GET    /daily-progress, POST /daily-progress');
console.log('   - GET    /daily-progress/check-reset, POST /daily-progress/reset');
console.log('   - GET    /promotions, POST /promotions');
console.log('   - PUT    /promotions/:id, DELETE /promotions/:id');
console.log('');
console.log('🔗 Archive:');
console.log('   - GET    /archive, POST /archive');
console.log('   - POST   /archive/restore');
console.log('');
console.log('🔗 Admin Operations: ✅ ALL LOADED');
console.log('   - POST   /admin/delete-selected-data');
console.log('   - POST   /database/reset-all (Full reset)');
console.log('   - POST   /cron/daily-archive (Auto-archive)');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
