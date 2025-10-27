'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAdCard } from './SearchAdCard';
import { Button, Pagination } from '../ui';
import { useRouter } from 'next/navigation';
import { swrKeys } from '@/lib/swrKeys';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '../ui/LoadingSpinner';
import { Features } from '@/lib/constants';

export const MySearches = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

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

	// Paginated search ads
	const paginatedAds = useMemo(() => {
		if (!myAds) return [];
		const startIndex = (currentPage - 1) * itemsPerPage;
		return myAds.slice(startIndex, startIndex + itemsPerPage);
	}, [myAds, currentPage, itemsPerPage]);

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
			{myAds && myAds.length > 0 ? (
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
						totalItems={myAds.length}
						pageSize={itemsPerPage}
						onPageChange={setCurrentPage}
						scrollTargetId="searches-section"
					/>
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
