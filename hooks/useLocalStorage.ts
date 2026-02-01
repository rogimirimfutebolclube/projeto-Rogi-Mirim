
import React, { useState, useEffect, useCallback } from 'react';

// Bucket único para o projeto para persistência em nuvem
const CLOUD_BUCKET = 'rogi_mirim_v1_storage_unique';
const BASE_URL = `https://kvdb.io/A2V2mR2Y5f5T6X8f9A4b/${CLOUD_BUCKET}_`;

// Added React import to solve "Cannot find namespace 'React'" errors on line 8 and 55
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [isSyncing, setIsSyncing] = useState(false);
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Função para buscar dados da nuvem
  const fetchRemoteData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(BASE_URL + key);
      if (response.ok) {
        const remoteValue = await response.json();
        
        // Lógica de mesclagem para arrays (atletas)
        if (Array.isArray(remoteValue) && Array.isArray(storedValue)) {
          const merged = [...remoteValue];
          (storedValue as any[]).forEach(localItem => {
            if (!merged.find(m => m.id === localItem.id)) {
              merged.push(localItem);
            }
          });
          setStoredValue(merged as unknown as T);
          window.localStorage.setItem(key, JSON.stringify(merged));
        } else {
          // Para objetos (como horários), o remoto tem precedência se for novo
          setStoredValue(remoteValue);
          window.localStorage.setItem(key, JSON.stringify(remoteValue));
        }
      }
    } catch (error) {
      console.warn("Erro ao sincronizar com a nuvem:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [key]);

  // Sincroniza ao montar o componente
  useEffect(() => {
    fetchRemoteData();
  }, [fetchRemoteData]);

  // Added React import to solve "Cannot find namespace 'React'" errors on line 8 and 55
  const setValue: React.Dispatch<React.SetStateAction<T>> = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Atualiza estado local e localStorage imediatamente
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Envia para a nuvem em background
      setIsSyncing(true);
      await fetch(BASE_URL + key, {
        method: 'POST',
        body: JSON.stringify(valueToStore),
      });
    } catch (error) {
      console.error("Erro ao salvar na nuvem:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return [storedValue, setValue, isSyncing];
}
