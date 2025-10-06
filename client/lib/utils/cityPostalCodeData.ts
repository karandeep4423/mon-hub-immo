// French postal code and city data utilities

export interface CityPostalCode {
	city: string;
	postalCode: string;
}

// Extended database of French cities with postal codes
// This is a sample - in production, you'd use an API like api-adresse.data.gouv.fr
export const FRENCH_CITIES_DB: CityPostalCode[] = [
	// Major cities
	{ city: 'Paris', postalCode: '75001' },
	{ city: 'Paris', postalCode: '75002' },
	{ city: 'Paris', postalCode: '75003' },
	{ city: 'Paris', postalCode: '75004' },
	{ city: 'Paris', postalCode: '75005' },
	{ city: 'Paris', postalCode: '75006' },
	{ city: 'Paris', postalCode: '75007' },
	{ city: 'Paris', postalCode: '75008' },
	{ city: 'Paris', postalCode: '75009' },
	{ city: 'Paris', postalCode: '75010' },
	{ city: 'Paris', postalCode: '75011' },
	{ city: 'Paris', postalCode: '75012' },
	{ city: 'Paris', postalCode: '75013' },
	{ city: 'Paris', postalCode: '75014' },
	{ city: 'Paris', postalCode: '75015' },
	{ city: 'Paris', postalCode: '75016' },
	{ city: 'Paris', postalCode: '75017' },
	{ city: 'Paris', postalCode: '75018' },
	{ city: 'Paris', postalCode: '75019' },
	{ city: 'Paris', postalCode: '75020' },
	{ city: 'Marseille', postalCode: '13001' },
	{ city: 'Marseille', postalCode: '13002' },
	{ city: 'Marseille', postalCode: '13003' },
	{ city: 'Marseille', postalCode: '13004' },
	{ city: 'Marseille', postalCode: '13005' },
	{ city: 'Marseille', postalCode: '13006' },
	{ city: 'Lyon', postalCode: '69001' },
	{ city: 'Lyon', postalCode: '69002' },
	{ city: 'Lyon', postalCode: '69003' },
	{ city: 'Lyon', postalCode: '69004' },
	{ city: 'Lyon', postalCode: '69005' },
	{ city: 'Lyon', postalCode: '69006' },
	{ city: 'Lyon', postalCode: '69007' },
	{ city: 'Lyon', postalCode: '69008' },
	{ city: 'Lyon', postalCode: '69009' },
	{ city: 'Toulouse', postalCode: '31000' },
	{ city: 'Toulouse', postalCode: '31100' },
	{ city: 'Toulouse', postalCode: '31200' },
	{ city: 'Toulouse', postalCode: '31300' },
	{ city: 'Nice', postalCode: '06000' },
	{ city: 'Nice', postalCode: '06100' },
	{ city: 'Nice', postalCode: '06200' },
	{ city: 'Nice', postalCode: '06300' },
	{ city: 'Nantes', postalCode: '44000' },
	{ city: 'Nantes', postalCode: '44100' },
	{ city: 'Nantes', postalCode: '44200' },
	{ city: 'Nantes', postalCode: '44300' },

	// Île-de-France suburbs
	{ city: 'Boulogne-Billancourt', postalCode: '92100' },
	{ city: 'Issy-les-Moulineaux', postalCode: '92130' },
	{ city: 'Neuilly-sur-Seine', postalCode: '92200' },
	{ city: 'Levallois-Perret', postalCode: '92300' },
	{ city: 'Clichy', postalCode: '92110' },
	{ city: 'Courbevoie', postalCode: '92400' },
	{ city: 'Colombes', postalCode: '92700' },
	{ city: 'Versailles', postalCode: '78000' },
	{ city: 'Saint-Denis', postalCode: '93200' },
	{ city: 'Montreuil', postalCode: '93100' },
	{ city: 'Créteil', postalCode: '94000' },
	{ city: 'Nanterre', postalCode: '92000' },

	// Brittany
	{ city: 'Dinan', postalCode: '22100' },
	{ city: 'Plerguer', postalCode: '35540' },
	{ city: 'Rennes', postalCode: '35000' },
	{ city: 'Rennes', postalCode: '35200' },
	{ city: 'Rennes', postalCode: '35700' },
	{ city: 'Saint-Malo', postalCode: '35400' },
	{ city: 'Brest', postalCode: '29200' },
	{ city: 'Quimper', postalCode: '29000' },
	{ city: 'Vannes', postalCode: '56000' },
	{ city: 'Lorient', postalCode: '56100' },

	// Other major cities
	{ city: 'Strasbourg', postalCode: '67000' },
	{ city: 'Montpellier', postalCode: '34000' },
	{ city: 'Bordeaux', postalCode: '33000' },
	{ city: 'Lille', postalCode: '59000' },
	{ city: 'Roubaix', postalCode: '59100' },
	{ city: 'Tourcoing', postalCode: '59200' },
	{ city: 'Reims', postalCode: '51100' },
	{ city: 'Le Havre', postalCode: '76600' },
	{ city: 'Saint-Étienne', postalCode: '42000' },
	{ city: 'Toulon', postalCode: '83000' },
	{ city: 'Grenoble', postalCode: '38000' },
	{ city: 'Dijon', postalCode: '21000' },
	{ city: 'Angers', postalCode: '49000' },
	{ city: 'Nîmes', postalCode: '30000' },
	{ city: 'Villeurbanne', postalCode: '69100' },
	{ city: 'Clermont-Ferrand', postalCode: '63000' },
	{ city: 'Aix-en-Provence', postalCode: '13090' },
	{ city: 'Le Mans', postalCode: '72000' },
	{ city: 'Tours', postalCode: '37000' },
	{ city: 'Amiens', postalCode: '80000' },
	{ city: 'Limoges', postalCode: '87000' },
	{ city: 'Annecy', postalCode: '74000' },
	{ city: 'Perpignan', postalCode: '66000' },
	{ city: 'Besançon', postalCode: '25000' },
	{ city: 'Orléans', postalCode: '45000' },
	{ city: 'Metz', postalCode: '57000' },
	{ city: 'Rouen', postalCode: '76000' },
	{ city: 'Mulhouse', postalCode: '68100' },
	{ city: 'Caen', postalCode: '14000' },
	{ city: 'Nancy', postalCode: '54000' },
	{ city: 'Argenteuil', postalCode: '95100' },
	{ city: 'Saint-Denis', postalCode: '97400' },
	{ city: 'Montreuil', postalCode: '93100' },
];

