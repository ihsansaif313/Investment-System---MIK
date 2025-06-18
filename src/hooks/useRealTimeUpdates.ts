import { useEffect, useCallback, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { RealTimeUpdate } from '../types/database';

interface UseRealTimeUpdatesOptions {
  enabled?: boolean;
  pollingInterval?: number;
  onUpdate?: (update: RealTimeUpdate) => void;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}) => {
  const {
    enabled = true,
    pollingInterval = 30000, // 30 seconds
    onUpdate
  } = options;

  const { user } = useAuth();
  const {
    fetchInvestments,
    fetchUsers,
    fetchSubCompanies,
    fetchSuperadminAnalytics,
    fetchAdminAnalytics,
    fetchInvestorAnalytics,
    fetchInvestorInvestments,
    fetchProfitLossRecords,
    state
  } = useData();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());

  // Refresh data based on user role
  const refreshData = useCallback(async () => {
    if (!user || !enabled) return;

    try {
      const now = new Date();
      
      // Common data for all roles
      await fetchInvestments(undefined, true);
      
      if (user.role?.id === 'superadmin') {
        // Superadmin gets all data
        await Promise.all([
          fetchSubCompanies(true),
          fetchUsers(undefined, true),
          fetchSuperadminAnalytics(true)
        ]);
      } else if (user.role?.id === 'admin' && user.subCompanyAdmin?.sub_company_id) {
        // Admin gets sub-company specific data
        const subCompanyId = user.subCompanyAdmin.sub_company_id;
        await Promise.all([
          fetchUsers({ subCompanyId }, true),
          fetchAdminAnalytics(subCompanyId, true),
          fetchInvestments({ subCompanyId }, true)
        ]);
      } else if (user.role?.id === 'investor') {
        // Investor gets their own data
        await Promise.all([
          fetchInvestorAnalytics(user.id, true),
          fetchInvestorInvestments(user.id, true),
          fetchProfitLossRecords(undefined, undefined)
        ]);
      }

      lastUpdateRef.current = now;
      
      // Trigger custom update callback
      if (onUpdate) {
        onUpdate({
          type: 'investment_updated',
          entityId: 'system',
          timestamp: now,
          data: { refreshed: true }
        });
      }
    } catch (error) {
      console.error('Failed to refresh real-time data:', error);
    }
  }, [
    user,
    enabled,
    onUpdate,
    fetchInvestments,
    fetchSubCompanies,
    fetchUsers,
    fetchSuperadminAnalytics,
    fetchAdminAnalytics,
    fetchInvestorAnalytics,
    fetchInvestorInvestments,
    fetchProfitLossRecords
  ]);

  // Start polling
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(refreshData, pollingInterval);
  }, [refreshData, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual refresh
  const manualRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Setup and cleanup
  useEffect(() => {
    if (enabled && user) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, user, startPolling, stopPolling]);

  // Handle visibility change (pause when tab is not active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (enabled && user) {
        startPolling();
        // Refresh immediately when tab becomes active
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, user, startPolling, stopPolling, refreshData]);

  return {
    lastUpdate: lastUpdateRef.current,
    isPolling: intervalRef.current !== null,
    manualRefresh,
    startPolling,
    stopPolling
  };
};

// Hook for specific entity updates
export const useEntityUpdates = (entityType: 'investment' | 'user' | 'company', entityId?: string) => {
  const { state } = useData();
  const lastUpdateRef = useRef<Date>(new Date());

  useEffect(() => {
    // Update timestamp when relevant data changes
    if (entityType === 'investment' && state.investments.length > 0) {
      lastUpdateRef.current = new Date();
    } else if (entityType === 'user' && state.users.length > 0) {
      lastUpdateRef.current = new Date();
    } else if (entityType === 'company' && state.subCompanies.length > 0) {
      lastUpdateRef.current = new Date();
    }
  }, [entityType, state.investments, state.users, state.subCompanies]);

  return {
    lastUpdate: lastUpdateRef.current,
    hasUpdates: true // Could be enhanced with more sophisticated change detection
  };
};

// Hook for cross-platform synchronization
export const useCrossPlatformSync = () => {
  const { user } = useAuth();
  const { state } = useData();

  // Simulate real-time events that would trigger updates across platforms
  const triggerUpdate = useCallback((updateType: RealTimeUpdate['type'], entityId: string, data: any) => {
    const update: RealTimeUpdate = {
      type: updateType,
      entityId,
      subCompanyId: user?.subCompanyAdmin?.sub_company_id,
      timestamp: new Date(),
      data
    };

    // In a real implementation, this would send the update to a WebSocket server
    // or message queue that would broadcast to all connected clients
    console.log('Cross-platform update triggered:', update);
    
    // For now, we'll use localStorage to simulate cross-tab communication
    localStorage.setItem('realtime_update', JSON.stringify(update));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'realtime_update',
      newValue: JSON.stringify(update)
    }));
  }, [user]);

  // Listen for cross-tab updates
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'realtime_update' && event.newValue) {
        try {
          const update: RealTimeUpdate = JSON.parse(event.newValue);
          console.log('Received cross-platform update:', update);
          
          // Trigger appropriate data refresh based on update type
          // This would be handled by the useRealTimeUpdates hook
        } catch (error) {
          console.error('Failed to parse real-time update:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    triggerUpdate,
    connectionStatus: 'connected' // Would be dynamic in real implementation
  };
};

export default useRealTimeUpdates;
