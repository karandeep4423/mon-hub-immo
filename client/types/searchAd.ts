// This will be the main type for our SearchAd on the client-side
// It should mirror the ISearchAd interface from the server model, but without Mongoose-specific types.

export interface SearchAd {
	_id: string;
	authorId: {
		_id: string;
		firstName: string;
		lastName: string;
		avatar?: string;
	};
	authorType: 'agent' | 'apporteur';
	status: 'active' | 'paused' | 'fulfilled' | 'sold' | 'rented' | 'archived';

	// --- Critères de recherche ---
	propertyTypes: (
		| 'house'
		| 'apartment'
		| 'land'
		| 'building'
		| 'commercial'
	)[];
	propertyState?: ('new' | 'old')[];
	projectType?: 'primary' | 'secondary' | 'investment';

	// --- Localisation ---
	location: {
		cities: string[];
		maxDistance?: number;
		openToOtherAreas?: boolean;
	};

	// --- Caractéristiques ---
	minRooms?: number;
	minBedrooms?: number;
	minSurface?: number;
	hasExterior?: boolean;
	hasParking?: boolean;
	acceptedFloors?: string;
	desiredState?: ('new' | 'good' | 'refresh' | 'renovate')[];

	// --- Budget & financement ---
	budget: {
		max: number;
		ideal?: number;
		financingType?: 'loan' | 'cash' | 'pending';
		isSaleInProgress?: boolean;
		hasBankApproval?: boolean;
	};

	// --- Priorités personnelles ---
	priorities?: {
		mustHaves: string[];
		niceToHaves: string[];
		dealBreakers: string[];
	};

	// --- Admin & Display ---
	title: string;
	description?: string;

	createdAt: string; // Dates will be strings from the API
	updatedAt: string;
}
