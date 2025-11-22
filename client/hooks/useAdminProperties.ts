import { useState, useEffect } from 'react';
import { api } from '@/lib/api'; // Import the shared api instance
import { logger } from '@/lib/utils/logger';

// Adapte cette interface à ton backend
interface Property {
  _id: string;
  title: string;
  price: number;
  surface: number;
  propertyType: string;
  status: string;
  city: string;
  owner?: { _id:string; firstName?: string; lastName?: string; network?: string };
  createdAt: string;
}

interface Filters {
  search?: string;
  status?: string;
  agentId?: string;
  network?: string;
  page?: number;
  limit?: number;
  propertyType?: string;
}
export function useAdminProperties(filters: Filters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(filters.page || 1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = () => setRefetchIndex(prev => prev + 1);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProperties = async () => {
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

        try {
            // Admin should use the admin endpoint which supports filtering by status, types, etc.
            const response = await api.get(`/admin/properties?${params.toString()}`, {
                signal: controller.signal,
            });
            const data = response.data;
            
            logger.debug("API properties:", data.data?.properties?.[0]);
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
        } catch (err) {
          // Detect Abort / Axios cancellation and ignore as expected
          const anyErr = err as any;
          const isAbort = anyErr?.name === 'AbortError' || anyErr?.name === 'CanceledError' || anyErr?.code === 'ERR_CANCELED' || anyErr?.message === 'canceled';
          if (isAbort) {
            // Request was cancelled due to component unmount or rapid successive calls - ignore
            logger.debug('[useAdminProperties] request cancelled');
          } else if (err instanceof Error) {
            logger.error('[useAdminProperties] fetch error', err);
            setError(err.message);
          } else {
            logger.error('[useAdminProperties] fetch unknown error', err);
            setError(String(err));
          }
        } finally {
            setLoading(false);
        }
    };

    fetchProperties();

    return () => {
        controller.abort();
    };
  }, [JSON.stringify(filters), refetchIndex]);

  return { properties, loading, error, totalItems, currentPage, totalPages, refetch };
}
