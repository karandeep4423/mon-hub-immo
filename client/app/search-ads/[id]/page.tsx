'use client';

import { useParams, useRouter } from 'next/navigation';
import { SearchAdDetails } from '@/components/search-ads/SearchAdDetails';
import { useAuth } from '@/hooks/useAuth';
import { useSearchAd } from '@/hooks/useSearchAds';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Features } from '@/lib/constants';

export default function SearchAdDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuth();
	const searchAdId = params?.id as string;

	// Fetch search ad details using SWR
	const {
		data: searchAd,
		isLoading: loading,
		error,
	} = useSearchAd(searchAdId);

	if (loading) {
		return (
			<PageLoader
				message={Features.SearchAds.SEARCH_AD_LOADING.DETAILS}
			/>
		);
	}

	if (error || !searchAd) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 text-xl mb-4">⚠️</div>
					<h1 className="text-xl font-semibold text-gray-900 mb-2">
						{Features.SearchAds.SEARCH_AD_ERRORS.NOT_FOUND}
					</h1>
					<p className="text-gray-600 mb-4">
						{error
							? error.message
							: 'Cette recherche n&apos;existe pas ou a été supprimée.'}
					</p>
					<button
						onClick={() => router.push('/home')}
						className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
					>
						Retour à l&apos;accueil
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<SearchAdDetails searchAd={searchAd} currentUser={user} />
		</div>
	);
}
