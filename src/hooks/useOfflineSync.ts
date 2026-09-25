import { useState, useEffect, useCallback } from 'react';
import { getPendingSyncQueue, clearSyncQueue } from '../utils/offlineStorage';

export interface OfflineSyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncNow: () => Promise<number>;
  refreshPendingCount: () => Promise<number>;
}

export const useOfflineSync = (onSyncSuccess?: (syncedCount: number) => void): OfflineSyncState => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const refreshPendingCount = useCallback(async (): Promise<number> => {
    try {
      const queue = await getPendingSyncQueue();
      setPendingCount(queue.length);
      return queue.length;
    } catch {
      return 0;
    }
  }, []);

  const syncNow = useCallback(async (): Promise<number> => {
    setIsSyncing(true);
    try {
      // Simulate industrial network latency with SAP / ERP Central
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const cleared = await clearSyncQueue();
      setPendingCount(0);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (cleared > 0 && onSyncSuccess) {
        onSyncSuccess(cleared);
      }
      return cleared;
    } catch (err) {
      console.warn('Error durante la sincronización:', err);
      return 0;
    } finally {
      setIsSyncing(false);
    }
  }, [onSyncSuccess]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      // Automatically attempt sync when recovering connection
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount, syncNow]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncNow,
    refreshPendingCount
  };
};
