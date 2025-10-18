'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	PropertyService,
	MyPropertyStatsResponse,
} from '@/lib/api/propertyApi';
import { collaborationApi } from '@/lib/api/collaborationApi';
import searchAdApi from '@/lib/api/searchAdApi';
import { Collaboration } from '@/types/collaboration';
import { SearchAd } from '@/types/searchAd';

export interface DashboardKpis {
	propertiesTotal: number;
	propertiesActive: number;
	totalValue: number;
	requestsPending: number; // Demandes
	collaborationsTotal: number;
	collaborationsActive: number;
	mySearches: number;
}

interface State {
	loading: boolean;
	error?: string;
	stats?: MyPropertyStatsResponse['data'];
	collaborations: Collaboration[];
	searchAds: SearchAd[];
}

export const useDashboardStats = (currentUserId?: string) => {
	const [state, setState] = useState<State>({
		loading: true,
		collaborations: [],
		searchAds: [],
	});

	useEffect(() => {
		let mounted = true;
		const run = async () => {
			setState((s) => ({ ...s, loading: true, error: undefined }));
			try {
				const [propStats, collabsRes, myAds] = await Promise.all([
					PropertyService.getMyPropertyStats(),
					collaborationApi.getUserCollaborations(),
					searchAdApi.getMySearchAds().catch(() => []),
				]);
				if (!mounted) return;
				setState({
					loading: false,
					stats: propStats,
					collaborations: collabsRes.collaborations,
					searchAds: myAds,
				});
			} catch {
				if (!mounted) return;
				setState((s) => ({
					...s,
					loading: false,
					error: 'Impossible de charger les statistiques',
				}));
			}
		};
		run();
		return () => {
			mounted = false;
		};
	}, [currentUserId]);

	const kpis: DashboardKpis = useMemo(() => {
		const total = state.stats?.totalProperties ?? 0;
		const byStatus = state.stats?.byStatus ?? [];
		const activeCount =
			byStatus.find((s) => s._id === 'active')?.count ?? 0;
		const totalValue = state.stats?.totalValue ?? 0;
		const pendingRequests = state.collaborations.filter(
			(c) =>
				c.status === 'pending' &&
				typeof c.propertyOwnerId !== 'string' &&
				c.propertyOwnerId?._id === currentUserId,
		).length;
		const activeCollabs = state.collaborations.filter(
			(c) => c.status === 'active',
		).length;
		return {
			propertiesTotal: total,
			propertiesActive: activeCount,
			totalValue,
			requestsPending: pendingRequests,
			collaborationsTotal: state.collaborations.length,
			collaborationsActive: activeCollabs,
			mySearches: state.searchAds.length,
		};
	}, [state, currentUserId]);

	return { ...state, kpis };
};
