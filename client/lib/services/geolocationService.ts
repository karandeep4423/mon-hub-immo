/**
 * Geolocation Service
 * Handles browser geolocation for finding nearby posts
 */

export interface GeolocationResult {
	latitude: number;
	longitude: number;
	accuracy: number; // in meters
}

export interface GeolocationError {
	code: number;
	message: string;
}

/**
 * Request user's current location via browser geolocation API
 */
export async function requestGeolocation(): Promise<GeolocationResult> {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject({
				code: -1,
				message: 'Geolocation not supported by browser',
			});
			return;
		}

		console.log('[Geolocation] Requesting user location...');

		navigator.geolocation.getCurrentPosition(
			(position) => {
				console.log('[Geolocation] Location granted:', {
					lat: position.coords.latitude,
					lon: position.coords.longitude,
					accuracy: position.coords.accuracy,
				});

				resolve({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
					accuracy: position.coords.accuracy,
				});
			},
			(error) => {
				console.error('[Geolocation] Error:', error.message);

				const errorMessages: Record<number, string> = {
					1: 'Permission refusée. Vous pouvez activer la localisation dans les paramètres de votre navigateur.',
					2: 'Position indisponible. Vérifiez votre connexion.',
					3: "Délai d'attente dépassé. Veuillez réessayer.",
				};

				reject({
					code: error.code,
					message:
						errorMessages[error.code] ||
						'Erreur lors de la récupération de votre position',
				});
			},
			{
				enableHighAccuracy: false,
				timeout: 10000, // 10 seconds
				maximumAge: 300000, // 5 minutes cache
			},
		);
	});
}

/**
 * Check if geolocation permission has been granted
 */
export async function checkGeolocationPermission(): Promise<
	'granted' | 'denied' | 'prompt'
> {
	if (!navigator.permissions) {
		return 'prompt';
	}

	try {
		const result = await navigator.permissions.query({
			name: 'geolocation',
		});
		console.log('[Geolocation] Permission status:', result.state);
		return result.state as 'granted' | 'denied' | 'prompt';
	} catch (error) {
		console.error('[Geolocation] Error checking permission:', error);
		return 'prompt';
	}
}

/**
 * Store geolocation preference in localStorage
 */
export function setGeolocationPreference(allowed: boolean): void {
	localStorage.setItem(
		'geolocation_preference',
		allowed ? 'allowed' : 'denied',
	);
}

/**
 * Get stored geolocation preference
 */
export function getGeolocationPreference(): 'allowed' | 'denied' | null {
	const pref = localStorage.getItem('geolocation_preference');
	return pref as 'allowed' | 'denied' | null;
}
