
import React, { useState, useEffect, useCallback, useRef } from 'react';

// Bucket único para o projeto para persistência em nuvem
const CLOUD_BUCKET = 'rogi_mirim_v1_storage_unique';
const BASE_URL = `https://kvdb.io/A2V2mR2Y5f5T6X8f9A4b/${CLOUD_BUCKET}_`;

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

  // Ref to prevent race conditions during write operations from the same client
  const isWriting = useRef(false);

  const syncWithCloud = useCallback(async () => {
    // Don't sync if a write operation from this client is in progress
    if (isWriting.current) return;

    if(!isSyncing) setIsSyncing(true);
    try {
      const response = await fetch(BASE_URL + key);
      // If the key doesn't exist, it's likely the first time this app is run.
      // We do nothing and wait for the first write to create it.
      if (response.status === 404) {
        console.log(`Key ${key} not found in cloud. Awaiting first write.`);
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
  }, [key, isSyncing]);

  // Initial sync and periodic sync to get updates from other clients
  useEffect(() => {
    syncWithCloud();
    const intervalId = setInterval(syncWithCloud, 7000); // Poll for changes every 7 seconds
    return () => clearInterval(intervalId);
  }, [syncWithCloud]);

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(async (action) => {
    // Prevent multiple writes from firing at once from this client
    if (isWriting.current) {
        console.warn("Write operation already in progress, skipping.");
        return;
    }
    
    isWriting.current = true;
    setIsSyncing(true);
    
    // Perform an optimistic update for a snappy UI response
    const locallyUpdatedValue = action instanceof Function ? action(value) : action;
    setValueState(locallyUpdatedValue);
    
    try {
        // --- Atomic Read-Modify-Write Cycle ---
        
        // 1. READ the latest data from the cloud to avoid overwriting recent changes.
        let serverData = initialValue;
        try {
            const response = await fetch(BASE_URL + key);
            if (response.ok) {
                serverData = await response.json();
            }
        } catch(e) {
            console.warn("Could not read from cloud before writing. This might cause data loss if another client wrote data recently.");
            // Fallback to the state before our optimistic update
            serverData = value; 
        }
        
        // 2. MODIFY the fresh server data with the intended local change.
        const dataToPush = action instanceof Function ? action(serverData) : action;

        // 3. WRITE the new, correctly merged data back to the cloud.
        const writeResponse = await fetch(BASE_URL + key, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToPush),
        });

        if (!writeResponse.ok) {
            throw new Error(`Failed to save to cloud. Status: ${writeResponse.status}`);
        }
        
        // 4. Finalize local state with the data that was successfully pushed to the cloud.
        setValueState(dataToPush);
        window.localStorage.setItem(key, JSON.stringify(dataToPush));

    } catch (error) {
        console.error(`Could not save ${key} to cloud. Re-syncing with server.`, error);
        // On failure, force a sync to get the last known good state from the server.
        await syncWithCloud();
    } finally {
        isWriting.current = false;
        setIsSyncing(false);
    }
  }, [key, initialValue, value, syncWithCloud]);

  return [value, setValue, isSyncing];
}
