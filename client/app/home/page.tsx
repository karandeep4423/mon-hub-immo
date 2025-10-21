'use client';

import { useState, useEffect } from 'react';
import {
	PropertyService,
	Property,
	PropertyFilters,
} from '@/lib/api/propertyApi';
import searchAdApi from '@/lib/api/searchAdApi';
import { SearchAd } from '@/types/searchAd';
import { HomeSearchAdCard } from '@/components/search-ads/HomeSearchAdCard';
import { PropertyCard } from '@/components/property';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui/Pagination';
import { LocationSearchWithRadius, GeolocationPrompt } from '@/components/ui';
import type { LocationItem } from '@/components/ui/LocationSearchWithRadius';
import { authService } from '@/lib/api/authApi';
import {
	getMunicipalitiesNearby,
	searchMunicipalities,
} from '@/lib/services/frenchAddressApi';
import {
	requestGeolocation,
	checkGeolocationPermission,
	setGeolocationPreference,
	getGeolocationPreference,
} from '@/lib/services/geolocationService';

type ContentFilter =
	| 'all'
	| 'myArea'
	| 'properties'
	| 'searchAds'
	| 'favorites';

export default function Home() {
	const { user } = useAuth();
	const { favoritePropertyIds, favoriteSearchAdIds, initializeFavorites } =
		useFavoritesStore();
	const [properties, setProperties] = useState<Property[]>([]);
	const [searchAds, setSearchAds] = useState<SearchAd[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [selectedLocations, setSelectedLocations] = useState<LocationItem[]>(
		[],
	);
	const [radiusKm, setRadiusKm] = useState(50); // Default 50km
	const [profileFilter, setProfileFilter] = useState('');
	const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000000 });
	const [surfaceFilter, setSurfaceFilter] = useState({ min: 0, max: 100000 });
	const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
	const [propPage, setPropPage] = useState(1);
	const [adPage, setAdPage] = useState(1);
	const [showGeolocationPrompt, setShowGeolocationPrompt] = useState(false);
	const [geolocationError, setGeolocationError] = useState<string | null>(
		null,
	);
	const [myAreaLocations, setMyAreaLocations] = useState<LocationItem[]>([]);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const PAGE_SIZE = 6;
	// Normalize city names for robust comparisons (remove accents, trim, lowercase)
	const normalizeCity = (value: string): string =>
		value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/\s+/g, ' ')
			.trim()
			.toLowerCase();

	const isAuthenticated = !!user;

	// Save radius preference when it changes
	const handleRadiusChange = async (newRadius: number) => {
		setRadiusKm(newRadius);
		if (user) {
			try {
				await authService.updateSearchPreferences({
					preferredRadius: newRadius,
				});
			} catch (error) {
				console.error('Error saving radius preference:', error);
			}
		}
	};

	// Mapping function for property types between properties and search ads
	const mapPropertyType = (propertyType: string): string[] => {
		const typeMapping: Record<string, string[]> = {
			Appartement: ['apartment'],
			Maison: ['house'],
			Terrain: ['land'],
			'Local commercial': ['commercial'],
			Bureaux: ['building', 'commercial'],
			Parking: ['parking', 'garage'],
			Autre: ['other'],
		};
		return typeMapping[propertyType] || [];
	};

	// Helper function to filter search ads based on current filters
	const filterSearchAds = (searchAds: SearchAd[]): SearchAd[] => {
		return searchAds.filter((searchAd) => {
			// Filter by status (only active)
			if (searchAd.status !== 'active') return false;

			// Filter by profile (user type)
			if (profileFilter && searchAd.authorType !== profileFilter) {
				return false;
			}

			// Filter by property type
			if (typeFilter) {
				const mappedTypes = mapPropertyType(typeFilter);
				const hasMatchingType = searchAd.propertyTypes.some((type) =>
					mappedTypes.includes(type),
				);
				if (!hasMatchingType) return false;
			}

			// Filter by search term (search in title, description, and cities)
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

			// Filter by "Mon secteur" if active
			if (contentFilter === 'myArea' && myAreaLocations.length > 0) {
				const myAreaCities = myAreaLocations.map((loc) =>
					normalizeCity(loc.name),
				);
				const myAreaPostalCodes = myAreaLocations.map((loc) =>
					String(loc.postcode).trim(),
				);

				// Try matching by postal codes first, then by city names
				const matchesByPostalCode =
					searchAd.location.postalCodes &&
					searchAd.location.postalCodes.length > 0 &&
					searchAd.location.postalCodes.some((pc) =>
						myAreaPostalCodes.includes(String(pc).trim()),
					);

				const matchesByCity =
					searchAd.location.cities &&
					searchAd.location.cities.length > 0 &&
					searchAd.location.cities.some((city) => {
						const norm = normalizeCity(city);
						return (
							myAreaCities.includes(norm) ||
							myAreaCities.some((c) => norm.includes(c))
						);
					});

				const matchesMyArea = matchesByPostalCode || matchesByCity;
				if (!matchesMyArea) return false;
			} // Filter by selected locations (cities or postal codes)
			if (selectedLocations.length > 0 && contentFilter !== 'myArea') {
				// Filter by cities and postal codes with radius
				const cities = selectedLocations.map((loc) =>
					loc.name.toLowerCase(),
				);
				const postalCodes = selectedLocations.map(
					(loc) => loc.postcode,
				);

				const matchesCity =
					cities.length === 0 ||
					searchAd.location.cities.some((city) =>
						cities.some((filterCity) =>
							city.toLowerCase().includes(filterCity),
						),
					);

				const matchesPostalCode =
					postalCodes.length === 0 ||
					(searchAd.location.postalCodes &&
						searchAd.location.postalCodes.some((pc) =>
							postalCodes.includes(pc),
						));

				if (!matchesCity && !matchesPostalCode) return false;
			} // Filter by price range (budget max should be within range)
			if (priceFilter.min > 0 && searchAd.budget.max < priceFilter.min)
				return false;
			if (
				priceFilter.max < 10000000 &&
				searchAd.budget.max > priceFilter.max
			)
				return false;

			return true;
		});
	};

	// Helper function to filter properties based on current filters
	const filterProperties = (properties: Property[]): Property[] => {
		console.log('[Home] filterProperties called:', {
			totalProperties: properties.length,
			contentFilter,
			profileFilter,
			selectedLocationsCount: selectedLocations.length,
			myAreaLocationsCount: myAreaLocations.length,
		});

		const filtered = properties.filter((property) => {
			// Filter by profile (user type)
			if (profileFilter && property.owner.userType !== profileFilter) {
				return false;
			}

			// Filter by "Mon secteur" if active
			if (contentFilter === 'myArea' && myAreaLocations.length > 0) {
				const myAreaPostalCodes = myAreaLocations.map((loc) =>
					String(loc.postcode).trim(),
				);
				const myAreaCities = myAreaLocations.map((loc) =>
					loc.name.toLowerCase(),
				);
				const propertyPostal = property.postalCode
					? String(property.postalCode).trim()
					: '';
				const propertyCity = property.city
					? normalizeCity(property.city)
					: '';

				const matchesByPostal =
					propertyPostal.length > 0 &&
					myAreaPostalCodes.includes(propertyPostal);
				const matchesByCity =
					propertyCity.length > 0 &&
					(myAreaCities.includes(propertyCity) ||
						myAreaCities.some((c) => propertyCity.includes(c)));

				if (!(matchesByPostal || matchesByCity)) {
					return false;
				}
			}

			// Filter by selected locations (when not in "Mon secteur" mode)
			if (selectedLocations.length > 0 && contentFilter !== 'myArea') {
				const selectedCities = selectedLocations.map((loc) =>
					loc.name.toLowerCase(),
				);
				const selectedPostalCodes = selectedLocations.map(
					(loc) => loc.postcode,
				);

				const propertyPostal = property.postalCode
					? String(property.postalCode).trim()
					: '';
				const propertyCity = property.city
					? normalizeCity(property.city)
					: '';

				const matchesByPostal =
					selectedPostalCodes.length > 0 &&
					propertyPostal.length > 0 &&
					selectedPostalCodes.includes(propertyPostal);

				const matchesByCity =
					selectedCities.length > 0 &&
					propertyCity.length > 0 &&
					selectedCities.some((filterCity) =>
						propertyCity.includes(filterCity),
					);

				if (!matchesByPostal && !matchesByCity) {
					return false;
				}
			}

			return true;
		});

		console.log('[Home] filterProperties result:', {
			filteredCount: filtered.length,
		});

		return filtered;
	};

	// Reset to 'all' if favorites is selected but user is not authenticated
	useEffect(() => {
		if (contentFilter === 'favorites' && !isAuthenticated) {
			setContentFilter('all');
		}
	}, [contentFilter, isAuthenticated]);

	// Initialize favorites store when user is authenticated
	useEffect(() => {
		if (isAuthenticated) {
			initializeFavorites();
		}
	}, [isAuthenticated, initializeFavorites]);

	// Auto-activate "Mon secteur" filter for agents on initial load
	useEffect(() => {
		if (!user || !isInitialLoad) return;
		if (user.userType !== 'agent') return;

		const city = user.professionalInfo?.city;
		const postalCode = user.professionalInfo?.postalCode;

		if (!city || !postalCode) return;

		// Auto-select "Mon secteur" filter to show agent's registered city area
		setContentFilter('myArea');
		setIsInitialLoad(false);

		console.log(
			'[Home] Auto-activated "Mon secteur" for agent:',
			city,
			postalCode,
		);
	}, [user, isInitialLoad]);

	// Load "Mon secteur" locations from user's registered city
	useEffect(() => {
		const loadMyAreaLocations = async () => {
			if (!user) return;

			const city = user.professionalInfo?.city;
			const postalCode = user.professionalInfo?.postalCode;

			if (!city || !postalCode) return;

			try {
				console.log(
					'[Home] Loading "Mon secteur" locations:',
					city,
					postalCode,
				);

				// First, get the exact coordinates of the agent's city
				const citySearchResults = await searchMunicipalities(
					`${city} ${postalCode}`,
					5,
				);

				const agentCity = citySearchResults.find(
					(m) =>
						m.name.toLowerCase() === city.toLowerCase() &&
						m.postcode === postalCode,
				);

				if (!agentCity) {
					console.error(
						'[Home] Could not find coordinates for agent city:',
						city,
						postalCode,
					);
					return;
				}

				console.log('[Home] Agent city coordinates:', agentCity);

				// Get all cities within 50km radius using coordinates
				const nearbyCities = await getMunicipalitiesNearby(
					agentCity.coordinates.lat,
					agentCity.coordinates.lon,
					50, // 50km radius
				);

				// Convert to LocationItem format
				const locationItems: LocationItem[] = nearbyCities.map(
					(municipality) => ({
						name: municipality.name,
						postcode: municipality.postcode,
						citycode: municipality.citycode,
						coordinates: municipality.coordinates,
						context: municipality.context,
						display: `${municipality.name} (${municipality.postcode})`,
						value: `${municipality.name}-${municipality.postcode}`,
					}),
				);

				setMyAreaLocations(locationItems);
				console.log(
					'[Home] "Mon secteur" locations loaded:',
					locationItems.length,
					'cities within 50km',
				);
				console.log(
					'[Home] Postal codes:',
					locationItems.map((l) => l.postcode),
				);
			} catch (error) {
				console.error(
					'[Home] Error loading "Mon secteur" locations:',
					error,
				);
			}
		};

		loadMyAreaLocations();
	}, [user]);

	// Check geolocation permission and show prompt on first visit
	useEffect(() => {
		const checkAndPromptGeolocation = async () => {
			if (!user) return;

			const storedPref = getGeolocationPreference();
			if (storedPref) {
				// User already made a choice
				console.log(
					'[Home] Geolocation preference already set:',
					storedPref,
				);
				return;
			}

			// Check browser permission
			const permission = await checkGeolocationPermission();
			console.log('[Home] Geolocation permission status:', permission);

			if (permission === 'prompt') {
				// Show custom prompt
				setShowGeolocationPrompt(true);
			} else if (permission === 'granted') {
				// Auto-request location
				handleRequestGeolocation();
			}
		};

		checkAndPromptGeolocation();
	}, [user]);

	// Handle geolocation request
	const handleRequestGeolocation = async () => {
		try {
			const location = await requestGeolocation();
			setGeolocationPreference(true);
			setShowGeolocationPrompt(false);
			setGeolocationError(null);
			console.log('[Home] Geolocation granted:', location);
		} catch (error: unknown) {
			const err = error as { message: string };
			setGeolocationError(err.message);
			setGeolocationPreference(false);
			console.error('[Home] Geolocation error:', err.message);
		}
	};

	// Handle geolocation denial
	const handleDenyGeolocation = () => {
		setGeolocationPreference(false);
		setShowGeolocationPrompt(false);
		console.log('[Home] Geolocation denied by user');
	};

	// Debounce effect for search term
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const filters: PropertyFilters = {};
				if (searchTerm) filters.search = searchTerm;
				if (typeFilter) filters.propertyType = typeFilter;

				// Add location filters (postal codes) - but NOT when in "Mon secteur" mode
				// "Mon secteur" uses client-side filtering with myAreaLocations
				if (
					selectedLocations.length > 0 &&
					contentFilter !== 'myArea'
				) {
					const postalCodes = selectedLocations.map(
						(loc) => loc.postcode,
					);

					if (postalCodes.length > 0) {
						filters.postalCode = postalCodes.join(',');
					}
				}
				if (priceFilter.min > 0) filters.minPrice = priceFilter.min;
				if (priceFilter.max < 10000000)
					filters.maxPrice = priceFilter.max;
				if (surfaceFilter.min > 0)
					filters.minSurface = surfaceFilter.min;
				if (surfaceFilter.max < 100000)
					filters.maxSurface = surfaceFilter.max;

				console.log('[Home] Fetching properties with filters:', {
					contentFilter,
					selectedLocationsCount: selectedLocations.length,
					filters,
				});

				const [propertiesData, searchAdsData] = await Promise.all([
					PropertyService.getAllProperties(filters),
					searchAdApi.getAllSearchAds(),
				]);

				console.log(
					'[Home] Received properties:',
					propertiesData?.length,
				);

				setProperties(propertiesData || []);
				setSearchAds(searchAdsData || []);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		); // 500ms delay for search, immediate for others

		return () => clearTimeout(debounceTimer);
	}, [
		searchTerm,
		typeFilter,
		selectedLocations,
		priceFilter,
		surfaceFilter,
		profileFilter,
		contentFilter,
	]);

	// Reset pagination when filters/content change
	useEffect(() => {
		setPropPage(1);
		setAdPage(1);
	}, [
		searchTerm,
		typeFilter,
		selectedLocations,
		priceFilter,
		surfaceFilter,
		profileFilter,
		contentFilter,
	]);

	// Count filtered items for display (respect current contentFilter including 'myArea')
	const filteredSearchAdsCount = filterSearchAds(searchAds).length;
	const filteredProperties = filterProperties(properties);
	const filteredPropertiesCount = filteredProperties.length;

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			{/* Geolocation Permission Prompt */}
			{showGeolocationPrompt && (
				<GeolocationPrompt
					onAllow={handleRequestGeolocation}
					onDeny={handleDenyGeolocation}
					error={geolocationError}
				/>
			)}

			{/* Header with unified title and stats */}
			<div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
				<div className="text-sm text-gray-600">
					{filteredPropertiesCount} bien
					{filteredPropertiesCount > 1 ? 's' : ''} •{' '}
					{filteredSearchAdsCount} recherche
					{filteredSearchAdsCount > 1 ? 's' : ''}
				</div>
			</div>

			{/* Unified Search and Filters */}
			<div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
				{/* Text Search */}
				<div className="mb-4">
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Rechercher par mot-clé..."
						className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
					/>
				</div>
				{/* Location Search with Radius */}
				<div className="mb-4">
					<LocationSearchWithRadius
						selectedLocations={selectedLocations}
						onLocationsChange={setSelectedLocations}
						radiusKm={radiusKm}
						onRadiusChange={handleRadiusChange}
						placeholder="Ville ou code postal (ex: Dinan, 22100)"
					/>
				</div>{' '}
				{/* Content Type Filter */}
				<div className="flex flex-wrap gap-2 mb-4">
					<button
						onClick={() => setContentFilter('all')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'all'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Tout ({filteredPropertiesCount + filteredSearchAdsCount}
						)
					</button>
					{isAuthenticated &&
						user?.professionalInfo?.city &&
						myAreaLocations.length > 0 && (
							<button
								onClick={() => setContentFilter('myArea')}
								className={`px-4 py-2 rounded-lg font-medium transition-colors ${
									contentFilter === 'myArea'
										? 'bg-brand text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								Mon secteur ({myAreaLocations.length} villes)
							</button>
						)}
					<button
						onClick={() => setContentFilter('properties')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'properties'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Biens à vendre ({filteredPropertiesCount})
					</button>
					<button
						onClick={() => setContentFilter('searchAds')}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							contentFilter === 'searchAds'
								? 'bg-brand text-white'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
					>
						Recherche de biens ({filteredSearchAdsCount})
					</button>
					{isAuthenticated && (
						<button
							onClick={() => setContentFilter('favorites')}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								contentFilter === 'favorites'
									? 'bg-brand text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							Favoris (
							{favoritePropertyIds.size +
								favoriteSearchAdIds.size}
							)
						</button>
					)}
				</div>
				{/* Property-specific Filters */}
				{(contentFilter === 'all' ||
					contentFilter === 'properties' ||
					contentFilter === 'favorites') && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						>
							<option value="">Type de bien</option>
							<option value="Appartement">Appartement</option>
							<option value="Maison">Maison</option>
							<option value="Terrain">Terrain</option>
							<option value="Local commercial">
								Local commercial
							</option>
							<option value="Bureaux">Bureaux</option>
							<option value="Parking">Parking</option>
							<option value="Autre">Autre</option>
						</select>

						<select
							value={profileFilter}
							onChange={(e) => setProfileFilter(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
						>
							<option value="">Tous les profils</option>
							<option value="agent">Agent</option>
							<option value="apporteur">Apporteur</option>
						</select>

						<div className="flex items-center gap-2">
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
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
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
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
							/>
						</div>

						{/* Surface habitable */}
						<div className="flex items-center gap-2">
							<input
								type="number"
								placeholder="Surface min (m²)"
								value={surfaceFilter.min || ''}
								onChange={(e) =>
									setSurfaceFilter((prev) => ({
										...prev,
										min: parseInt(e.target.value) || 0,
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
							/>
							<span className="text-gray-500">-</span>
							<input
								type="number"
								placeholder="Surface max (m²)"
								value={
									surfaceFilter.max === 100000
										? ''
										: surfaceFilter.max
								}
								onChange={(e) =>
									setSurfaceFilter((prev) => ({
										...prev,
										max: parseInt(e.target.value) || 100000,
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
							/>
						</div>
					</div>
				)}
			</div>

			{/* Unified Feed */}
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
			) : (
				<div className="space-y-8">
					{/* Properties Section */}
					{(contentFilter === 'all' ||
						contentFilter === 'properties' ||
						contentFilter === 'favorites' ||
						contentFilter === 'myArea') && (
						<div id="properties-section">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								Les biens à vendre
							</h2>
							{(() => {
								const propertiesToShow =
									contentFilter === 'favorites'
										? filteredProperties.filter(
												(property) =>
													favoritePropertyIds.has(
														property._id,
													),
											)
										: filteredProperties;

								return propertiesToShow.length === 0 ? (
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
													d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"
												/>
											</svg>
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											Aucun bien trouvé
										</h3>
										<p className="text-gray-600">
											{contentFilter === 'favorites'
												? "Vous n'avez pas encore de biens en favoris."
												: "Essayez d'ajuster vos filtres pour voir des biens à vendre."}
										</p>
									</div>
								) : (
									<>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{propertiesToShow
												.slice(
													(propPage - 1) * PAGE_SIZE,
													propPage * PAGE_SIZE,
												)
												.map((property) => (
													<PropertyCard
														key={property._id}
														property={property}
													/>
												))}
										</div>
										<Pagination
											currentPage={propPage}
											totalItems={propertiesToShow.length}
											pageSize={PAGE_SIZE}
											onPageChange={setPropPage}
											scrollTargetId="properties-section"
											className="mt-4"
										/>
									</>
								);
							})()}
						</div>
					)}

					{/* Search Ads Section */}
					{(contentFilter === 'all' ||
						contentFilter === 'searchAds' ||
						contentFilter === 'favorites' ||
						contentFilter === 'myArea') && (
						<div id="search-ads-section">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								Recherches clients
							</h2>
							{(() => {
								const filteredSearchAdsToShow =
									contentFilter === 'favorites'
										? filterSearchAds(searchAds).filter(
												(ad) =>
													favoriteSearchAdIds.has(
														ad._id,
													),
											)
										: filterSearchAds(searchAds);

								return filteredSearchAdsToShow.length === 0 ? (
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
													d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
												/>
											</svg>
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											Aucune recherche trouvée
										</h3>
										<p className="text-gray-600">
											Essayez d&apos;ajuster vos filtres
											pour voir des recherches clients.
										</p>
									</div>
								) : (
									<>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{filteredSearchAdsToShow
												.slice(
													(adPage - 1) * PAGE_SIZE,
													adPage * PAGE_SIZE,
												)
												.map((searchAd) => (
													<HomeSearchAdCard
														key={searchAd._id}
														searchAd={searchAd}
													/>
												))}
										</div>
										<Pagination
											currentPage={adPage}
											totalItems={
												filteredSearchAdsToShow.length
											}
											pageSize={PAGE_SIZE}
											onPageChange={setAdPage}
											scrollTargetId="search-ads-section"
											className="mt-4"
										/>
									</>
								);
							})()}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
