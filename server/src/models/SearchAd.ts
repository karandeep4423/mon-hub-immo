import { Schema, model, Document, Types } from 'mongoose';

export interface ISearchAd extends Document {
	authorId: Types.ObjectId;
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
	propertyState: ('new' | 'old')[]; // Neuf ou ancien
	projectType: 'primary' | 'secondary' | 'investment'; // Résidence principale, etc.

	// --- Localisation ---
	location: {
		cities: string[];
		maxDistance?: number; // Distance max travail/écoles
		openToOtherAreas: boolean;
	};

	// --- Caractéristiques ---
	minRooms?: number;
	minBedrooms?: number;
	minSurface?: number;
	hasExterior: boolean; // jardin, terrasse, balcon
	hasParking: boolean;
	acceptedFloors?: string; // e.g., "any", "not_ground_floor"
	desiredState: ('new' | 'good' | 'refresh' | 'renovate')[]; // neuf, bon état, à rafraichir, à rénover

	// --- Budget & financement ---
	budget: {
		max: number;
		ideal?: number;
		financingType: 'loan' | 'cash' | 'pending';
		isSaleInProgress: boolean; // Vente en cascade
		hasBankApproval: boolean;
	};

	// --- Priorités personnelles ---
	priorities: {
		mustHaves: string[]; // 3 critères indispensables
		niceToHaves: string[]; // 3 critères secondaires
		dealBreakers: string[]; // Points de blocage absolus
	};

	// --- Admin & Display ---
	title: string;
	description: string;

	createdAt: Date;
	updatedAt: Date;
}

const SearchAdSchema = new Schema<ISearchAd>(
	{
		authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		authorType: {
			type: String,
			enum: ['agent', 'apporteur'],
			required: true,
		},
		status: {
			type: String,
			enum: [
				'active',
				'paused',
				'fulfilled',
				'sold',
				'rented',
				'archived',
			],
			default: 'active',
		},

		propertyTypes: [{ type: String, required: true }],
		propertyState: [{ type: String }],
		projectType: { type: String },

		location: {
			cities: [{ type: String, required: true }],
			maxDistance: { type: Number },
			openToOtherAreas: { type: Boolean, default: false },
		},

		minRooms: { type: Number },
		minBedrooms: { type: Number },
		minSurface: { type: Number },
		hasExterior: { type: Boolean },
		hasParking: { type: Boolean },
		acceptedFloors: { type: String },
		desiredState: [{ type: String }],

		budget: {
			max: { type: Number, required: true },
			ideal: { type: Number },
			financingType: { type: String },
			isSaleInProgress: { type: Boolean },
			hasBankApproval: { type: Boolean },
		},

		priorities: {
			mustHaves: [{ type: String }],
			niceToHaves: [{ type: String }],
			dealBreakers: [{ type: String }],
		},

		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
	},
	{ timestamps: true },
);

export const SearchAd = model<ISearchAd>('SearchAd', SearchAdSchema);
