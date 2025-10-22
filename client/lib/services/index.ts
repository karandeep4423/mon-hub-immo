/**
 * Services Barrel Export
 * Centralized exports for utility services
 */

export type {
	AddressSearchResult,
	FrenchMunicipality,
} from './frenchAddressApi';
export type { GeolocationResult, GeolocationError } from './geolocationService';
export {
	requestGeolocation,
	checkGeolocationPermission,
	setGeolocationPreference,
	getGeolocationPreference,
} from './geolocationService';
