"use client";
import { useState, useEffect } from 'react';

export interface TopItem { name: string; count: number }

export interface AdminStats {
  agentsTotal: number;
  agentsActive: number;
  agentsPending: number;
  agentsUnsubscribed: number;
  apporteursTotal: number;
  apporteursActive: number;
  apporteursPending: number;
  propertiesActive: number;
  propertiesArchived: number;
  propertiesInCollab: number;
  collabOpen: number;
  collabClosed: number;
  feesTotal: number;
  topNetworks: TopItem[];
  topRegions: TopItem[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const API_ROOT = (() => {
      const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
    })();
    fetch(`${API_ROOT}/api/admin/stats`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setStats(data as AdminStats);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err.message || err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => { mounted = false };
  }, []);

  return { stats, loading, error };
}
