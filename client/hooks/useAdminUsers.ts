import { useState, useEffect } from 'react';

interface Filters {
  name?: string;
  userType?: string;
  network?: string;
  isValidated?: string;
}

export function useAdminUsers(filters: Filters) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    fetch(`http://localhost:4000/api/admin/users?${params.toString()}`, {
    credentials: 'include',
    })
    .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
    })
    .then(data => setUsers(data))
    .catch(console.error)
    .finally(() => setLoading(false));
    }, [filters]);

  return { users, loading };
}
