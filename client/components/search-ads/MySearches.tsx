'use client';

import { useEffect, useState } from 'react';
import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAd } from '@/types/searchAd';
import { SearchAdCard } from './SearchAdCard';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';

export const MySearches = () => {
	const [myAds, setMyAds] = useState<SearchAd[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const refreshAds = async () => {
		try {
			setLoading(true);
			const ads = await searchAdApi.getMySearchAds();
			setMyAds(ads);
		} catch (err) {
			setError('Impossible de charger vos recherches.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refreshAds();
	}, []);

	if (loading) {
		return <div>Chargement de vos recherches...</div>;
	}

	if (error) {
		return <div className="text-red-500">{error}</div>;
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
			{myAds.length > 0 ? (
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
