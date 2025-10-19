/**
 * Geolocation utilities for radius filtering
 */

import {
	FrenchMunicipality,
	calculateDistance,
} from '../services/frenchAddressApi';

export interface LocationWithCoordinates {
	city: string;
	postalCode: string;
	coordinates: {
		lat: number;
		lon: number;
	};
}

/**
 * Get all municipalities within radius of selected locations
 * Note: Returns postal codes for now. Full radius calculation requires property coordinates.
 */
export async function getMunicipalitiesInRadius(
	selectedLocations: LocationWithCoordinates[],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	radiusKm: number,
): Promise<Set<string>> {
	const municipalitySet = new Set<string>();

	for (const location of selectedLocations) {
		// Add the selected municipality itself
		municipalitySet.add(location.postalCode);
	}

	return municipalitySet;
}

/**
 * Check if a property/search ad is within radius of selected locations
 */
export function isWithinRadius(
	propertyLocation: {
		postalCode?: string;
		city?: string;
		lat?: number;
		lon?: number;
	},
	selectedLocations: LocationWithCoordinates[],
	radiusKm: number,
): boolean {
	if (!propertyLocation.lat || !propertyLocation.lon) {
		// Fallback to postal code matching if no coordinates
		if (propertyLocation.postalCode) {
			return selectedLocations.some(
				(loc) => loc.postalCode === propertyLocation.postalCode,
			);
		}
		return false;
	}

	// Check if property is within radius of ANY selected location
	return selectedLocations.some((location) => {
		const distance = calculateDistance(
			location.coordinates.lat,
			location.coordinates.lon,
			propertyLocation.lat!,
			propertyLocation.lon!,
		);
		return distance <= radiusKm;
	});
}

/**
 * Get combined bounding box for multiple municipalities
 */
export function getCombinedBoundingBox(
	municipalities: FrenchMunicipality[],
	radiusKm: number,
): {
	minLat: number;
	maxLat: number;
	minLon: number;
	maxLon: number;
} | null {
	if (municipalities.length === 0) return null;

	let minLat = Infinity;
	let maxLat = -Infinity;
	let minLon = Infinity;
	let maxLon = -Infinity;

	municipalities.forEach((municipality) => {
		const { lat, lon } = municipality.coordinates;

		// Expand by radius
		const latDelta = radiusKm / 111;
		const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

		minLat = Math.min(minLat, lat - latDelta);
		maxLat = Math.max(maxLat, lat + latDelta);
		minLon = Math.min(minLon, lon - lonDelta);
		maxLon = Math.max(maxLon, lon + lonDelta);
	});

	return { minLat, maxLat, minLon, maxLon };
}
