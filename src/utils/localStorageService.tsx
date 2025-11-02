// Local Storage Service - Frontend-only data persistence
// This allows the app to work without a backend server

// Storage keys
const KEYS = {
  USERS: 'btm_users',
  CONTACTS: 'btm_contacts',
  CUSTOMERS: 'btm_customers',
  ARCHIVED_CUSTOMERS: 'btm_archived_customers',
  CALL_HISTORY: 'btm_call_history',
  SPECIAL_DATABASE: 'btm_special_database',
  SPECIAL_ARCHIVE: 'btm_special_archive',
  SPECIAL_ASSIGNMENTS: 'btm_special_assignments',
  DATABASE_CLIENTS: 'btm_database_clients',
  DATABASE_CUSTOMERS: 'btm_database_customers',
  AGENT_ASSIGNMENTS: 'btm_agent_assignments',
  EMAIL_RECIPIENTS: 'btm_email_recipients',
  DAILY_PROGRESS: 'btm_daily_progress',
  LOGIN_AUDIT: 'btm_login_audit',
  THREECX_SETTINGS: 'btm_threecx_settings',
  SMTP_SETTINGS: 'btm_smtp_settings',
  CALL_SCRIPTS: 'btm_call_scripts',
  CURRENT_USER: 'btm_current_user',
};

