'use client';

import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAdCard } from './SearchAdCard';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import { PageLoader } from '../ui/LoadingSpinner';

export const MySearches = () => {
	const router = useRouter();

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

	if (loading) {
		return <PageLoader message="Chargement de vos recherches..." />;
	}

	if (error) {
		return <div className="text-red-500">{error.message}</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-900">
					Mes Recherches
				</h2>
				<Button onClick={() => router.push('/search-ads/create')}>
					Créer une recherche
				</Button>
			</div>
			{myAds && myAds.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{myAds.map((ad) => (
						<SearchAdCard
							key={ad._id}
							searchAd={ad}
							isOwner={true}
							onUpdate={refreshAds}
						/>
					))}
				</div>
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
