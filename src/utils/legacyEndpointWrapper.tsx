/**
 * Legacy Endpoint Wrapper
 * 
 * This utility provides a compatibility layer for components still using old
 * endpoints. It redirects to backendService where possible,
 * and provides graceful fallback behavior for deprecated endpoints.
 */

import { backendService } from './backendService';
import { toast } from 'sonner@2.0.3';

export const legacyEndpoints = {
  /**
   * Email Recipients - Redirect to backendService
   */
  async getEmailRecipients() {
    try {
      return await backendService.getEmailRecipients();
    } catch (error) {
      console.error('[LEGACY] Email recipients failed:', error);
      // Fallback to defaults if backend fails
      return {
        success: true,
        recipients: [
          "operations@btmlimited.net",
          "quantityassurance@btmlimited.net",
          "clientcare@btmlimited.net"
        ],
        isDefault: true,
        warning: "Using default email recipients (backend unavailable)"
      };
    }
  },

  async saveEmailRecipients(emails: string[]) {
    try {
      return await backendService.saveEmailRecipients(emails);
    } catch (error) {
      console.error('[LEGACY] Email recipients save failed:', error);
      toast.error("Failed to save email recipients. Please check backend connection.");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save email recipients"
      };
    }
  },

  /**
   * Contacts - Legacy feature, not in new system
   * Provides stub responses
   */
  async addContact(contact: any) {
    console.warn('[LEGACY] contacts endpoint not implemented - providing stub');
    toast.info("Contact management moved to Client Database. Please use Database Manager instead.");
    return {
      success: false,
      error: "Contacts endpoint deprecated. Use Database Manager for client management."
    };
  },

  async getContacts() {
    console.warn('[LEGACY] contacts endpoint not implemented - returning empty');
    return {
      success: true,
      contacts: [],
      warning: "Contacts endpoint deprecated. Use Database Manager for client management."
    };
  },

  /**
   * Number Bank - Not implemented, redirects to database/clients
   */
  async addToNumberBank(importType: string, numbers: any[]) {
    console.warn(`[LEGACY] number-bank/${importType}/add not implemented`);
    toast.warning("Number bank management has been consolidated into Database Manager.");
    return {
      success: false,
      error: "Number bank endpoint deprecated. Use Database Manager to import clients/customers."
    };
  },

  async assignFromNumberBank(payload: any) {
    console.warn('[LEGACY] number-bank/assign not implemented');
    toast.warning("Please use Database Manager to assign numbers to agents.");
    return {
      success: false,
      error: "Number bank endpoint deprecated. Use Database Manager for assignments."
    };
  },

  /**
   * Health checks and diagnostics - redirect to backendService
   */
  async health() {
    try {
      return await backendService.health();
    } catch (error) {
      console.error('[LEGACY] Health check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  },

  async teamPerformance() {
    try {
      return await backendService.getTeamPerformance();
    } catch (error) {
      console.error('[LEGACY] Team performance check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Team performance check failed'
      };
    }
  },

  /**
   * Agent monitoring - redirect to backendService
   */
  async getAgentMonitoringDetails(agentId: string) {
    try {
      return await backendService.getAgentMonitoringDetails(agentId);
    } catch (error) {
      console.error('[LEGACY] Agent monitoring failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Agent monitoring failed'
      };
    }
  },

  /**
   * Number claims - redirect to backendService
   */
  async getNumberClaims() {
    try {
      return await backendService.getNumberClaims();
    } catch (error) {
      console.error('[LEGACY] Get number claims failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Get number claims failed'
      };
    }
  },

  /**
   * Daily archive cron - redirect to database manager manual trigger
   */
  async runDailyArchive() {
    console.warn('[LEGACY] cron/daily-archive endpoint - manual operation required');
    toast.info("Automated archiving requires manual setup. Use Archive Manager to archive items.");
    return {
      success: false,
      error: "Automated archiving requires backend configuration"
    };
  }
};