// Helper functions
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// Initialize default admin user if none exists
function initializeDefaultUsers() {
  const users = getItem(KEYS.USERS, []);
  if (users.length === 0) {
    const defaultAdmin = {
      id: 'admin_default',
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      name: 'Administrator',
      email: 'admin@btmtravel.net',
      role: 'admin',
      permissions: ['all'],
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setItem(KEYS.USERS, [defaultAdmin]);
  }
}

// Initialize on load
initializeDefaultUsers();

export const localStorageService = {
  // Users
  getUsers: () => getItem(KEYS.USERS, []),
  saveUsers: (users: any[]) => setItem(KEYS.USERS, users),
  addUser: (user: any) => {
    const users = getItem(KEYS.USERS, []);
    users.push({ ...user, id: user.id || `user_${Date.now()}`, createdAt: new Date().toISOString() });
    setItem(KEYS.USERS, users);
    return users[users.length - 1];
  },
  updateUser: (userId: string, updates: any) => {
    const users = getItem(KEYS.USERS, []);
    const index = users.findIndex((u: any) => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
      setItem(KEYS.USERS, users);
      return users[index];
    }
    return null;
  },
  deleteUser: (userId: string) => {
    const users = getItem(KEYS.USERS, []);
    const filtered = users.filter((u: any) => u.id !== userId);
    setItem(KEYS.USERS, filtered);
  },

  // Current User Session
  getCurrentUser: () => getItem(KEYS.CURRENT_USER, null),
  setCurrentUser: (user: any) => setItem(KEYS.CURRENT_USER, user),
  clearCurrentUser: () => localStorage.removeItem(KEYS.CURRENT_USER),

  // Special Database
  getSpecialDatabase: () => getItem(KEYS.SPECIAL_DATABASE, []),
  saveSpecialDatabase: (numbers: any[]) => setItem(KEYS.SPECIAL_DATABASE, numbers),
  addSpecialNumbers: (numbers: any[]) => {
    const existing = getItem(KEYS.SPECIAL_DATABASE, []);
    existing.push(...numbers);
    setItem(KEYS.SPECIAL_DATABASE, existing);
  },
  updateSpecialNumber: (id: string, updates: any) => {
    const numbers = getItem(KEYS.SPECIAL_DATABASE, []);
    const index = numbers.findIndex((n: any) => n.id === id);
    if (index !== -1) {
      numbers[index] = { ...numbers[index], ...updates };
      setItem(KEYS.SPECIAL_DATABASE, numbers);
    }
  },
  deleteSpecialNumber: (id: string) => {
    const numbers = getItem(KEYS.SPECIAL_DATABASE, []);
    const filtered = numbers.filter((n: any) => n.id !== id);
    setItem(KEYS.SPECIAL_DATABASE, filtered);
  },

  // Special Archive
  getSpecialArchive: () => getItem(KEYS.SPECIAL_ARCHIVE, []),
  getSpecialDatabaseArchive: () => getItem(KEYS.SPECIAL_ARCHIVE, []), // Alias for consistency
  addToSpecialArchive: (archivedNumber: any) => {
    const archive = getItem(KEYS.SPECIAL_ARCHIVE, []);
    archive.push(archivedNumber);
    setItem(KEYS.SPECIAL_ARCHIVE, archive);
  },
  recycleFromSpecialArchive: (ids: string[]) => {
    const archive = getItem(KEYS.SPECIAL_ARCHIVE, []);
    const toRecycle = archive.filter((a: any) => ids.includes(a.id));
    const remaining = archive.filter((a: any) => !ids.includes(a.id));
    setItem(KEYS.SPECIAL_ARCHIVE, remaining);
    
    // Add back to special database
    const database = getItem(KEYS.SPECIAL_DATABASE, []);
    const recycled = toRecycle.map((item: any) => ({
      id: `special_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber: item.phoneNumber,
      purpose: item.purpose,
      notes: item.notes,
      uploadedAt: new Date().toISOString(),
      status: 'available',
    }));
    database.push(...recycled);
    setItem(KEYS.SPECIAL_DATABASE, database);
  },

  // Database Clients & Customers
  getDatabaseClients: () => getItem(KEYS.DATABASE_CLIENTS, []),
  saveDatabaseClients: (clients: any[]) => setItem(KEYS.DATABASE_CLIENTS, clients),
  
  getDatabaseCustomers: () => getItem(KEYS.DATABASE_CUSTOMERS, []),
  saveDatabaseCustomers: (customers: any[]) => setItem(KEYS.DATABASE_CUSTOMERS, customers),

  // Agent Assignments
  getAgentAssignments: () => getItem(KEYS.AGENT_ASSIGNMENTS, []),
  saveAgentAssignments: (assignments: any[]) => setItem(KEYS.AGENT_ASSIGNMENTS, assignments),
  getAgentAssignment: (agentId: string) => {
    const assignments = getItem(KEYS.AGENT_ASSIGNMENTS, []);
    return assignments.find((a: any) => a.agentId === agentId);
  },
  updateAgentAssignment: (agentId: string, updates: any) => {
    const assignments = getItem(KEYS.AGENT_ASSIGNMENTS, []);
    const index = assignments.findIndex((a: any) => a.agentId === agentId);
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...updates };
    } else {
      assignments.push({ agentId, ...updates });
    }
    setItem(KEYS.AGENT_ASSIGNMENTS, assignments);
  },

  // Call History
  getCallHistory: () => getItem(KEYS.CALL_HISTORY, []),
  addCallHistory: (call: any) => {
    const history = getItem(KEYS.CALL_HISTORY, []);
    history.unshift({ ...call, id: `call_${Date.now()}`, timestamp: new Date().toISOString() });
    // Keep only last 1000 calls
    if (history.length > 1000) history.splice(1000);
    setItem(KEYS.CALL_HISTORY, history);
  },

  // Daily Progress
  getDailyProgress: () => getItem(KEYS.DAILY_PROGRESS, {}),
  updateDailyProgress: (agentId: string, date: string, progress: any) => {
    const allProgress = getItem(KEYS.DAILY_PROGRESS, {});
    if (!allProgress[agentId]) allProgress[agentId] = {};
    allProgress[agentId][date] = progress;
    setItem(KEYS.DAILY_PROGRESS, allProgress);
  },

  // Email Recipients
  getEmailRecipients: () => getItem(KEYS.EMAIL_RECIPIENTS, []),
  saveEmailRecipients: (recipients: any[]) => setItem(KEYS.EMAIL_RECIPIENTS, recipients),

  // Login Audit
  getLoginAudit: () => getItem(KEYS.LOGIN_AUDIT, []),
  addLoginAudit: (entry: any) => {
    const audit = getItem(KEYS.LOGIN_AUDIT, []);
    audit.unshift({ ...entry, timestamp: new Date().toISOString() });
    // Keep only last 500 entries
    if (audit.length > 500) audit.splice(500);
    setItem(KEYS.LOGIN_AUDIT, audit);
  },

  // Settings
  getThreeCXSettings: () => getItem(KEYS.THREECX_SETTINGS, { enabled: false }),
  saveThreeCXSettings: (settings: any) => setItem(KEYS.THREECX_SETTINGS, settings),
  
  getSMTPSettings: () => getItem(KEYS.SMTP_SETTINGS, {}),
  saveSMTPSettings: (settings: any) => setItem(KEYS.SMTP_SETTINGS, settings),

  // Call Scripts
  getCallScripts: () => getItem(KEYS.CALL_SCRIPTS, []),
  saveCallScripts: (scripts: any[]) => setItem(KEYS.CALL_SCRIPTS, scripts),

  // Utility: Clear all data
  clearAll: () => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    initializeDefaultUsers();
  },

  // Utility: Export data
  exportAll: () => {
    const data: any = {};
    Object.entries(KEYS).forEach(([name, key]) => {
      data[name] = getItem(key, null);
    });
    return data;
  },

  // Utility: Import data
  importAll: (data: any) => {
    Object.entries(KEYS).forEach(([name, key]) => {
      if (data[name]) {
        setItem(key, data[name]);
      }
    });
  },
};
