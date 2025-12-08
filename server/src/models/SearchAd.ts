import { Schema, model, Document, Types } from 'mongoose';
import { htmlTextLength } from '../utils/sanitize';

export interface ISearchAd extends Document {
	authorId: Types.ObjectId;
	authorType: 'agent' | 'apporteur' | 'admin';
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
	location?: {
		cities: string[];
		postalCodes?: string[]; // Codes postaux
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
	budget?: {
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
	badges?: string[]; // Badges pour l'annonce

	// Client Information
	clientInfo?: {
		// Qualification information
		qualificationInfo?: {
			clientName?: string; // Nom / Prénom
			clientStatus?: 'particulier' | 'investisseur' | 'entreprise'; // Statut
			profession?: string; // Profession / Situation professionnelle
			projectType?: 'couple' | 'seul'; // Projet en couple ou seul
			hasRealEstateAgent?: boolean; // Avez-vous déjà un agent immobilier ?
			hasVisitedProperties?: boolean; // Avez-vous déjà visité des biens ?
		};
		// Timeline information
		timelineInfo?: {
			urgency?: 'immediat' | '3_mois' | '6_mois' | 'pas_presse'; // Urgence du projet
			visitAvailability?: string; // Disponibilités pour les visites
			idealMoveInDate?: string; // Date idéale d'emménagement (MM/YYYY)
		};
	};

	createdAt: Date;
	updatedAt: Date;
}

const SearchAdSchema = new Schema<ISearchAd>(
	{
		authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		authorType: {
			type: String,
			enum: ['agent', 'apporteur', 'admin'],
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
			type: {
				cities: [{ type: String }],
				postalCodes: [{ type: String }],
				maxDistance: { type: Number },
				openToOtherAreas: { type: Boolean, default: false },
			},
			required: false,
		},

		minRooms: { type: Number },
		minBedrooms: { type: Number },
		minSurface: { type: Number },
		hasExterior: { type: Boolean },
		hasParking: { type: Boolean },
		acceptedFloors: { type: String },
		desiredState: [{ type: String }],

		budget: {
			type: {
				max: { type: Number },
				ideal: { type: Number },
				financingType: { type: String },
				isSaleInProgress: { type: Boolean },
				hasBankApproval: { type: Boolean },
			},
			required: false,
		},

		priorities: {
			mustHaves: [{ type: String }],
			niceToHaves: [{ type: String }],
			dealBreakers: [{ type: String }],
		},

		title: { type: String, required: true, trim: true },
		description: {
			type: String,
			required: true,
			trim: true,
			validate: {
				validator: function (v: string) {
					if (!v) return true;
					const len = htmlTextLength(v);
					return len >= 10 && len <= 2000;
				},
				message:
					'La description doit contenir entre 10 et 2000 caractères de texte',
			},
		},
		badges: [{ type: String }],

		clientInfo: {
			type: {
				qualificationInfo: {
					type: {
						clientName: {
							type: String,
							trim: true,
							maxlength: 200,
						},
						clientStatus: {
							type: String,
							enum: {
								values: [
									'particulier',
									'investisseur',
									'entreprise',
								],
								message: 'Statut client invalide',
							},
						},
						profession: {
							type: String,
							trim: true,
							maxlength: 200,
						},
						projectType: {
							type: String,
							enum: {
								values: ['couple', 'seul'],
								message: 'Type de projet invalide',
							},
						},
						hasRealEstateAgent: { type: Boolean, default: false },
						hasVisitedProperties: { type: Boolean, default: false },
					},
				},
				timelineInfo: {
					type: {
						urgency: {
							type: String,
							enum: {
								values: [
									'immediat',
									'3_mois',
									'6_mois',
									'pas_presse',
								],
								message: 'Urgence invalide',
							},
						},
						visitAvailability: {
							type: String,
							trim: true,
							maxlength: 500,
						},
						idealMoveInDate: {
							type: String,
							trim: true,
							maxlength: 20,
						},
					},
				},
			},
		},
	},
	{ timestamps: true },
);

export const SearchAd = model<ISearchAd>('SearchAd', SearchAdSchema);
