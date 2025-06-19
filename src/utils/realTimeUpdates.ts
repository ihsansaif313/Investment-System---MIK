/**
 * Real-time update utilities for cross-component communication
 * Provides a simple event-based system for triggering updates across the application
 */

export type UpdateEventType =
  | 'companyAssignmentUpdated'
  | 'companyCreated'
  | 'companyUpdated'
  | 'companyDeleted'
  | 'userRoleUpdated'
  | 'adminApprovalUpdated'
  | 'investmentUpdated'
  | 'dataRefresh';

interface UpdateEventDetail {
  type: UpdateEventType;
  data?: any;
  timestamp: Date;
  source?: string;
}

/**
 * Trigger a real-time update event
 */
export const triggerUpdate = (type: UpdateEventType, data?: any, source?: string) => {
  const detail: UpdateEventDetail = {
    type,
    data,
    timestamp: new Date(),
    source
  };

  // Dispatch custom event
  const event = new CustomEvent(type, { detail });
  window.dispatchEvent(event);

  // Also dispatch a generic update event
  const genericEvent = new CustomEvent('dataRefresh', { detail });
  window.dispatchEvent(genericEvent);

  console.log(`[RealTime] Update triggered: ${type}`, detail);
};

/**
 * Listen for real-time update events
 */
export const listenForUpdates = (
  type: UpdateEventType | UpdateEventType[],
  callback: (detail: UpdateEventDetail) => void
): (() => void) => {
  const types = Array.isArray(type) ? type : [type];
  const listeners: Array<() => void> = [];

  types.forEach(eventType => {
    const listener = (event: CustomEvent<UpdateEventDetail>) => {
      callback(event.detail);
    };

    window.addEventListener(eventType, listener as EventListener);
    listeners.push(() => window.removeEventListener(eventType, listener as EventListener));
  });

  // Return cleanup function
  return () => {
    listeners.forEach(cleanup => cleanup());
  };
};

/**
 * Hook for listening to real-time updates in React components
 */
export const useRealTimeUpdates = (
  type: UpdateEventType | UpdateEventType[],
  callback: (detail: UpdateEventDetail) => void,
  dependencies: any[] = []
) => {
  React.useEffect(() => {
    const cleanup = listenForUpdates(type, callback);
    return cleanup;
  }, dependencies);
};

/**
 * Company-specific update triggers
 */
export const companyUpdates = {
  assignmentCreated: (assignmentData: any) =>
    triggerUpdate('companyAssignmentUpdated', { action: 'created', ...assignmentData }, 'company-management'),

  assignmentRemoved: (assignmentData: any) =>
    triggerUpdate('companyAssignmentUpdated', { action: 'removed', ...assignmentData }, 'company-management'),

  assignmentUpdated: (assignmentData: any) =>
    triggerUpdate('companyAssignmentUpdated', { action: 'updated', ...assignmentData }, 'company-management'),

  companyCreated: (companyData: any) =>
    triggerUpdate('companyCreated', companyData, 'company-management'),

  companyUpdated: (companyData: any) =>
    triggerUpdate('companyUpdated', companyData, 'company-management'),

  companyDeleted: (companyId: string) =>
    triggerUpdate('companyDeleted', { companyId }, 'company-management')
};

/**
 * Admin approval update triggers
 */
export const adminUpdates = {
  adminApproved: (adminData: any) =>
    triggerUpdate('adminApprovalUpdated', { action: 'approved', ...adminData }, 'admin-management'),

  adminRejected: (adminData: any) =>
    triggerUpdate('adminApprovalUpdated', { action: 'rejected', ...adminData }, 'admin-management'),

  adminStatusChanged: (adminData: any) =>
    triggerUpdate('adminApprovalUpdated', { action: 'status_changed', ...adminData }, 'admin-management')
};

/**
 * Auto-refresh functionality with exponential backoff
 */
export class AutoRefresh {
  private interval: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private maxRetries = 5;
  private baseInterval = 30000; // 30 seconds

  constructor(
    private callback: () => Promise<void>,
    private intervalMs: number = 30000
  ) {}

  start() {
    if (this.interval) return;

    this.interval = setInterval(async () => {
      try {
        await this.callback();
        this.retryCount = 0; // Reset on success
      } catch (error) {
        console.error('[AutoRefresh] Error during refresh:', error);
        this.retryCount++;
        
        if (this.retryCount >= this.maxRetries) {
          console.warn('[AutoRefresh] Max retries reached, stopping auto-refresh');
          this.stop();
        }
      }
    }, this.intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  restart() {
    this.stop();
    this.start();
  }

  updateInterval(newInterval: number) {
    this.intervalMs = newInterval;
    if (this.interval) {
      this.restart();
    }
  }
}

/**
 * Debounced update trigger to prevent spam
 */
export const debouncedTriggerUpdate = (() => {
  const timeouts = new Map<string, NodeJS.Timeout>();

  return (type: UpdateEventType, data?: any, source?: string, delay = 1000) => {
    const key = `${type}-${source || 'default'}`;
    
    // Clear existing timeout
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key)!);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      triggerUpdate(type, data, source);
      timeouts.delete(key);
    }, delay);

    timeouts.set(key, timeout);
  };
})();

// Import React for the hook
import React from 'react';
