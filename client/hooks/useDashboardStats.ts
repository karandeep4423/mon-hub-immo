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
import { useAuthStore } from '@/store/authStore';
import { canAccessProtectedResources } from '@/lib/utils/authUtils';

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
	// Check if user can access protected resources
	const user = useAuthStore((state) => state.user);
	const canAccess = canAccessProtectedResources(user);

	// Fetch property stats using SWR - only if user can access
	const {
		data: stats,
		isLoading: loadingStats,
		error: statsError,
	} = useSWR<MyPropertyStatsResponse['data']>(
		canAccess ? swrKeys.properties.stats(currentUserId) : null,
		() => PropertyService.getMyPropertyStats(),
		{
			revalidateOnFocus: false,
		},
	);

	// Fetch collaborations using SWR - only if user can access
	const { data: collabsRes, isLoading: loadingCollabs } = useSWR<{
		collaborations: Collaboration[];
	}>(
		canAccess ? swrKeys.collaborations.list(currentUserId) : null,
		() => collaborationApi.getUserCollaborations(),
		{
			fallbackData: { collaborations: [] },
			revalidateOnFocus: false,
		},
	);

	// Fetch search ads using SWR - only if user can access
	const { data: searchAds, isLoading: loadingAds } = useSWR<SearchAd[]>(
		canAccess ? swrKeys.searchAds.myAds(currentUserId) : null,
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