/**
 * Search cities by name or postal code
 * @param query Search query (city name or postal code)
 * @param limit Maximum number of results
 * @returns Array of matching cities with postal codes
 */
export function searchCities(
	query: string,
	limit: number = 10,
): CityPostalCode[] {
	if (!query || query.trim().length === 0) {
		return [];
	}

	const searchLower = query.toLowerCase().trim();
	const isNumeric = /^\d+$/.test(searchLower);

	const matches = FRENCH_CITIES_DB.filter((item) => {
		if (isNumeric) {
			return item.postalCode.startsWith(searchLower);
		} else {
			return item.city.toLowerCase().includes(searchLower);
		}
	});

	// Remove duplicates and limit results
	const seen = new Set<string>();
	const unique: CityPostalCode[] = [];

	for (const match of matches) {
		const key = `${match.city}-${match.postalCode}`;
		if (!seen.has(key)) {
			seen.add(key);
			unique.push(match);
			if (unique.length >= limit) break;
		}
	}

	return unique;
}

/**
 * Get city name from postal code
 * @param postalCode Postal code to lookup
 * @returns City name or null if not found
 */
export function getCityFromPostalCode(postalCode: string): string | null {
	const found = FRENCH_CITIES_DB.find(
		(item) => item.postalCode === postalCode,
	);
	return found ? found.city : null;
}

/**
 * Get postal codes for a city
 * @param city City name
 * @returns Array of postal codes for the city
 */
export function getPostalCodesForCity(city: string): string[] {
	return FRENCH_CITIES_DB.filter(
		(item) => item.city.toLowerCase() === city.toLowerCase(),
	).map((item) => item.postalCode);
}
