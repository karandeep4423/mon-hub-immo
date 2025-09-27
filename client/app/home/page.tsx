'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'
import {
	PropertyService,
	Property,
	PropertyFilters,
} from '@/lib/propertyService';
import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAd } from '@/types/searchAd';
import { HomeSearchAdCard } from '@/components/search-ads/HomeSearchAdCard';

type FeedItem = {
	type: 'property' | 'searchAd';
	data: Property | SearchAd;
	createdAt: string;
};

type ContentFilter = 'all' | 'properties' | 'searchAds' | 'favorites';

export default function Home() {
	const [properties, setProperties] = useState<Property[]>([]);
	const [searchAds, setSearchAds] = useState<SearchAd[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [sectorFilter, setSectorFilter] = useState('');
	const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000000 });
	const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
	const [profileFilter, setProfileFilter] = useState<string>('all'); // New profile filter: 'all', 'agent', 'apporteur'
	const [favorites, setFavorites] = useState<Set<string>>(new Set(JSON.parse(localStorage.getItem('favorites') || '[]')));

	// Mapping function for property types between properties and search ads
	const mapPropertyType = (propertyType: string): string[] => {
		const typeMapping: Record<string, string[]> = {
			Appartement: ['apartment'],
			Maison: ['house'],
			Terrain: ['land'],
			'Local commercial': ['commercial'],
			Bureaux: ['building', 'commercial'],
			Parking: ['parking'],
			Autres: ['other'],
		};
		return typeMapping[propertyType] || [];
	};

	// Helper function to filter search ads based on current filters
	const filterSearchAds = (searchAds: SearchAd[]): SearchAd[] => {
		return searchAds.filter((searchAd) => {
			if (searchAd.status !== 'active') return false;

			if (typeFilter) {
				const mappedTypes = mapPropertyType(typeFilter);
				const hasMatchingType = searchAd.propertyTypes.some((type) =>
					mappedTypes.includes(type),
				);
				if (!hasMatchingType) return false;
			}

			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				const matchesTitle = searchAd.title
					.toLowerCase()
					.includes(searchLower);
				const matchesDescription =
					searchAd.description?.toLowerCase().includes(searchLower) ||
					false;
				const matchesCities = searchAd.location.cities.some((city) =>
					city.toLowerCase().includes(searchLower),
				);
				if (!matchesTitle && !matchesDescription && !matchesCities)
					return false;
			}

			if (sectorFilter) {
				const sectorLower = sectorFilter.toLowerCase();
				const matchesSector = searchAd.location.cities.some((city) =>
					city.toLowerCase().includes(sectorLower),
				);
				if (!matchesSector) return false;
			}

			if (priceFilter.min > 0 && searchAd.budget.max < priceFilter.min)
				return false;
			if (
				priceFilter.max < 10000000 &&
				searchAd.budget.max > priceFilter.max
			)
				return false;

			// New profile filter with safe check
			if (profileFilter !== 'all') {
				const ownerUserType = searchAd.owner?.userType;
				if (!ownerUserType || ownerUserType !== profileFilter) {
					return false
				}
			}

			return true;
		});
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const filters: PropertyFilters = {};
				if (searchTerm) filters.search = searchTerm;
				if (typeFilter) filters.propertyType = typeFilter;
				if (sectorFilter) filters.sector = sectorFilter;
				if (priceFilter.min > 0) filters.minPrice = priceFilter.min;
				if (priceFilter.max < 10000000)
					filters.maxPrice = priceFilter.max;
				// Add profile filter for properties if not 'all'
				if (profileFilter !== 'all') {
					filters.ownerType = profileFilter; // Assume PropertyFilters has an ownerType field; adjust if needed
				}

				const [propertiesData, searchAdsData] = await Promise.all([
					PropertyService.getAllProperties(filters),
					searchAdApi.getAllSearchAds(),
				]);

				setProperties(propertiesData || []);
				setSearchAds(searchAdsData || []);
			} catch (error: any) {
				console.error('Error fetching data:', error);
				setError(
					error.message || 'Erreur lors du chargement des données',
				);
			} finally {
				setLoading(false);
			}
		};

		const debounceTimer = setTimeout(
			() => {
				fetchData();
			},
			searchTerm ? 500 : 0,
		);

		return () => clearTimeout(debounceTimer);
	}, [searchTerm, typeFilter, sectorFilter, priceFilter, profileFilter]);

	useEffect(() => {
		localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
	}, [favorites]);

	const createUnifiedFeed = (): FeedItem[] => {
		const feedItems: FeedItem[] = [];

		properties.forEach((property) => {
			// Safe check for profile filter
			if (profileFilter !== 'all') {
				const ownerUserType = property.owner?.userType;
				if (!ownerUserType || ownerUserType !== profileFilter) {
					return; // Skip if profile doesn't match
				}
			}
			feedItems.push({
				type: 'property',
				data: property,
				createdAt: property.publishedAt || property.createdAt,
			});
		});

		const filteredSearchAds = filterSearchAds(searchAds);
		filteredSearchAds.forEach((searchAd) => {
			feedItems.push({
				type: 'searchAd',
				data: searchAd,
				createdAt: searchAd.createdAt,
			});
		});

		return feedItems.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime(),
		);
	};

	const getFilteredFeed = (): FeedItem[] => {
		const unifiedFeed = createUnifiedFeed();

		switch (contentFilter) {
			case 'properties':
				return unifiedFeed.filter((item) => item.type === 'property');
			case 'searchAds':
				return unifiedFeed.filter((item) => item.type === 'searchAd');
			case 'favorites':
				return unifiedFeed.filter((item) => {
					const itemId = item.type === 'property'
						? (item.data as Property)._id
						: (item.data as SearchAd)._id;
					return favorites.has(itemId);
				});
			default:
				return unifiedFeed;
		}
	};

	const filteredFeed = getFilteredFeed();
	const filteredProperties = filteredFeed.filter(
		(item) => item.type === 'property',
	);
	const filteredSearchAds = filteredFeed.filter(
		(item) => item.type === 'searchAd',
	);

	const filteredSearchAdsCount = filterSearchAds(searchAds).length;

	const toggleFavorite = (itemId: string) => {
		setFavorites((prev) => {
			const newFavorites = new Set(prev);
			if (newFavorites.has(itemId)) {
				newFavorites.delete(itemId);
			} else {
				newFavorites.add(itemId);
			}
			return newFavorites;
		});
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
				{/* <h1 className="text-3xl font-bold text-gray-900">
					Annonces récentes
				</h1> */}
				<div className="text-sm text-gray-600">
					{properties.length} bien{properties.length > 1 ? 's' : ''} •{' '}
					{filteredSearchAdsCount} recherche
					{filteredSearchAdsCount > 1 ? 's' : ''}
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
				<div className="flex flex-col lg:flex-row gap-4 mb-4">
					<div className="flex-1 relative">
						<input
							type="text"
							placeholder="Rechercher dans les biens et recherches..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full border rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
						/>
						<button className="absolute right-3 top-3 text-gray-500 hover:text-brand">
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div className="flex flex-wrap gap-2 mb-4">
					<button
						onClick={() => setContentFilter('all')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'all'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Tout ({properties.length + filteredSearchAdsCount})
					</button>
					<button
						onClick={() => setContentFilter('properties')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'properties'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Biens à vendre ({properties.length})
					</button>
					<button
						onClick={() => setContentFilter('searchAds')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'searchAds'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Recherches clients ({filteredSearchAdsCount})
					</button>
					<button
						onClick={() => setContentFilter('favorites')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'favorites'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Favoris ({favorites.size})
					</button>
				</div>

				{(contentFilter === 'all' || contentFilter === 'properties') && (
					<div className="flex flex-wrap gap-4">
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						>
							<option value="">Tous les types</option>
							<option value="Appartement">Appartement</option>
							<option value="Maison">Maison</option>
							<option value="Terrain">Terrain</option>
							<option value="Local commercial">
								Local commercial
							</option>
							<option value="Bureaux">Bureaux</option>
							<option value="Parking">Parking</option>
							<option value="Autres">Autres</option>
						</select>

						<input
							type="text"
							placeholder="Secteur..."
							value={sectorFilter}
							onChange={(e) => setSectorFilter(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						/>

						<div className="flex items-center space-x-2">
							<input
								type="number"
								placeholder="Prix min"
								value={priceFilter.min || ''}
								onChange={(e) =>
									setPriceFilter((prev) => ({
										...prev,
										min: parseInt(e.target.value) || 0,
									}))
								}
								className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand w-32"
							/>
							<span className="text-gray-500">-</span>
							<input
								type="number"
								placeholder="Prix max"
								value={
									priceFilter.max === 10000000
										? ''
										: priceFilter.max
								}
								onChange={(e) =>
									setPriceFilter((prev) => ({
										...prev,
										max:
											parseInt(e.target.value) ||
											10000000,
									}))
								}
								className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand w-32"
							/>
						</div>

						<select
							value={profileFilter}
							onChange={(e) => setProfileFilter(e.target.value)}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						>
							<option value="all">Tous les profils</option>
							<option value="agent">Agent</option>
							<option value="apporteur">Apporteur</option>
						</select>
					</div>
				)}
			</div>

			{loading ? (
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement des annonces...</p>
				</div>
			) : error ? (
				<div className="text-center py-12 bg-red-50 rounded-lg">
					<p className="text-red-600">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark"
					>
						Réessayer
					</button>
				</div>
			) : filteredFeed.length === 0 ? (
				<div className="text-center py-12 bg-gray-50 rounded-lg">
					<div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
						<svg
							className="w-8 h-8 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Aucune annonce trouvée
					</h3>
					<p className="text-gray-600">
						Essayez d&apos;ajuster vos filtres ou revenez plus tard
						pour voir de nouvelles annonces.
					</p>
				</div>
			) : contentFilter === 'all' ? (
				<>
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Les biens à vendre 
						</h2>
						<hr />
						<br />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredProperties.map((item) => (
								<div key={`${item.type}-${(item.data as Property)._id}`}>
									<PropertyCard
										item={item}
										toggleFavorite={toggleFavorite}
										favorites={favorites}
									/>
								</div>
							))}
						</div>
						{filteredProperties.length === 0 && (
							<p className="text-center text-gray-600 mt-4">
								Aucun bien à vendre correspondant à vos filtres.
							</p>
						)}
					</div>
					<hr className="my-6 border-gray-300" />
					<div className="mb-6">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Les recherches clients :
						</h2>
						<hr />
						<br />
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredSearchAds.map((item) => (
								<div key={`${item.type}-${(item.data as SearchAd)._id}`}>
									<HomeSearchAdCard
										searchAd={item.data as SearchAd}
										toggleFavorite={toggleFavorite}
										favorites={favorites}
									/>
								</div>
							))}
						</div>
						{filteredSearchAds.length === 0 && (
							<p className="text-center text-gray-600 mt-4">
								Aucune recherche client correspondant à vos filtres.
							</p>
						)}
					</div>
				</>
			) : contentFilter === 'properties' ? (
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Les biens à vendre 
					</h2>
					<hr />
					<br />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredProperties.map((item) => (
							<div key={`${item.type}-${(item.data as Property)._id}`}>
								<PropertyCard
									item={item}
									toggleFavorite={toggleFavorite}
									favorites={favorites}
								/>
							</div>
						))}
					</div>
					{filteredProperties.length === 0 && (
						<p className="text-center text-gray-600 mt-4">
							Aucun bien à vendre correspondant à vos filtres.
						</p>
					)}
				</div>
			) : contentFilter === 'searchAds' ? (
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Les recherches clients 
					</h2>
					<br />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredSearchAds.map((item) => (
							<div key={`${item.type}-${(item.data as SearchAd)._id}`}>
								<HomeSearchAdCard
									searchAd={item.data as SearchAd}
									toggleFavorite={toggleFavorite}
									favorites={favorites}
								/>
							</div>
						))}
					</div>
					{filteredSearchAds.length === 0 && (
						<p className="text-center text-gray-600 mt-4">
							Aucune recherche client correspondant à vos filtres.
						</p>
					)}
				</div>
			) : contentFilter === 'favorites' ? (
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Favoris 
					</h2>
					<br />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredFeed.map((item) => {
							const itemId =
								item.type === 'property'
									? (item.data as Property)._id
									: (item.data as SearchAd)._id;
							return (
								<div key={`${item.type}-${itemId}`}>
									{item.type === 'property' ? (
										<PropertyCard
											item={item}
											toggleFavorite={toggleFavorite}
											favorites={favorites}
										/>
									) : (
										<HomeSearchAdCard
											searchAd={item.data as SearchAd}
											toggleFavorite={toggleFavorite}
											favorites={favorites}
										/>
									)}
								</div>
							);
						})}
					</div>
					{filteredFeed.length === 0 && (
						<p className="text-center text-gray-600 mt-4">
							Aucun favori enregistré.
						</p>
					)}
				</div>
			) : null}
		</div>
	);
}

