'use client';

import { useState, useEffect, useMemo } from 'react';
import { Property, PropertyFilters } from '@/lib/api/propertyApi';
import { SearchAd } from '@/types/searchAd';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { useSearchAds } from '@/hooks/useSearchAds';
import { GeolocationPrompt } from '@/components/ui';
import type { LocationItem } from '@/components/ui/LocationSearchWithRadius';
import { authService } from '@/lib/api/authApi';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import {
	HomeHeader,
	SearchFiltersPanel,
	PropertiesSection,
	SearchAdsSection,
} from '@/components/home';
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
import { logger } from '@/lib/utils/logger';
import { useDebounce } from '@/hooks/useDebounce';
import { DEBOUNCE_SEARCH_MS } from '@/lib/constants';

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

	// Debounce search term with standard delay
	const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_SEARCH_MS);

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
				logger.error('Error saving radius preference:', error);
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
		logger.debug('[Home] filterProperties called:', {
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

		logger.debug('[Home] filterProperties result:', {
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

		logger.debug(
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
				logger.debug(
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
					logger.error(
						'[Home] Could not find coordinates for agent city:',
						city,
						postalCode,
					);
					return;
				}

				logger.debug('[Home] Agent city coordinates:', agentCity);

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
				logger.debug(
					'[Home] "Mon secteur" locations loaded:',
					locationItems.length,
					'cities within 50km',
				);
				logger.debug(
					'[Home] Postal codes:',
					locationItems.map((l) => l.postcode),
				);
			} catch (error) {
				logger.error(
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
				logger.debug(
					'[Home] Geolocation preference already set:',
					storedPref,
				);
				return;
			}

			// Check browser permission
			const permission = await checkGeolocationPermission();
			logger.debug('[Home] Geolocation permission status:', permission);

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
			logger.debug('[Home] Geolocation granted:', location);
		} catch (error: unknown) {
			const err = error as { message: string };
			setGeolocationError(err.message);
			setGeolocationPreference(false);
			logger.error('[Home] Geolocation error:', err.message);
		}
	};

	// Handle geolocation denial
	const handleDenyGeolocation = () => {
		setGeolocationPreference(false);
		setShowGeolocationPrompt(false);
		logger.debug('[Home] Geolocation denied by user');
	};

	// Build property filters based on current state
	const propertyFilters = useMemo((): PropertyFilters => {
		const filters: PropertyFilters = {};
		if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
		if (typeFilter) filters.propertyType = typeFilter;

		// Add location filters (postal codes) - but NOT when in "Mon secteur" mode
		// "Mon secteur" uses client-side filtering with myAreaLocations
		if (selectedLocations.length > 0 && contentFilter !== 'myArea') {
			const postalCodes = selectedLocations.map((loc) => loc.postcode);
			if (postalCodes.length > 0) {
				filters.postalCode = postalCodes.join(',');
			}
		}
		if (priceFilter.min > 0) filters.minPrice = priceFilter.min;
		if (priceFilter.max < 10000000) filters.maxPrice = priceFilter.max;
		if (surfaceFilter.min > 0) filters.minSurface = surfaceFilter.min;
		if (surfaceFilter.max < 100000) filters.maxSurface = surfaceFilter.max;

		return filters;
	}, [
		debouncedSearchTerm,
		typeFilter,
		selectedLocations,
		contentFilter,
		priceFilter,
		surfaceFilter,
	]);

	// Fetch properties using SWR
	const {
		data: swrProperties,
		isLoading: loadingProperties,
		error: propertiesError,
	} = useProperties(propertyFilters);
	const properties: Property[] = swrProperties || [];

	// Fetch search ads using SWR
	const {
		data: searchAds = [],
		isLoading: loadingSearchAds,
		error: searchAdsError,
	} = useSearchAds();

	// Combined loading and error states
	const loading = loadingProperties || loadingSearchAds;
	const error = propertiesError || searchAdsError;

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
			<HomeHeader
				filteredPropertiesCount={filteredPropertiesCount}
				filteredSearchAdsCount={filteredSearchAdsCount}
			/>

			{/* Unified Search and Filters */}
			<SearchFiltersPanel
				searchTerm={searchTerm}
				onSearchTermChange={setSearchTerm}
				selectedLocations={selectedLocations}
				onLocationsChange={setSelectedLocations}
				radiusKm={radiusKm}
				onRadiusChange={handleRadiusChange}
				contentFilter={contentFilter}
				onContentFilterChange={setContentFilter}
				typeFilter={typeFilter}
				onTypeFilterChange={setTypeFilter}
				profileFilter={profileFilter}
				onProfileFilterChange={setProfileFilter}
				priceFilter={priceFilter}
				onPriceFilterChange={setPriceFilter}
				surfaceFilter={surfaceFilter}
				onSurfaceFilterChange={setSurfaceFilter}
				filteredPropertiesCount={filteredPropertiesCount}
				filteredSearchAdsCount={filteredSearchAdsCount}
				isAuthenticated={isAuthenticated}
				hasMyArea={
					!!user?.professionalInfo?.city && myAreaLocations.length > 0
				}
				myAreaLocationsCount={myAreaLocations.length}
				favoritePropertyIds={favoritePropertyIds}
				favoriteSearchAdIds={favoriteSearchAdIds}
			/>

			{/* Unified Feed */}
			{loading ? (
				<div className="text-center py-12">
					<PageLoader message="Chargement des annonces..." />
				</div>
			) : error ? (
				<div className="text-center py-12 bg-red-50 rounded-lg">
					<p className="text-red-600">
						{error.message ||
							'Erreur lors du chargement des données'}
					</p>
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
						<PropertiesSection
							properties={filteredProperties}
							contentFilter={contentFilter}
							favoritePropertyIds={favoritePropertyIds}
							currentPage={propPage}
							pageSize={PAGE_SIZE}
							onPageChange={setPropPage}
						/>
					)}

					{/* Search Ads Section */}
					{(contentFilter === 'all' ||
						contentFilter === 'searchAds' ||
						contentFilter === 'favorites' ||
						contentFilter === 'myArea') && (
						<SearchAdsSection
							searchAds={
								contentFilter === 'favorites'
									? filterSearchAds(searchAds).filter((ad) =>
											favoriteSearchAdIds.has(ad._id),
										)
									: filterSearchAds(searchAds)
							}
							currentPage={adPage}
							pageSize={PAGE_SIZE}
							onPageChange={setAdPage}
						/>
					)}
				</div>
			)}
		</div>
	);
}
