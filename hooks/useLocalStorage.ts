
import React, { useState, useEffect, useCallback } from 'react';

// Bucket único para o projeto para persistência em nuvem
const CLOUD_BUCKET = 'rogi_mirim_v1_storage_unique';
const BASE_URL = `https://kvdb.io/A2V2mR2Y5f5T6X8f9A4b/${CLOUD_BUCKET}_`;

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [isSyncing, setIsSyncing] = useState(true); // Start with syncing true
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const syncWithCloud = useCallback(async () => {
    if (!isSyncing) setIsSyncing(true);
    try {
      const response = await fetch(BASE_URL + key);
      if (response.ok) {
        const remoteData = await response.json();
        
        setStoredValue(currentLocalData => {
            let finalData;
            if (Array.isArray(remoteData) && Array.isArray(currentLocalData)) {
              // Merge based on ID. Remote data overwrites local on conflict.
              const localMap = new Map((currentLocalData as any[]).map(item => [item.id, item]));
              const remoteMap = new Map((remoteData as any[]).map(item => [item.id, item]));
              const mergedMap = new Map([...localMap, ...remoteMap]);
              finalData = Array.from(mergedMap.values());
            } else {
              // For non-arrays, remote data wins.
              finalData = remoteData;
            }
            window.localStorage.setItem(key, JSON.stringify(finalData));
            return finalData as T;
        });
      }
    } catch (error) {
      console.warn(`Could not sync ${key} from cloud:`, error);
    } finally {
      setIsSyncing(false);
    }
  }, [key]);

  // Initial sync and periodic sync
  useEffect(() => {
    syncWithCloud(); // Initial sync
    const intervalId = setInterval(syncWithCloud, 10000); // Sync every 10 seconds
    return () => clearInterval(intervalId);
  }, [syncWithCloud]);

  const setValue: React.Dispatch<React.SetStateAction<T>> = async (value) => {
    // Determine the next state value
    const newLocalValue = value instanceof Function ? value(storedValue) : value;
    
    // Optimistic local update for UI responsiveness
    setStoredValue(newLocalValue);
    window.localStorage.setItem(key, JSON.stringify(newLocalValue));

    // Perform a robust read-modify-write to the cloud
    setIsSyncing(true);
    try {
      // 1. Read the latest state from the cloud
      const response = await fetch(BASE_URL + key);
      const remoteData = response.ok ? await response.json() : (Array.isArray(initialValue) ? [] : initialValue);

      // 2. Merge local changes with the latest cloud state
      let dataToPush;
      if (Array.isArray(newLocalValue) && Array.isArray(remoteData)) {
        const remoteMap = new Map((remoteData as any[]).map(item => [item.id, item]));
        const localMap = new Map((newLocalValue as any[]).map(item => [item.id, item]));
        
        // Combine maps, with local changes taking precedence for items with the same ID
        const mergedMap = new Map([...remoteMap, ...localMap]);
        dataToPush = Array.from(mergedMap.values());
      } else {
        // For non-array data (like schedules), local change wins
        dataToPush = newLocalValue;
      }
      
      // 3. Write the fully merged data back to the cloud
      await fetch(BASE_URL + key, {
        method: 'POST',
        body: JSON.stringify(dataToPush),
      });

      // 4. (Optional but good practice) Update local state with the final pushed data
      // This ensures consistency if the merge logic produced a different result
      setStoredValue(dataToPush as T);
      window.localStorage.setItem(key, JSON.stringify(dataToPush));

    } catch (error)
     {
      console.error(`Could not save ${key} to cloud:`, error);
      // In case of error, re-sync to get the last good state
      syncWithCloud();
    } finally {
      setIsSyncing(false);
    }
  };

  return [storedValue, setValue, isSyncing];
}
