
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

  const isWriting = useRef(false);

  const syncWithCloud = useCallback(async () => {
    if (isWriting.current) return;

    setIsSyncing(true);
    try {
      const response = await fetch(BASE_URL + key, { cache: 'no-cache' });
      if (response.status === 404) {
        return; // Key doesn't exist yet, do nothing.
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
  }, [key]);

  useEffect(() => {
    syncWithCloud();
    const intervalId = setInterval(syncWithCloud, 7000);
    return () => clearInterval(intervalId);
  }, [syncWithCloud]);

  const setValue: React.Dispatch<React.SetStateAction<T>> = useCallback(async (action) => {
    if (isWriting.current) {
        console.warn("Write operation already in progress. New action ignored.");
        return;
    }
    
    isWriting.current = true;
    setIsSyncing(true);

    try {
        // 1. READ the latest state from the cloud to avoid overwriting recent changes.
        let currentStateOnServer = initialValue;
        try {
            const response = await fetch(BASE_URL + key, { cache: 'no-cache' });
            if (response.ok) {
                currentStateOnServer = await response.json();
            } else if (response.status !== 404) {
                 throw new Error(`Failed to read from cloud. Status: ${response.status}`);
            }
        } catch(e) {
            console.error("Critical: Could not read from cloud before writing. Aborting write.", e);
            await syncWithCloud(); 
            return;
        }

        // 2. MODIFY: Apply the state change to the data we just fetched.
        const newValue = action instanceof Function ? action(currentStateOnServer) : action;

        // 3. WRITE the new state back to the cloud.
        const writeResponse = await fetch(BASE_URL + key, {
            method: 'POST',
            ...FETCH_OPTIONS,
            body: JSON.stringify(newValue),
        });

        if (!writeResponse.ok) {
            throw new Error(`Failed to save to cloud. Status: ${writeResponse.status}`);
        }

        // 4. COMMIT: Update local state only AFTER successful cloud write.
        setValueState(newValue);
        window.localStorage.setItem(key, JSON.stringify(newValue));
        
    } catch (error) {
        console.error(`Failed to update value for key "${key}". Re-syncing with server.`, error);
        await syncWithCloud();
    } finally {
        isWriting.current = false;
        setIsSyncing(false);
    }
  }, [key, initialValue, syncWithCloud]);

  return [value, setValue, isSyncing];
}
