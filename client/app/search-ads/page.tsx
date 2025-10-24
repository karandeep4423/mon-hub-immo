'use client';

import { useState } from 'react';
import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAd } from '@/types/searchAd';
import { SearchAdCard } from '@/components/search-ads/SearchAdCard';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { LocationSearchWithRadius } from '@/components/ui';
import type { LocationItem } from '@/components/ui/LocationSearchWithRadius';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authApi';
import { useFetch } from '@/hooks';
import { logger } from '@/lib/utils/logger';

export default function SearchAdsPage() {
	const { user } = useAuth();

	// Fetch search ads using useFetch hook
	const { data: searchAds = [], loading } = useFetch<SearchAd[]>(
		() => searchAdApi.getAllSearchAds(),
		{
			showErrorToast: true,
			errorMessage: 'Impossible de charger les recherches',
		},
	);

	const [selectedLocations, setSelectedLocations] = useState<LocationItem[]>(
		[],
	);
	const [radiusKm, setRadiusKm] = useState(
		user?.searchPreferences?.preferredRadius || 10,
	);

	// Save radius preference when it changes
	const handleRadiusChange = async (newRadius: number) => {
		setRadiusKm(newRadius);
		if (user) {
			try {
				await authService.updateSearchPreferences({
					preferredRadius: newRadius,
				});
			} catch (error) {
				logger.error('Error saving radius preference', { error });
			}
		}
	};

	// Filter search ads by selected locations
	const filteredSearchAds =
		selectedLocations.length > 0
			? searchAds.filter((searchAd) => {
					const cities = selectedLocations.map((loc) =>
						loc.name.toLowerCase(),
					);
					const postalCodes = selectedLocations.map(
						(loc) => loc.postcode,
					);

					const matchesCity = searchAd.location.cities.some((city) =>
						cities.some((filterCity) =>
							city.toLowerCase().includes(filterCity),
						),
					);

					const matchesPostalCode =
						searchAd.location.postalCodes &&
						searchAd.location.postalCodes.some((pc) =>
							postalCodes.includes(pc),
						);

					return matchesCity || matchesPostalCode;
				})
			: searchAds;

	if (loading) {
		return <PageLoader message="Chargement des recherches..." />;
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Toutes les recherches
					</h1>
					<p className="text-gray-600 mt-2">
						{filteredSearchAds.length} recherche
						{filteredSearchAds.length > 1 ? 's' : ''} client
						{filteredSearchAds.length > 1 ? 's' : ''} active
						{filteredSearchAds.length > 1 ? 's' : ''}
					</p>
				</div>
				<Link
					href="/home"
					className="text-brand-600 hover:text-brand-700 font-medium"
				>
					← Retour à l&apos;accueil
				</Link>
			</div>

			{/* Location Search with Radius */}
			<div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
				<LocationSearchWithRadius
					selectedLocations={selectedLocations}
					onLocationsChange={setSelectedLocations}
					radiusKm={radiusKm}
					onRadiusChange={handleRadiusChange}
					placeholder="Filtrer par ville ou code postal"
				/>
			</div>

			{filteredSearchAds.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredSearchAds.map((searchAd) => (
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
						{selectedLocations.length > 0
							? 'Aucune recherche trouvée dans cette zone.'
							: 'Aucune recherche active pour le moment.'}
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
