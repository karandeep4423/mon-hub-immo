'use client';

import { useMemo } from 'react';
import {
	PropertyService,
	MyPropertyStatsResponse,
} from '@/lib/api/propertyApi';
import { collaborationApi } from '@/lib/api/collaborationApi';
import searchAdApi from '@/lib/api/searchAdApi';
import { Collaboration } from '@/types/collaboration';
import { SearchAd } from '@/types/searchAd';
import { useFetch } from '@/hooks/useFetch';

export interface DashboardKpis {
	propertiesTotal: number;
	propertiesActive: number;
	totalValue: number;
	requestsPending: number; // Demandes
	collaborationsTotal: number;
	collaborationsActive: number;
	mySearches: number;
}

export const useDashboardStats = (currentUserId?: string) => {
	// Fetch property stats using useFetch
	const {
		data: stats,
		loading: loadingStats,
		error: statsError,
	} = useFetch<MyPropertyStatsResponse['data']>(
		() => PropertyService.getMyPropertyStats(),
		{
			showErrorToast: false,
			deps: [currentUserId],
		},
	);

	// Fetch collaborations using useFetch
	const { data: collabsRes, loading: loadingCollabs } = useFetch<{
		collaborations: Collaboration[];
	}>(() => collaborationApi.getUserCollaborations(), {
		initialData: { collaborations: [] },
		showErrorToast: false,
		deps: [currentUserId],
	});

	// Fetch search ads using useFetch
	const { data: searchAds = [], loading: loadingAds } = useFetch<SearchAd[]>(
		() => searchAdApi.getMySearchAds().catch(() => []),
		{
			initialData: [],
			showErrorToast: false,
			deps: [currentUserId],
		},
	);

	const collaborations = useMemo(
		() => collabsRes?.collaborations || [],
		[collabsRes],
	);
	const loading = loadingStats || loadingCollabs || loadingAds;
	const error = statsError?.message;

	const kpis: DashboardKpis = useMemo(() => {
		const total = stats?.totalProperties ?? 0;
		const byStatus = stats?.byStatus ?? [];
		const activeCount =
			byStatus.find((s) => s._id === 'active')?.count ?? 0;
		const totalValue = stats?.totalValue ?? 0;
		const pendingRequests = collaborations.filter(
			(c) =>
				c.status === 'pending' &&
				typeof c.postOwnerId !== 'string' &&
				c.postOwnerId?._id === currentUserId,
		).length;
		const activeCollabs = collaborations.filter(
			(c) => c.status === 'active',
		).length;
		return {
			propertiesTotal: total,
			propertiesActive: activeCount,
			totalValue,
			requestsPending: pendingRequests,
			collaborationsTotal: collaborations.length,
			collaborationsActive: activeCollabs,
			mySearches: searchAds.length,
		};
	}, [stats, collaborations, searchAds.length, currentUserId]);

	return { loading, error, stats, collaborations, searchAds, kpis };
};
