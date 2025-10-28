// Backend Service - Pure MongoDB Backend (No Supabase!)
import { BACKEND_URL } from './config';

// Generic fetch wrapper for backend calls with timeout
async function backendFetch(endpoint: string, options: RequestInit = {}, customTimeout?: number): Promise<any> {
  const url = `${BACKEND_URL}${endpoint}`;
  
  // Silently make requests (no console logs unless error)
  
  // Create an AbortController for timeout
  // Use longer timeout for health checks (30s) to allow MongoDB to connect
  // Regular requests use 15s timeout
  const isHealthCheck = endpoint.includes('/health') || endpoint.includes('/test');
  const timeout = customTimeout || (isHealthCheck ? 30000 : 15000);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      // Silently handle all HTTP errors
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Backend server not responding. Please make sure it's running:\n\ncd backend\ndeno run --allow-net --allow-env server.tsx\n\nOr use: ./backend/start.sh (Mac/Linux) or .\\backend\\start.bat (Windows)`);
    }
    
    // Network errors (server not running)
    if (error.message?.includes('fetch failed') || error.message?.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to backend server at ${BACKEND_URL}.\n\nThe server is not running. Please start it:\n\ncd backend\ndeno run --allow-net --allow-env server.tsx`);
    }
    
    // Silently throw error (handled by calling component)
    throw error;
  }
}

// Public API
export const backendService = {
  // Health Check
  async health() {
    return backendFetch('/health');
  },

  // Setup & Initialization
  async setupInit() {
    return backendFetch('/setup/init', {
      method: 'POST',
    });
  },

  // Email Recipients
  async getEmailRecipients() {
    try {
      return await backendFetch('/email-recipients');
    } catch (error: any) {
      // If endpoint not found (404), return graceful fallback silently
      if (error.message?.includes('404')) {
        return {
          success: true,
          recipients: [
            "operations@btmlimited.net",
            "quantityassurance@btmlimited.net",
            "clientcare@btmlimited.net"
          ]
        };
      }
      throw error;
    }
  },

  async saveEmailRecipients(recipients: string[]) {
    return backendFetch('/email-recipients', {
      method: 'POST',
      body: JSON.stringify({ recipients }),
    });
  },

  // Users & Authentication
  async login(username: string, password: string) {
    return backendFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async getUsers() {
    return backendFetch('/users');
  },

  async addUser(user: any) {
    return backendFetch('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async updateUser(userId: string, updates: any) {
    return backendFetch(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteUser(userId: string) {
    return backendFetch(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Login Audit
  async getLoginAudit() {
    return backendFetch('/login-audit');
  },

  // Numbers Database
  async getClients() {
    return backendFetch('/database/clients');
  },

  async importClients(clients: any[]) {
    return backendFetch('/database/clients/import', {
      method: 'POST',
      body: JSON.stringify({ clients }),
    });
  },

  async assignClients(payload: { clientIds?: string[], agentId: string, filters?: any }) {
    return backendFetch('/database/clients/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteClient(clientId: string) {
    return backendFetch(`/database/clients/${clientId}`, {
      method: 'DELETE',
    });
  },

  async bulkDeleteClients(ids: string[]) {
    return backendFetch('/database/clients/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  // Number Assignments
  async getAssignments(agentId?: string) {
    const params = agentId ? `?agentId=${agentId}` : '';
    return backendFetch(`/assignments${params}`);
  },

  async claimAssignment(assignmentId: string, agentId: string) {
    return backendFetch('/assignments/claim', {
      method: 'POST',
      body: JSON.stringify({ assignmentId, agentId }),
    });
  },

  async markAssignmentCalled(assignmentId: string, outcome?: string) {
    return backendFetch('/assignments/mark-called', {
      method: 'POST',
      body: JSON.stringify({ assignmentId, outcome }),
    });
  },

  // Call Logs
  async getCallLogs(agentId?: string) {
    const params = agentId ? `?agentId=${agentId}` : '';
    return backendFetch(`/call-logs${params}`);
  },

  async addCallLog(callLog: any) {
    return backendFetch('/call-logs', {
      method: 'POST',
      body: JSON.stringify(callLog),
    });
  },

  // Call Scripts
  async getCallScripts() {
    return backendFetch('/call-scripts');
  },

  async addCallScript(script: any) {
    return backendFetch('/call-scripts', {
      method: 'POST',
      body: JSON.stringify(script),
    });
  },

  async activateCallScript(scriptId: string) {
    return backendFetch(`/call-scripts/${scriptId}/activate`, {
      method: 'POST',
    });
  },

  async deleteCallScript(scriptId: string) {
    return backendFetch(`/call-scripts/${scriptId}`, {
      method: 'DELETE',
    });
  },

  async getActiveCallScript(type: 'prospective' | 'existing') {
    return backendFetch(`/call-scripts/active/${type}`);
  },

  // Alias for backwards compatibility
  async getCallScript(type: 'prospective' | 'existing') {
    return this.getActiveCallScript(type);
  },

  // Daily Progress
  async getDailyProgress() {
    return backendFetch('/daily-progress');
  },

  async updateDailyProgress(userId: string, callsToday: number, lastCallTime?: string) {
    return backendFetch('/daily-progress', {
      method: 'POST',
      body: JSON.stringify({ userId, callsToday, lastCallTime }),
    });
  },

  async checkDailyReset() {
    return backendFetch('/daily-progress/check-reset');
  },

  async resetDailyProgress() {
    return backendFetch('/daily-progress/reset', {
      method: 'POST',
    });
  },

  // Promotions
  async getPromotions() {
    return backendFetch('/promotions');
  },

  async addPromotion(promotion: any) {
    return backendFetch('/promotions', {
      method: 'POST',
      body: JSON.stringify(promotion),
    });
  },

  async updatePromotion(promotionId: string, updates: any) {
    return backendFetch(`/promotions/${promotionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deletePromotion(promotionId: string) {
    return backendFetch(`/promotions/${promotionId}`, {
      method: 'DELETE',
    });
  },

  // SMTP Settings
  async getSMTPSettings() {
    return backendFetch('/smtp-settings');
  },

  async updateSMTPSettings(settings: any) {
    return backendFetch('/smtp-settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  async testSMTP(smtpConfig: any) {
    return backendFetch('/smtp-test', {
      method: 'POST',
      body: JSON.stringify(smtpConfig),
    });
  },

  async sendEmail(to: string, subject: string, htmlContent: string) {
    return backendFetch('/send-email', {
      method: 'POST',
      body: JSON.stringify({ to, subject, htmlContent }),
    });
  },

  // 3CX Settings
  async get3CXSettings() {
    return backendFetch('/threecx-settings');
  },

  async update3CXSettings(settings: any) {
    return backendFetch('/threecx-settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  // Archive
  async getArchive(type?: string) {
    const params = type ? `?type=${type}` : '';
    return backendFetch(`/archive${params}`);
  },

  async archiveItem(item: any) {
    return backendFetch('/archive', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async restoreFromArchive(archiveId: string, entityType: string) {
    return backendFetch('/archive/restore', {
      method: 'POST',
      body: JSON.stringify({ archiveId, entityType }),
    });
  },

  // Archive - Type-specific helpers
  async getArchivedContacts() {
    const response = await this.getArchive('contact');
    return {
      success: response.success,
      contacts: response.archives || []
    };
  },

  async getArchivedCustomers() {
    const response = await this.getArchive('customer');
    return {
      success: response.success,
      customers: response.archives || []
    };
  },

  async archiveContact(contact: any) {
    return this.archiveItem({
      ...contact,
      entityType: 'contact',
      entityData: contact
    });
  },

  async archiveCustomer(customer: any) {
    return this.archiveItem({
      ...customer,
      entityType: 'customer',
      entityData: customer
    });
  },

  // Legacy compatibility - these methods return mock data
  async getAdminSettings() {
    // Return users data instead (admin settings now handled per-user)
    const usersResponse = await this.getUsers();
    return {
      success: true,
      settings: {
        globalTarget: 30,
        users: usersResponse.users || []
      }
    };
  },

  async setGlobalTarget(target: number) {
    // Global target is now per-user, this is a no-op
    console.log('[BACKEND] Global target is now per-user. Update individual user targets.');
    return { success: true };
  },

  // Number Claims
  async getNumberClaims() {
    return backendFetch('/number-claims');
  },

  async claimNumber(phoneNumber: string, userId: string, userName: string, contactId?: string, type?: string) {
    return backendFetch('/claim-number', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, userId, userName, contactId, type }),
    });
  },

  async releaseNumber(phoneNumber: string, userId: string) {
    return backendFetch('/release-number', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, userId }),
    });
  },

  async extendNumberClaim(phoneNumber: string, userId: string) {
    return backendFetch('/extend-number-claim', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, userId }),
    });
  },

  // Customers
  async getCustomers() {
    return backendFetch('/database/customers');
  },

  async getAssignedCustomers(agentId: string) {
    return backendFetch(`/database/customers/assigned/${agentId}`);
  },

  async addCustomer(customer: any) {
    return backendFetch('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },

  async clearCustomers() {
    return backendFetch('/customers/clear', {
      method: 'DELETE',
    });
  },

  async getArchivedCustomers() {
    return backendFetch('/customers/archived');
  },

  async archiveCustomer(customer: any, archivedBy?: string) {
    return backendFetch('/customers/archived', {
      method: 'POST',
      body: JSON.stringify({ customer, archivedBy }),
    });
  },

  async logCustomerInteraction(customerId: string, interaction: any) {
    return backendFetch('/customer-interactions', {
      method: 'POST',
      body: JSON.stringify({ customerId, interaction }),
    });
  },

  async sendQuickEmail(to: string, subject: string, htmlContent: string) {
    return backendFetch('/send-quick-email', {
      method: 'POST',
      body: JSON.stringify({ to, subject, htmlContent }),
    });
  },

  // Admin Operations
  async clearAllClientCRMData() {
    return backendFetch('/database/clients/clear-all', {
      method: 'DELETE',
    });
  },

  async deleteSelectedData(confirmationCode: string, categories: string[]) {
    return backendFetch('/admin/delete-selected-data', {
      method: 'POST',
      body: JSON.stringify({ confirmationCode, categories }),
    });
  },

  async resetDatabase() {
    return backendFetch('/database/reset-all', {
      method: 'POST',
    });
  },

  async runDailyArchive() {
    return backendFetch('/cron/daily-archive', {
      method: 'POST',
    });
  },

  // Manager Operations
  async getTeamPerformance() {
    return backendFetch('/team-performance');
  },

  // Archive Operations - Specific endpoints
  async getArchivedClients() {
    return backendFetch('/database/clients/archive');
  },

  async getArchivedCustomersFromDB() {
    return backendFetch('/database/customers/archive');
  },

  async bulkRestoreClients(recordIds: string[]) {
    return backendFetch('/database/clients/archive/bulk-restore', {
      method: 'POST',
      body: JSON.stringify({ recordIds }),
    });
  },

  async bulkRestoreCustomers(recordIds: string[]) {
    return backendFetch('/database/customers/archive/bulk-restore', {
      method: 'POST',
      body: JSON.stringify({ recordIds }),
    });
  },

  // Agent Monitoring
  async getAgentMonitoringOverview() {
    return backendFetch('/agent-monitoring/overview');
  },

  async getAgentMonitoringDetails(agentId: string) {
    return backendFetch(`/agent-monitoring/agent/${agentId}`);
  },
};
