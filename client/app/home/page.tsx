'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { Features } from '@/lib/constants';
import { usePageState } from '@/hooks/usePageState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

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
	const restorationCompleteRef = useRef(false);
	const restorationInProgressRef = useRef(false);
	const skipNextFilterResetRef = useRef(true);
	const lastFiltersSignatureRef = useRef<string | null>(null);
	const restorationCompleteAtRef = useRef<number | null>(null);

	// Persist filters and dual pagination for Home; restore window scroll
	const {
		key: pageKey,
		savedState,
		save,
	} = usePageState({
		key: 'home',
		getCurrentState: () => ({
			filters: {
				searchTerm,
				typeFilter,
				selectedLocations,
				radiusKm,
				profileFilter,
				priceFilter,
				surfaceFilter,
				contentFilter,
				propPage,
				adPage,
			} as unknown as Record<string, unknown>,
		}),
	});

	// Debounce search term with standard delay
	const debouncedSearchTerm = useDebounce(
		searchTerm,
		Features.Common.DEBOUNCE.SEARCH,
	);

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

	// Restore saved filters/pages once on mount
	useEffect(() => {
		// Check what's in session storage directly
		const rawSessionData = sessionStorage.getItem(`pageState:${pageKey}`);
		logger.debug('[Home] Raw session storage:', {
			key: pageKey,
			rawData: rawSessionData,
			parsed: rawSessionData ? JSON.parse(rawSessionData) : null,
		});

		const filters =
			(savedState?.filters as Record<string, unknown>) || undefined;

		logger.debug('[Home] Restoration attempt:', {
			hasSavedState: !!savedState,
			filters,
			scrollY: savedState?.scrollY,
			scrollX: savedState?.scrollX,
			fullState: savedState,
		});

		if (!filters) {
			// No saved state, mark restoration as complete to allow normal operation
			restorationCompleteRef.current = true;
			return;
		}

		// Mark that restoration is in progress to block reset effects
		restorationInProgressRef.current = true;

		if (typeof filters.searchTerm === 'string')
			setSearchTerm(filters.searchTerm);
		if (typeof filters.typeFilter === 'string')
			setTypeFilter(filters.typeFilter);
		if (typeof filters.radiusKm === 'number') setRadiusKm(filters.radiusKm);
		if (typeof filters.profileFilter === 'string')
			setProfileFilter(filters.profileFilter);
		if (typeof filters.priceFilter === 'object' && filters.priceFilter)
			setPriceFilter(filters.priceFilter as { min: number; max: number });
		if (typeof filters.surfaceFilter === 'object' && filters.surfaceFilter)
			setSurfaceFilter(
				filters.surfaceFilter as { min: number; max: number },
			);
		if (typeof filters.contentFilter === 'string')
			setContentFilter(filters.contentFilter as ContentFilter);
		if (typeof filters.propPage === 'number') {
			logger.debug('[Home] Restoring propPage:', filters.propPage);
			setPropPage(filters.propPage);
		}
		if (typeof filters.adPage === 'number') {
			logger.debug('[Home] Restoring adPage:', filters.adPage);
			setAdPage(filters.adPage);
		}
		if (Array.isArray(filters.selectedLocations))
			setSelectedLocations(filters.selectedLocations as LocationItem[]);

		// prevent auto-activation overriding restored state
		setIsInitialLoad(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Mark restoration complete AFTER all state updates have been processed
	useEffect(() => {
		if (restorationInProgressRef.current) {
			logger.debug(
				'[Home] Restoration complete - enabling normal operations',
			);
			restorationInProgressRef.current = false;
			restorationCompleteRef.current = true;
			restorationCompleteAtRef.current = Date.now();
		}
	}, [propPage, adPage, contentFilter]);

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

	// Auto-activate "Mon secteur" filter for agents on initial load (skip if restored state exists)
	useEffect(() => {
		if (!user || !isInitialLoad) return;
		if (savedState?.filters) return;
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
	}, [user, isInitialLoad, savedState?.filters]);

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

	// Restore scroll only after data and restored state are settled
	useScrollRestoration({
		key: pageKey,
		ready: () => restorationCompleteRef.current && !loading,
		debug: true,
	});

	const filtersForSave = useMemo(
		() => ({
			searchTerm,
			typeFilter,
			selectedLocations,
			radiusKm,
			profileFilter,
			priceFilter,
			surfaceFilter,
			contentFilter,
		}),
		[
			searchTerm,
			typeFilter,
			selectedLocations,
			radiusKm,
			priceFilter,
			surfaceFilter,
			profileFilter,
			contentFilter,
		],
	);

	const filtersSignature = useMemo(
		() => JSON.stringify(filtersForSave),
		[filtersForSave],
	);

	// Reset pagination when filters/content change, but skip restoration-driven updates
	useEffect(() => {
		if (!restorationCompleteRef.current) {
			logger.debug(
				'[Home] Skipping pagination reset - restoration not complete',
			);
			return;
		}

		if (skipNextFilterResetRef.current) {
			skipNextFilterResetRef.current = false;
			lastFiltersSignatureRef.current = filtersSignature;
			logger.debug(
				'[Home] Skipping pagination reset - flagged to skip once',
				{ filtersSignature },
			);
			return;
		}

		// Short cooldown after restoration to allow dependent effects to settle
		if (
			restorationCompleteAtRef.current &&
			Date.now() - restorationCompleteAtRef.current < 800
		) {
			if (lastFiltersSignatureRef.current !== filtersSignature) {
				lastFiltersSignatureRef.current = filtersSignature;
			}
			logger.debug('[Home] Skipping pagination reset during cooldown');
			return;
		}

		if (lastFiltersSignatureRef.current === filtersSignature) {
			logger.debug('[Home] Filters unchanged; no pagination reset');
			return;
		}

		lastFiltersSignatureRef.current = filtersSignature;
		logger.debug('[Home] Resetting pagination due to filter change');
		// Reset only the relevant pagination for current contentFilter
		if (contentFilter === 'properties') {
			setPropPage(1);
		} else if (contentFilter === 'searchAds') {
			setAdPage(1);
		} else {
			setPropPage(1);
			setAdPage(1);
		}
		save({ filters: filtersForSave as unknown as Record<string, unknown> });
	}, [filtersForSave, filtersSignature, save, contentFilter]);

	// Persist page changes
	useEffect(() => {
		if (!restorationCompleteRef.current) {
			logger.debug(
				'[Home] Skipping pagination save - restoration not complete',
			);
			return;
		}
		logger.debug('[Home] Saving pagination:', { propPage, adPage });
		save({
			filters: { propPage, adPage } as unknown as Record<string, unknown>,
		});
	}, [propPage, adPage, save]);

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
