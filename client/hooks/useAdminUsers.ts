import { useState, useEffect, useCallback } from 'react';

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

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(filters || {}).forEach(([key, value]) => {
          if (value) params.append(key, value as string);
        });
        const res = await fetch(`http://localhost:4000/api/admin/users?${params.toString()}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          setUsers(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('[useAdminUsers] fetch error', err);
          if (isMounted) {
            setError(err.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [JSON.stringify(filters)]);

  const refetch = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value) params.append(key, value as string);
      });
      const res = await fetch(`http://localhost:4000/api/admin/users?${params.toString()}`, {
        credentials: 'include',
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('[useAdminUsers] refetch error', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  return { users, loading, error, refetch };
}