// Property Card Component with Favorite Button
const PropertyCard = ({ item, toggleFavorite, favorites }: { item: FeedItem; toggleFavorite: (itemId: string) => void; favorites: Set<string> }) => {
	const property = item.data as Property;
	const itemId = item.type === 'property' ? (item.data as Property)._id : (item.data as SearchAd)._id;
	const isFavorite = favorites.has(itemId);

	return (
		<Link href={`/property/${property._id}`} className="block">
			<div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
				<div className="relative">
					<img
						src={property.mainImage}
						alt={property.title}
						className="w-full h-48 object-cover"
						onError={(e) => {
							(e.target as HTMLImageElement).src = '/placeholder-property.jpg';
						}}
					/>
					<div className="absolute top-2 left-2 flex flex-col space-y-1">
						{property.isNewProperty && (
							<span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
								Nouveau
							</span>
						)}
						{property.isExclusive && (
							<span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
								Exclusivité
							</span>
						)}
					</div>
					<div className="absolute top-2 right-2">
						<span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
							Bien
						</span>
					</div>
				</div>

				<div className="p-4 flex-1 flex flex-col">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-baseline space-x-2">
							<p className="text-2xl font-bold text-black">
								{property.price.toLocaleString()} €
							</p>
							<p className="text-sm text-gray-600">
								{property.surface} m²
							</p>
						</div>
					</div>

					<h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
						{property.title}
					</h3>

					<p className="text-gray-600 text-sm mb-3 line-clamp-2">
						{property.description}
					</p>

					<div className="flex space-x-2 mb-3">
						<span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
							{property.propertyType}
						</span>
						<span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
							{property.city}
						</span>
						{property.rooms && (
							<span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
								{property.rooms} pièces
							</span>
						)}
					</div>

					<div className="flex items-center justify-between mt-auto">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
								<img
									src={
										property.owner.profileImage ||
										`https://ui-avatars.com/api/?name=${encodeURIComponent(
											property.owner.firstName +
												' ' +
												property.owner.lastName,
										)}&background=3b82f6&color=ffffff`
									}
									alt={`${property.owner.firstName} ${property.owner.lastName}`}
									className="w-full h-full object-cover"
								/>
							</div>
							<div>
								<p className="text-gray-700 font-medium text-sm">
									{property.owner.firstName}{' '}
									{property.owner.lastName}
								</p>
								<p className="text-xs text-gray-500">
									{property.owner.userType === 'apporteur'
										? 'Apporteur'
										: 'Agent'}
								</p>
							</div>
						</div>

						<div className="text-right flex flex-col items-end">
							<button
								onClick={(e) => { e.preventDefault(); toggleFavorite(itemId); }}
								className="text-gray-500 hover:text-red-500 transition-colors duration-300 mb-2"
							>
								<svg
									className={`w-6 h-6 ${isFavorite ? 'fill-red-500' : 'fill-none'}`}
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
							</button>
							<p className="text-xs text-gray-500">
								{new Date(
									property.publishedAt || property.createdAt,
								).toLocaleDateString('fr-FR')}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}