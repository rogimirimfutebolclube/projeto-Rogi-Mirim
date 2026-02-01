
import React, { useState, useEffect, useCallback, useRef } from 'react';

// Bucket único para o projeto para persistência em nuvem
const CLOUD_BUCKET = 'rogi_mirim_v1_storage_unique';
const BASE_URL = `https://kvdb.io/A2V2mR2Y5f5T6X8f9A4b/${CLOUD_BUCKET}_`;

const FETCH_OPTIONS = {
  cache: 'no-cache' as RequestCache,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to check if an object has an 'id' property
function hasId(obj: any): obj is { id: string } {
    return obj && typeof obj.id === 'string';
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [isSyncing, setIsSyncing] = useState(true);
  const [value, setValueState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const syncLock = useRef(false);

  // Fetches from the cloud and overwrites local state.
  const pullFromCloud = useCallback(async () => {
    if (syncLock.current) return; // Don't pull if a push is in progress.

    setIsSyncing(true);
    try {
      const response = await fetch(BASE_URL + key, { cache: 'no-cache' });
      if (response.status === 404) {
        // If the key doesn't exist on the server, create it with the initial value.
        await fetch(BASE_URL + key, {
          method: 'POST',
          ...FETCH_OPTIONS,
          body: JSON.stringify(initialValue),
        });
        setValueState(initialValue);
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return;
      }
      if (response.ok) {
        const remoteData = await response.json();
        setValueState(remoteData);
        window.localStorage.setItem(key, JSON.stringify(remoteData));
      } else {
        console.warn(`Failed to sync from cloud. Status: ${response.status}`);
      }
    } catch (error) {
      console.warn(`Could not sync ${key} from cloud:`, error);
    } finally {
      setIsSyncing(false);
    }
  }, [key, initialValue]);

  // Effect for initial load and periodic polling for updates from other devices.
  useEffect(() => {
    pullFromCloud();
    const intervalId = setInterval(pullFromCloud, 5000); // Check for updates every 5 seconds
    return () => clearInterval(intervalId);
  }, [pullFromCloud]);


  // The main function to update state, performing an optimistic update and then syncing.
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(async (action) => {
    // 1. OPTIMISTIC UPDATE: Update local state immediately for a responsive UI.
    const optimisticValue = action instanceof Function ? action(value) : action;
    setValueState(optimisticValue);
    window.localStorage.setItem(key, JSON.stringify(optimisticValue));

    if (syncLock.current) {
        console.warn("Sync already in progress. Your change is saved locally and will be synced shortly.");
        return;
    }
    syncLock.current = true;
    setIsSyncing(true);

    try {
        // 2. READ: Fetch the latest state from the server.
        let serverState = initialValue;
        try {
            const response = await fetch(BASE_URL + key, { cache: 'no-cache' });
            if (response.ok) serverState = await response.json();
        } catch (e) {
            console.error("Could not read from server before writing. Proceeding with local data, which may overwrite.", e);
        }

        // 3. MERGE: Intelligently combine server data with local changes.
        let dataToPush: T;
        const localData = optimisticValue;

        // If data is an array of items with IDs (like athletes), merge them.
        if (Array.isArray(serverState) && Array.isArray(localData) && localData.length > 0 && hasId(localData[0])) {
            const serverMap = new Map( (serverState as {id: string}[]).map(item => [item.id, item]) );
            const localMap = new Map( (localData as {id: string}[]).map(item => [item.id, item]) );
            const mergedMap = new Map([...serverMap, ...localMap]);
            dataToPush = Array.from(mergedMap.values()) as T;
        } else {
            // For other data types (like schedules), the latest local change takes precedence.
            dataToPush = localData;
        }

        // 4. WRITE: Push the final, merged data back to the cloud.
        const writeResponse = await fetch(BASE_URL + key, {
            method: 'POST',
            ...FETCH_OPTIONS,
            body: JSON.stringify(dataToPush),
        });

        if (!writeResponse.ok) throw new Error(`Failed to save to cloud. Status: ${writeResponse.status}`);

        // 5. RECONCILE: After a successful write, update local state with the merged data for consistency.
        setValueState(dataToPush);
        window.localStorage.setItem(key, JSON.stringify(dataToPush));

    } catch (error) {
        console.error(`Synchronization failed for key "${key}". The app will try to sync again.`, error);
    } finally {
        syncLock.current = false;
        setIsSyncing(false);
    }
  }, [key, initialValue, value, pullFromCloud]);

  return [value, setValue, isSyncing];
}
