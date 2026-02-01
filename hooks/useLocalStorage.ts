
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

  // A promise queue to ensure write operations are serialized and don't conflict.
  const pushQueue = useRef(Promise.resolve());

  // Function to pull the latest data from the cloud.
  const pullFromCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(BASE_URL + key, { cache: 'no-cache' });
      if (response.status === 404) {
        setValueState(initialValue);
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        return;
      }
      if (response.ok) {
        const remoteData = await response.json();
        setValueState(remoteData);
        window.localStorage.setItem(key, JSON.stringify(remoteData));
      } else {
        console.warn(`Failed to pull from cloud for key "${key}". Status: ${response.status}`);
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
    const intervalId = setInterval(pullFromCloud, 7000); // Check for updates every 7 seconds
    return () => clearInterval(intervalId);
  }, [pullFromCloud]);


  // The main function to update state.
  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback((action) => {
    // 1. OPTIMISTIC UPDATE: Update local state immediately for a responsive UI.
    // We use the functional form of setState to get the most recent state value to apply the action to.
    let optimisticValue: T;
    setValueState(currentValue => {
        optimisticValue = action instanceof Function ? action(currentValue) : action;
        window.localStorage.setItem(key, JSON.stringify(optimisticValue));
        return optimisticValue;
    });

    // 2. QUEUE THE SYNC OPERATION: Chain the sync logic onto our promise queue.
    // This ensures that if setValue is called multiple times quickly, each save
    // happens sequentially, preventing race conditions.
    pushQueue.current = pushQueue.current.then(async () => {
        setIsSyncing(true);
        try {
            // READ: Fetch the latest state from the server.
            let serverState = initialValue;
            const response = await fetch(BASE_URL + key, { cache: 'no-cache' });
            if (response.ok) {
                serverState = await response.json();
            } else if (response.status !== 404) {
                 console.warn(`Could not read server state for key "${key}". Status: ${response.status}`);
            }

            const localState = optimisticValue;
            let dataToPush: T;
            
            // MERGE: Intelligently combine server data with local changes.
            // This logic works for arrays of objects that have an 'id' property, like our athletes.
            if (Array.isArray(serverState) && Array.isArray(localState)) {
                // Create maps for efficient lookups. Filter for items with IDs to be safe.
                const serverMap = new Map((serverState.filter(hasId)).map(item => [item.id, item]));
                const localMap = new Map((localState.filter(hasId)).map(item => [item.id, item]));
                // The merged map starts with all server data, then overwrites/adds local data.
                // This correctly merges additions/updates from multiple clients.
                const mergedMap = new Map([...serverMap, ...localMap]);
                dataToPush = Array.from(mergedMap.values()) as T;
            } else {
                // For other data types (like schedules), the latest local change takes precedence.
                dataToPush = localState;
            }

            // WRITE: Push the final, merged data back to the cloud.
            const writeResponse = await fetch(BASE_URL + key, {
                method: 'POST',
                ...FETCH_OPTIONS,
                body: JSON.stringify(dataToPush),
            });

            if (!writeResponse.ok) throw new Error(`Failed to save to cloud. Status: ${writeResponse.status}`);
            
            // RECONCILE: After a successful write, update local state with the merged data for consistency.
            setValueState(dataToPush);
            window.localStorage.setItem(key, JSON.stringify(dataToPush));

        } catch (error) {
            console.error(`Sync failed for key "${key}". Attempting to restore from server.`, error);
            // If anything goes wrong, pull from the server to get back to a known good state.
            await pullFromCloud();
        } finally {
            setIsSyncing(false);
        }
    });
  }, [key, initialValue, pullFromCloud]);

  return [value, setValue, isSyncing];
}
