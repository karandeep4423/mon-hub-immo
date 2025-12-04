'use client';
import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/adminApi';

export interface TopItem {
	name: string;
	count: number;
}

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

		adminService
			.getStats()
			.then((res) => {
				if (!mounted) return;
				setStats(res.data as AdminStats);
			})
			.catch((err) => {
				if (!mounted) return;
				setError(String(err.message || err));
			})
			.finally(() => {
				if (!mounted) return;
				setLoading(false);
			});

		return () => {
			mounted = false;
		};
	}, []);

	return { stats, loading, error };
}
