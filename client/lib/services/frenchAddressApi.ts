/**
 * French Address API Service
 * Uses api-adresse.data.gouv.fr for real-time municipality lookup
 */

import { logger } from '@/lib/utils/logger';

export interface FrenchMunicipality {
	name: string;
	postcode: string;
	citycode: string;
	coordinates: {
		lat: number;
		lon: number;
	};
	context: string; // Department and region info
}

export interface AddressSearchResult {
	type: 'municipality';
	properties: {
		label: string; // Full display label
		name: string; // City name
		postcode: string;
		citycode: string; // INSEE code
		context: string;
		x: number; // longitude
		y: number; // latitude
	};
	geometry: {
		coordinates: [number, number]; // [lon, lat]
	};
}

export interface GeoApiCommune {
	nom: string;
	code: string;
	codeDepartement?: string;
	codesPostaux?: string[];
	centre?: {
		coordinates: [number, number]; // [lon, lat]
	};
}

const API_BASE = 'https://api-adresse.data.gouv.fr';

/**
 * Search for French municipalities by name or postal code
 */
export async function searchMunicipalities(
	query: string,
	limit: number = 10,
): Promise<FrenchMunicipality[]> {
	const trimmedQuery = query.trim();

	// Different minimum lengths based on query type
	// Postal codes (numeric): 2+ characters
	// City names (text): 3+ characters
	const isPostalCode = /^\d+$/.test(trimmedQuery);
	const minLength = isPostalCode ? 2 : 3;

	logger.debug('[searchMunicipalities] Query', {
		query: trimmedQuery,
		isPostalCode,
		minLength,
	});

	if (!trimmedQuery || trimmedQuery.length < minLength) {
		logger.debug(
			'[searchMunicipalities] Query too short, returning empty array',
		);
		return [];
	}

	try {
		const params = new URLSearchParams({
			q: trimmedQuery,
			type: 'municipality',
			limit: limit.toString(),
			autocomplete: '1',
		});

		// For postal code searches, only add postcode parameter if it's exactly 5 digits
		// Partial postal codes should use q parameter only
		if (isPostalCode && trimmedQuery.length === 5) {
			params.set('postcode', trimmedQuery);
		}

		const url = `${API_BASE}/search/?${params}`;
		logger.debug('[searchMunicipalities] Fetching URL', url);

		const response = await fetch(url);

		logger.debug('[searchMunicipalities] Response status', {
			status: response.status,
			statusText: response.statusText,
		});

		if (!response.ok) {
			logger.error('[searchMunicipalities] API error', {
				status: response.status,
				statusText: response.statusText,
			});
			return [];
		}

		const data = await response.json();

		logger.debug(
			'[searchMunicipalities] API returned features',
			data.features?.length || 0,
		);

		if (!data.features || !Array.isArray(data.features)) {
			logger.debug(
				'[searchMunicipalities] No features found in response',
			);
			return [];
		}

		const results = data.features.map((feature: AddressSearchResult) => ({
			name: feature.properties.name,
			postcode: feature.properties.postcode,
			citycode: feature.properties.citycode,
			coordinates: {
				lat: feature.geometry.coordinates[1],
				lon: feature.geometry.coordinates[0],
			},
			context: feature.properties.context,
		}));

		logger.debug(
			'[searchMunicipalities] Returning results',
			results.length,
		);
		return results;
	} catch (error) {
		logger.error(
			'[searchMunicipalities] Error fetching municipalities',
			error,
		);
		return [];
	}
}

/**
 * Get municipalities with the same postal code prefix
 * Used to find neighboring cities for multi-select
 */
