'use client';
import useSWR from 'swr';
import { adminService } from '@/lib/api/adminApi';
import { swrKeys } from '@/lib/swrKeys';

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
	const {
		data: stats,
		isLoading: loading,
		error,
		mutate,
	} = useSWR<AdminStats>(
		swrKeys.admin.stats,
		async () => {
			const res = await adminService.getStats();
			return res.data as AdminStats;
		},
		{
			revalidateOnFocus: false,
		},
	);

	return {
		stats: stats ?? null,
		loading,
		error: error?.message ?? null,
		refetch: mutate,
	};
}
