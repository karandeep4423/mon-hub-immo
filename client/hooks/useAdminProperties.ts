import { useState, useEffect } from 'react';

// Adapte cette interface à ton backend
interface Property {
  _id: string;
  title: string;
  price: number;
  surface: number;
  propertyType: string;
  status: string;
  city: string;
  owner?: { _id: string; firstName?: string; lastName?: string; network?: string };
  createdAt: string;
}

interface Filters {
  search?: string;
  status?: string;
  agentId?: string;
  network?: string;
  page?: number;
  limit?: number;
}
export function useAdminProperties(filters: Filters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(filters.page || 1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).length > 0) params.append(key, String(value));
    });
    // apply pagination defaults
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    params.set('page', String(page));
    params.set('limit', String(limit));

    // Admin should use the admin endpoint which supports filtering by status, types, etc.
    fetch(`http://localhost:4000/api/admin/properties?${params.toString()}`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        console.log("API properties:", data.data?.properties?.[0]);
        setProperties(
          (data.data?.properties || []).map((p: any) => ({
            transactionType: p.transactionType ?? '',
            ...p
          }))
        );
        // set pagination info if available
        const pagination = data.data?.pagination;
        if (pagination) {
          setTotalItems(pagination.totalItems || 0);
          setCurrentPage(pagination.currentPage || page);
          setTotalPages(pagination.totalPages || 1);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('[useAdminProperties] fetch error', err);
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false };
  }, [JSON.stringify(filters)]);

  return { properties, loading, error, totalItems, currentPage, totalPages };
}