export async function getMunicipalitiesByPostalPrefix(
	postalCode: string,
	limit: number = 20,
): Promise<FrenchMunicipality[]> {
	if (!postalCode || postalCode.length < 4) {
		return [];
	}

	try {
		// Search using the postal code
		const params = new URLSearchParams({
			q: postalCode,
			type: 'municipality',
			limit: limit.toString(),
		});

		const response = await fetch(`${API_BASE}/search/?${params}`);

		if (!response.ok) {
			return [];
		}

		const data = await response.json();

		if (!data.features || !Array.isArray(data.features)) {
			return [];
		}

		// Filter to only include municipalities with matching postal code prefix (first 4 digits)
		const prefix = postalCode.substring(0, 4);

		return data.features
			.filter((feature: AddressSearchResult) =>
				feature.properties.postcode.startsWith(prefix),
			)
			.map((feature: AddressSearchResult) => ({
				name: feature.properties.name,
				postcode: feature.properties.postcode,
				citycode: feature.properties.citycode,
				coordinates: {
					lat: feature.geometry.coordinates[1],
					lon: feature.geometry.coordinates[0],
				},
				context: feature.properties.context,
			}));
	} catch (error) {
		logger.error('Error fetching nearby municipalities', error);
		return [];
	}
}

/**
 * Get municipalities within a radius of given coordinates
 */
/**
 * Get municipalities within a radius of given coordinates
 * Uses geo.api.gouv.fr to fetch all communes in the department and filters by distance
 */
export async function getMunicipalitiesNearby(
	lat: number,
	lon: number,
	radiusKm: number = 10,
): Promise<FrenchMunicipality[]> {
	try {
		// 1. Get the department code for these coordinates
		const communeUrl = `https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=codeDepartement,nom,code&format=json&geometry=centre`;
		const communeResponse = await fetch(communeUrl);

		if (!communeResponse.ok) {
			logger.error(
				'GeoAPI error fetching commune',
				communeResponse.statusText,
			);
			return [];
		}

		const communeData = await communeResponse.json();
		if (!communeData || communeData.length === 0) {
			return [];
		}

		const codeDepartement = communeData[0].codeDepartement;

		// 2. Get all communes in the department
		const deptUrl = `https://geo.api.gouv.fr/communes?codeDepartement=${codeDepartement}&fields=nom,codesPostaux,centre&format=json&geometry=centre`;
		const deptResponse = await fetch(deptUrl);

		if (!deptResponse.ok) {
			logger.error(
				'GeoAPI error fetching department communes',
				deptResponse.statusText,
			);
			return [];
		}

		const deptData = await deptResponse.json();

		if (!deptData || !Array.isArray(deptData)) {
			return [];
		}

		// 3. Filter by distance and map to FrenchMunicipality
		const municipalities = deptData
			.filter((commune: GeoApiCommune) => {
				if (!commune.centre || !commune.centre.coordinates)
					return false;
				const [cLon, cLat] = commune.centre.coordinates;
				const distance = calculateDistance(lat, lon, cLat, cLon);
				return distance <= radiusKm;
			})
			.map((commune: GeoApiCommune) => ({
				name: commune.nom,
				postcode:
					commune.codesPostaux && commune.codesPostaux.length > 0
						? commune.codesPostaux[0]
						: '',
				citycode: commune.code,
				coordinates: {
					lat: commune.centre!.coordinates[1],
					lon: commune.centre!.coordinates[0],
				},
				context: codeDepartement, // Using dept code as context since we don't have full context string
			}));

		return municipalities;
	} catch (error) {
		logger.error('Error fetching nearby municipalities', error);
		return [];
	}
}

/**
 * Get exact municipality data by postal code
 */
export async function getMunicipalityByPostalCode(
	postalCode: string,
): Promise<FrenchMunicipality | null> {
	if (!/^\d{5}$/.test(postalCode)) {
		return null;
	}

	try {
		const params = new URLSearchParams({
			q: postalCode,
			type: 'municipality',
			limit: '1',
		});

		const response = await fetch(`${API_BASE}/search/?${params}`);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		if (!data.features || data.features.length === 0) {
			return null;
		}

		const feature = data.features[0];
		return {
			name: feature.properties.name,
			postcode: feature.properties.postcode,
			citycode: feature.properties.citycode,
			coordinates: {
				lat: feature.geometry.coordinates[1],
				lon: feature.geometry.coordinates[0],
			},
			context: feature.properties.context,
		};
	} catch (error) {
		logger.error('Error fetching municipality', error);
		return null;
	}
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371; // Earth's radius in km
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}
