// This will be the main type for our SearchAd on the client-side
// It should mirror the ISearchAd interface from the server model, but without Mongoose-specific types.

export interface SearchAd {
	_id: string;
	authorId: {
		_id: string;
		firstName: string;
		lastName: string;
		profileImage?: string;
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
		postalCodes?: string[];
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

	// Client Information
	clientInfo?: {
		qualificationInfo?: {
			clientName?: string; // Nom / Prénom
			clientStatus?: 'particulier' | 'investisseur' | 'entreprise'; // Statut
			profession?: string; // Profession / Situation professionnelle
			projectType?: 'couple' | 'seul'; // Projet en couple ou seul
			hasRealEstateAgent?: boolean; // Avez-vous déjà un agent immobilier ?
			hasVisitedProperties?: boolean; // Avez-vous déjà visité des biens ?
		};
		timelineInfo?: {
			urgency?: 'immediat' | '3_mois' | '6_mois' | 'pas_presse'; // Urgence du projet
			visitAvailability?: string; // Disponibilités pour les visites
			idealMoveInDate?: string; // Date idéale d'emménagement (MM/YYYY)
		};
	};

	createdAt: string; // Dates will be strings from the API
	updatedAt: string;
}
