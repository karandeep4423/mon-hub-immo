'use client';

import { useState, useMemo } from 'react';
import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAdCard } from './SearchAdCard';
import { Button, Pagination } from '../ui';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import { PageLoader } from '../ui/LoadingSpinner';

export const MySearches = () => {
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 6;

	// Fetch user's search ads using useFetch hook
	const {
		data: myAds,
		loading,
		error,
		refetch: refreshAds,
	} = useFetch(() => searchAdApi.getMySearchAds(), {
		initialData: [],
		showErrorToast: true,
		errorMessage: 'Impossible de charger vos recherches.',
	});

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
				<Button onClick={() => router.push('/search-ads/create')}>
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
						onClick={() => router.push('/search-ads/create')}
						className="mt-4"
					>
						Créer votre première recherche
					</Button>
				</div>
			)}
		</div>
	);
};
