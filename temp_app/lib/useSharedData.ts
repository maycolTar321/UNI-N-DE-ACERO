import { useState, useEffect } from 'react';

const cache: Record<string, any> = {};
const listeners: Record<string, Set<() => void>> = {};

function notify(key: string) {
  if (listeners[key]) {
    listeners[key].forEach(fn => fn());
  }
}

export function mutateData(key: string, data: any) {
  cache[key] = data;
  notify(key);
}

export function getCachedData(key: string) {
  return cache[key];
}

export function useSharedData<T>(key: string, fetcher: () => Promise<T>, initialData?: T) {
  const [data, setData] = useState<T | null>(cache[key] !== undefined ? cache[key] : (initialData || null));
  const [loading, setLoading] = useState(cache[key] === undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!listeners[key]) listeners[key] = new Set();
    
    const update = () => {
      if (mounted) {
        setData(cache[key]);
      }
    };
    
    listeners[key].add(update);

    const load = async () => {
      try {
        if (cache[key] === undefined) {
          setLoading(true);
          console.log("[useSharedData] loading = true for", key);
        }
        console.log("[useSharedData] fetching...", key);
        const res = await fetcher();
        console.log("[useSharedData] fetched!", key, res);
        if (mounted) {
          cache[key] = res;
          setData(res);
          setError(null);
          notify(key);
        }
      } catch (e: any) {
        console.error("[useSharedData] Error fetching", key, e);
        if (mounted) {
          setError(e.message || "Error al cargar los datos");
          // No sobreescribir el caché si hay error, para mantener optimistic data
        }
      } finally {
        if (mounted) {
          setLoading(false);
          console.log("[useSharedData] loading = false for", key);
        } else {
          console.log("[useSharedData] UNMOUNTED before finish for", key);
        }
      }
    };

    load();

    return () => {
      mounted = false;
      listeners[key].delete(update);
    };
  }, [key]); // Fetcher is excluded to avoid infinite loops if defined inline

  const mutate = (newData: T | ((prev: T | null) => T)) => {
    const updated = typeof newData === 'function' ? (newData as Function)(cache[key]) : newData;
    mutateData(key, updated);
  };

  return { data, loading, error, mutate };
}
