'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import {
	PropertyService,
	MyPropertyStatsResponse,
} from '@/lib/api/propertyApi';
import { collaborationApi } from '@/lib/api/collaborationApi';
import searchAdApi from '@/lib/api/searchAdApi';
import { Collaboration } from '@/types/collaboration';
import { SearchAd } from '@/types/searchAd';
import { swrKeys } from '@/lib/swrKeys';

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
	// Fetch property stats using SWR
	const {
		data: stats,
		isLoading: loadingStats,
		error: statsError,
	} = useSWR<MyPropertyStatsResponse['data']>(
		swrKeys.properties.stats(currentUserId),
		() => PropertyService.getMyPropertyStats(),
		{
			revalidateOnFocus: false,
		},
	);

	// Fetch collaborations using SWR
	const { data: collabsRes, isLoading: loadingCollabs } = useSWR<{
		collaborations: Collaboration[];
	}>(
		swrKeys.collaborations.list(currentUserId),
		() => collaborationApi.getUserCollaborations(),
		{
			fallbackData: { collaborations: [] },
			revalidateOnFocus: false,
		},
	);

	// Fetch search ads using SWR
	const { data: searchAds, isLoading: loadingAds } = useSWR<SearchAd[]>(
		swrKeys.searchAds.myAds(currentUserId),
		() => searchAdApi.getMySearchAds().catch(() => []),
		{
			fallbackData: [],
			revalidateOnFocus: false,
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
			mySearches: searchAds?.length ?? 0,
		};
	}, [stats, collaborations, searchAds, currentUserId]);

	return { loading, error, stats, collaborations, searchAds, kpis };
};
