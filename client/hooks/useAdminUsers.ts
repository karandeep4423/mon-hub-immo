import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api'; // Import the shared api instance
import { logger } from '@/lib/utils/logger';

interface Filters {
  name?: string;
  userType?: string;
  network?: string;
  isValidated?: string;
  isBlocked?: string;
}

export function useAdminUsers(filters: Filters) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
      // Replace fetch with the api instance
      const res = await api.get(`/admin/users?${params.toString()}`, {
        signal,
      });

      // The interceptor handles non-ok responses, so we can expect data
      const data = res.data;
      
      // API may return either an array or an object { users: [...] }
      const payload = Array.isArray(data) ? data : (data?.users || data?.usersList || data || []);
      setUsers(payload);
    } catch (err) {
      const anyErr = err as any;
      const isAbort = anyErr?.name === 'AbortError' || anyErr?.name === 'CanceledError' || anyErr?.code === 'ERR_CANCELED' || anyErr?.message === 'canceled';
      if (isAbort) {
        logger.debug('[useAdminUsers] request cancelled');
      } else if (err instanceof Error) {
        logger.error('[useAdminUsers] fetch error', err);
        setError(err.message);
      } else {
        logger.error('[useAdminUsers] unknown fetch error', err);
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchUsers]);


  const refetch = useCallback(async () => {
    const controller = new AbortController();
    await fetchUsers(controller.signal);
  }, [fetchUsers]);

  return { users, loading, error, refetch };
}