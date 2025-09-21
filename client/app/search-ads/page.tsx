'use client';

import { useState, useEffect } from 'react';
import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAd } from '@/types/searchAd';
import { SearchAdCard } from '@/components/search-ads/SearchAdCard';
import Link from 'next/link';

export default function SearchAdsPage() {
	const [searchAds, setSearchAds] = useState<SearchAd[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSearchAds = async () => {
			try {
				setLoading(true);
				const ads = await searchAdApi.getAllSearchAds();
				setSearchAds(ads);
			} catch (err) {
				setError('Impossible de charger les recherches.');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchSearchAds();
	}, []);

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="text-center">Chargement des recherches...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="text-red-500 text-center">{error}</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Toutes les recherches
					</h1>
					<p className="text-gray-600 mt-2">
						{searchAds.length} recherche
						{searchAds.length > 1 ? 's' : ''} client
						{searchAds.length > 1 ? 's' : ''} active
						{searchAds.length > 1 ? 's' : ''}
					</p>
				</div>
				<Link
					href="/home"
					className="text-brand-600 hover:text-brand-700 font-medium"
				>
					← Retour à l&apos;accueil
				</Link>
			</div>

			{searchAds.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{searchAds.map((searchAd) => (
						<SearchAdCard
							key={searchAd._id}
							searchAd={searchAd}
							isOwner={false}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-10 bg-gray-50 rounded-lg">
					<p className="text-gray-600">
						Aucune recherche active pour le moment.
					</p>
					<Link
						href="/search-ads/create"
						className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 transition-colors"
					>
						Créer la première recherche
					</Link>
				</div>
			)}
		</div>
	);
}
