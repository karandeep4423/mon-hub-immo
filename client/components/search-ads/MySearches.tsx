'use client';

import { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAdCard } from './SearchAdCard';
import { Button, Pagination } from '../ui';
import { useRouter } from 'next/navigation';
import { swrKeys } from '@/lib/swrKeys';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '../ui/LoadingSpinner';
import { Features } from '@/lib/constants';
import { usePageState } from '@/hooks/usePageState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { SearchFilters, SearchFiltersState } from './SearchFilters';

const initialFilters: SearchFiltersState = {
	searchTerm: '',
	statusFilter: 'all',
	propertyTypeFilter: 'all',
};

export const MySearches = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [currentPage, setCurrentPage] = useState(1);
	const [filters, setFilters] = useState<SearchFiltersState>(initialFilters);
	const itemsPerPage = 6;

	// Persist pagination and scroll
	const {
		key: pageKey,
		savedState,
		save,
		urlOverrides,
	} = usePageState({
		key: 'my-searches',
		getCurrentState: () => ({ currentPage }),
	});

	useEffect(() => {
		if (typeof urlOverrides.currentPage === 'number') {
			setCurrentPage(urlOverrides.currentPage);
		} else if (typeof savedState?.currentPage === 'number') {
			setCurrentPage(savedState.currentPage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		save({ currentPage });
	}, [currentPage, save]);

	// Fetch user's search ads using SWR
	const {
		data: myAds,
		isLoading: loading,
		error,
		mutate: refreshAds,
	} = useSWR(
		swrKeys.searchAds.myAds(user?._id),
		() => searchAdApi.getMySearchAds(),
		{
			fallbackData: [],
		},
	);

	// Scroll restoration (window scroll)
	useScrollRestoration({
		key: pageKey,
		ready: !loading,
	});

	// Filter search ads
	const filteredAds = useMemo(() => {
		if (!myAds) return [];

		return myAds.filter((ad) => {
			// Search term filter (search in cities, title would be in ad itself)
			if (filters.searchTerm) {
				const searchLower = filters.searchTerm.toLowerCase();
				const citiesMatch =
					ad.location?.cities?.some((city) =>
						city.toLowerCase().includes(searchLower),
					) || false;
				const descriptionMatch = ad.description
					?.toLowerCase()
					.includes(searchLower);
				if (!citiesMatch && !descriptionMatch) return false;
			}

			// Status filter
			if (
				filters.statusFilter !== 'all' &&
				ad.status !== filters.statusFilter
			) {
				return false;
			}

			// Property type filter
			if (
				filters.propertyTypeFilter !== 'all' &&
				!ad.propertyTypes.includes(
					filters.propertyTypeFilter as
						| 'house'
						| 'apartment'
						| 'land'
						| 'building'
						| 'commercial',
				)
			) {
				return false;
			}

			return true;
		});
	}, [myAds, filters]);

	// Paginated search ads
	const paginatedAds = useMemo(() => {
		if (!filteredAds) return [];
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredAds.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredAds, currentPage, itemsPerPage]);

	// Reset pagination when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [filters]);

	const hasActiveFilters =
		filters.searchTerm !== '' ||
		filters.statusFilter !== 'all' ||
		filters.propertyTypeFilter !== 'all';

	const handleResetFilters = () => {
		setFilters(initialFilters);
		setCurrentPage(1);
	};

	if (loading) {
		return <PageLoader message="Chargement de vos recherches..." />;
	}

	if (error) {
		return <div className="text-red-500">{error.message}</div>;
	}

	return (
		<div className="space-y-6" id="searches-section">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-900">
					Mes Recherches
				</h2>
				<Button
					onClick={() =>
						router.push(Features.SearchAds.SEARCH_AD_ROUTES.CREATE)
					}
				>
					Créer une recherche
				</Button>
			</div>

			{/* Filters */}
			{myAds && myAds.length > 0 && (
				<SearchFilters
					filters={filters}
					onFiltersChange={setFilters}
					onReset={handleResetFilters}
					hasActiveFilters={hasActiveFilters}
					resultsCount={filteredAds.length}
					totalCount={myAds.length}
				/>
			)}

			{myAds && myAds.length > 0 ? (
				<>
					{filteredAds.length > 0 ? (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{paginatedAds.map((ad) => (
									<SearchAdCard
										key={ad._id}
										searchAd={ad}
										isOwner={true}
										onUpdate={refreshAds}
									/>
								))}
							</div>
							<Pagination
								currentPage={currentPage}
								totalItems={filteredAds.length}
								pageSize={itemsPerPage}
								onPageChange={setCurrentPage}
								scrollTargetId="searches-section"
							/>
						</>
					) : (
						<div className="text-center py-10 bg-gray-50 rounded-lg">
							<p className="text-gray-600">
								Aucune recherche ne correspond aux filtres
								sélectionnés.
							</p>
							<Button
								onClick={handleResetFilters}
								variant="outline"
								className="mt-4"
							>
								Réinitialiser les filtres
							</Button>
						</div>
					)}
				</>
			) : (
				<div className="text-center py-10 bg-gray-50 rounded-lg">
					<p className="text-gray-600">
						Vous n&apos;avez aucune recherche active.
					</p>
					<Button
						onClick={() =>
							router.push(
								Features.SearchAds.SEARCH_AD_ROUTES.CREATE,
							)
						}
						className="mt-4"
					>
						Créer votre première recherche
					</Button>
				</div>
			)}
		</div>
	);
};
