'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SearchAdDetails } from '@/components/search-ads/SearchAdDetails';
import { useAuth } from '@/hooks/useAuth';
import searchAdApi from '@/lib/api/searchAdApi';
import type { SearchAd } from '@/types/searchAd';

export default function SearchAdDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const { user } = useAuth();
	const searchAdId = params?.id as string;

	const [searchAd, setSearchAd] = useState<SearchAd | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSearchAd = async () => {
			try {
				setLoading(true);
				setError(null);
				const ad = await searchAdApi.getSearchAdById(searchAdId);
				setSearchAd(ad);
			} catch (err) {
				console.error('Error fetching search ad:', err);
				setError('Impossible de charger les détails de la recherche.');
			} finally {
				setLoading(false);
			}
		};

		if (searchAdId) {
			fetchSearchAd();
		}
	}, [searchAdId]);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement des détails...</p>
				</div>
			</div>
		);
	}

	if (error || !searchAd) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-red-500 text-xl mb-4">⚠️</div>
					<h1 className="text-xl font-semibold text-gray-900 mb-2">
						Recherche introuvable
					</h1>
					<p className="text-gray-600 mb-4">
						{error ||
							'Cette recherche n&apos;existe pas ou a été supprimée.'}
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
