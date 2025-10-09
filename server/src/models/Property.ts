import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IProperty extends Document {
	title: string;
	description: string;
	price: number;
	surface: number; // in m²
	propertyType:
		| 'Appartement'
		| 'Maison'
		| 'Terrain'
		| 'Local commercial'
		| 'Bureaux';
	transactionType: 'Vente' | 'Location';

	// Location
	address: string;
	city: string;
	postalCode: string;
	sector: string;

	// Property details
	rooms?: number;
	bedrooms?: number;
	bathrooms?: number;
	floor?: number;
	totalFloors?: number;

	// Features
	hasParking: boolean;
	hasGarden: boolean;
	hasElevator: boolean;
	hasBalcony: boolean;
	hasTerrace: boolean;
	hasGarage: boolean;

	// Energy
	energyRating?:
		| 'A'
		| 'B'
		| 'C'
		| 'D'
		| 'E'
		| 'F'
		| 'G'
		| 'Non soumis au DPE';
	gasEmissionClass?:
		| 'A'
		| 'B'
		| 'C'
		| 'D'
		| 'E'
		| 'F'
		| 'G'
		| 'Non soumis au DPE';

	// Property condition and characteristics
	condition?: 'new' | 'good' | 'refresh' | 'renovate';
	propertyNature?: string;
	characteristics?: string;
	saleType?: 'ancien' | 'viager';

	// Financial info
	feesResponsibility?: 'buyer' | 'seller';
	annualCondoFees?: number;
	tariffLink?: string;

	// Additional property details
	landArea?: number; // Surface totale du terrain in m²
	levels?: number; // Nombre de niveaux
	parkingSpaces?: number; // Places de parking
	exterior?: ('garden' | 'balcony' | 'terrace' | 'courtyard' | 'none')[];
	availableFromDate?: string; // Date string MM/YYYY format

	// Images
	mainImage: {
		url: string;
		key: string;
	};
	galleryImages: Array<{
		url: string;
		key: string;
	}>;

	// Legacy support for old URL format
	images?: string[];

	// Owner/Creator
	owner: mongoose.Types.ObjectId | IUser;

	// Status
	status: 'active' | 'sold' | 'rented' | 'draft' | 'archived';

	// Tags and badges
	badges: string[];
	isFeatured: boolean;

	// Dates
	availableFrom?: Date;
	publishedAt?: Date;

	// Views and favorites
	viewCount: number;
	favoriteCount: number;

	// Additional info
	yearBuilt?: number;
	heatingType?: string;
	orientation?: string;

	// Client Information (visible only in collaboration)
	clientInfo?: {
		// Commercial details
		commercialDetails?: {
			strengths?: string; // Points forts à mettre en avant
			weaknesses?: string; // Points faibles connus
			occupancyStatus?: 'occupied' | 'vacant'; // Bien occupé ou vide
			openToLowerOffers?: boolean; // Ouvert à une offre "coup de coeur"
		};
		// Property history
		propertyHistory?: {
			listingDate?: string; // Date de mise en vente (DD/MM/YYYY)
			lastVisitDate?: string; // Date de la dernière visite (DD/MM/YYYY)
			totalVisits?: number; // Nombre total de visites
			visitorFeedback?: string; // Retour des précédents visiteurs
			priceReductions?: string; // Historique des baisses de prix
		};
		// Owner information
		ownerInfo?: {
			urgentToSell?: boolean; // Pressés de vendre
			openToNegotiation?: boolean; // Ouverts à la négociation
			mandateType?: 'exclusive' | 'simple' | 'shared'; // Type de mandat
			saleReasons?: string; // Raisons de la vente
			presentDuringVisits?: boolean; // Présents pendant les visites
			flexibleSchedule?: boolean; // Souples sur horaires de visite
			acceptConditionalOffers?: boolean; // Acceptent propositions avec conditions
		};
	};

	createdAt: Date;
	updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
	{
		title: {
			type: String,
			required: [true, 'Le titre est requis'],
			trim: true,
			minlength: [10, 'Le titre doit contenir au moins 10 caractères'],
			maxlength: [200, 'Le titre doit contenir moins de 200 caractères'],
		},
		description: {
			type: String,
			required: [true, 'La description est requise'],
			trim: true,
			minlength: [
				50,
				'La description doit contenir au moins 50 caractères',
			],
			maxlength: [
				2000,
				'La description doit contenir moins de 2000 caractères',
			],
		},
		price: {
			type: Number,
			required: [true, 'Le prix est requis'],
			min: [1000, 'Le prix minimum est de 1000€'],
			max: [50000000, 'Le prix maximum est de 50,000,000€'],
		},
		surface: {
			type: Number,
			required: [true, 'La surface est requise'],
			min: [1, 'La surface minimum est de 1 m²'],
			max: [10000, 'La surface maximum est de 10,000 m²'],
		},
		propertyType: {
			type: String,
			enum: {
				values: [
					'Appartement',
					'Maison',
					'Terrain',
					'Local commercial',
					'Bureaux',
				],
				message: 'Type de bien invalide',
			},
			required: [true, 'Le type de bien est requis'],
		},
		transactionType: {
			type: String,
			enum: {
				values: ['Vente', 'Location'],
				message: 'Type de transaction invalide',
			},
			required: [true, 'Le type de transaction est requis'],
			default: 'Vente',
		},

		// Location fields
		address: {
			type: String,
			required: [true, "L'adresse est requise"],
			trim: true,
			maxlength: [200, "L'adresse est trop longue"],
		},
		city: {
			type: String,
			required: [true, 'La ville est requise'],
			trim: true,
			maxlength: [100, 'Le nom de ville est trop long'],
		},
		postalCode: {
			type: String,
			required: [true, 'Le code postal est requis'],
			match: [/^[0-9]{5}$/, 'Code postal doit contenir 5 chiffres'],
		},
		sector: {
			type: String,
			required: [true, 'Le secteur est requis'],
			trim: true,
			maxlength: [100, 'Le secteur est trop long'],
		},

		// Property details
		rooms: {
			type: Number,
			min: [1, 'Nombre de pièces minimum: 1'],
			max: [50, 'Nombre de pièces maximum: 50'],
		},
		bedrooms: {
			type: Number,
			min: [0, 'Nombre de chambres minimum: 0'],
			max: [20, 'Nombre de chambres maximum: 20'],
		},
		bathrooms: {
			type: Number,
			min: [0, 'Nombre de salles de bain minimum: 0'],
			max: [10, 'Nombre de salles de bain maximum: 10'],
		},
		floor: {
			type: Number,
			min: [-5, 'Étage minimum: -5'],
			max: [100, 'Étage maximum: 100'],
		},
		totalFloors: {
			type: Number,
			min: [1, "Nombre d'étages minimum: 1"],
			max: [200, "Nombre d'étages maximum: 200"],
		},

		// Features
		hasParking: {
			type: Boolean,
			default: false,
		},
		hasGarden: {
			type: Boolean,
			default: false,
		},
		hasElevator: {
			type: Boolean,
			default: false,
		},
		hasBalcony: {
			type: Boolean,
			default: false,
		},
		hasTerrace: {
			type: Boolean,
			default: false,
		},
		hasGarage: {
			type: Boolean,
			default: false,
		},

		// Energy
		energyRating: {
			type: String,
			enum: {
				values: [
					'A',
					'B',
					'C',
					'D',
					'E',
					'F',
					'G',
					'Non soumis au DPE',
				],
				message: 'Classe énergétique invalide',
			},
		},
		gasEmissionClass: {
			type: String,
			enum: {
				values: [
					'A',
					'B',
					'C',
					'D',
					'E',
					'F',
					'G',
					'Non soumis au DPE',
				],
				message: 'Classe GES invalide',
			},
		},

		// Property condition and characteristics
		condition: {
			type: String,
			enum: {
				values: ['new', 'good', 'refresh', 'renovate'],
				message: 'État du bien invalide',
			},
		},
		propertyNature: {
			type: String,
			trim: true,
			maxlength: [100, 'Nature du bien trop longue'],
		},
		characteristics: {
			type: String,
			trim: true,
			maxlength: [200, 'Caractéristiques trop longues'],
		},
		saleType: {
			type: String,
			enum: {
				values: ['ancien', 'viager'],
				message: 'Type de vente invalide',
			},
		},

		// Financial info
		feesResponsibility: {
			type: String,
			enum: {
				values: ['buyer', 'seller'],
				message: 'Responsabilité des honoraires invalide',
			},
		},
		annualCondoFees: {
			type: Number,
			min: [0, 'Les charges ne peuvent pas être négatives'],
			max: [100000, 'Charges annuelles trop élevées'],
		},
		tariffLink: {
			type: String,
			trim: true,
			maxlength: [500, 'Lien des tarifs trop long'],
		},

		// Additional property details
		landArea: {
			type: Number,
			min: [1, 'Surface du terrain minimum: 1 m²'],
			max: [1000000, 'Surface du terrain maximum: 1,000,000 m²'],
		},
		levels: {
			type: Number,
			min: [1, 'Nombre de niveaux minimum: 1'],
			max: [20, 'Nombre de niveaux maximum: 20'],
		},
		parkingSpaces: {
			type: Number,
			min: [0, 'Nombre de places de parking minimum: 0'],
			max: [50, 'Nombre de places de parking maximum: 50'],
		},
		exterior: [
			{
				type: String,
				enum: {
					values: [
						'garden',
						'balcony',
						'terrace',
						'courtyard',
						'none',
					],
					message: "Type d'extérieur invalide",
				},
			},
		],
		availableFromDate: {
			type: String,
			trim: true,
			match: [
				/^\d{2}\/\d{4}$/,
				'Format de date invalide (MM/YYYY attendu)',
			],
		},

		// Images
		mainImage: {
			type: {
				url: { type: String, required: true },
				key: { type: String, required: true },
			},
			required: [true, "L'image principale est requise"],
		},
		galleryImages: [
			{
				url: { type: String, required: true },
				key: { type: String, required: true },
			},
		], // Legacy support for old URL format
		images: {
			type: [String],
			default: [],
		},

		// Owner
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Le propriétaire est requis'],
		},

		// Status
		status: {
			type: String,
			enum: {
				values: ['active', 'sold', 'rented', 'draft', 'archived'],
				message: 'Statut invalide',
			},
			default: 'draft',
		},

		// Tags and badges
		badges: {
			type: [String],
			default: [],
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},

		// Dates
		availableFrom: {
			type: Date,
			default: Date.now,
		},
		publishedAt: {
			type: Date,
		},

		// Stats
		viewCount: {
			type: Number,
			default: 0,
			min: [0, 'Le nombre de vues ne peut pas être négatif'],
		},
		favoriteCount: {
			type: Number,
			default: 0,
			min: [0, 'Le nombre de favoris ne peut pas être négatif'],
		},

		// Additional info
		yearBuilt: {
			type: Number,
			min: [1800, 'Année de construction minimum: 1800'],
			max: [
				new Date().getFullYear() + 5,
				'Année de construction invalide',
			],
		},
		heatingType: {
			type: String,
			trim: true,
			maxlength: [100, 'Type de chauffage trop long'],
		},
		orientation: {
			type: String,
			enum: {
				values: [
					'Nord',
					'Sud',
					'Est',
					'Ouest',
					'Nord-Est',
					'Nord-Ouest',
					'Sud-Est',
					'Sud-Ouest',
				],
				message: 'Orientation invalide',
			},
		},

		// Client Information (visible only in collaboration)
		clientInfo: {
			type: {
				commercialDetails: {
					type: {
						strengths: {
							type: String,
							trim: true,
							maxlength: [1000, 'Points forts trop longs'],
						},
						weaknesses: {
							type: String,
							trim: true,
							maxlength: [1000, 'Points faibles trop longs'],
						},
						occupancyStatus: {
							type: String,
							enum: {
								values: ['occupied', 'vacant'],
								message: "Statut d'occupation invalide",
							},
						},
						openToLowerOffers: { type: Boolean, default: false },
					},
				},
				propertyHistory: {
					type: {
						listingDate: { type: String, trim: true },
						lastVisitDate: { type: String, trim: true },
						totalVisits: {
							type: Number,
							min: [0, 'Nombre de visites minimum: 0'],
						},
						visitorFeedback: {
							type: String,
							trim: true,
							maxlength: [2000, 'Retour visiteurs trop long'],
						},
						priceReductions: {
							type: String,
							trim: true,
							maxlength: [1000, 'Historique prix trop long'],
						},
					},
				},
				ownerInfo: {
					type: {
						urgentToSell: { type: Boolean, default: false },
						openToNegotiation: { type: Boolean, default: false },
						mandateType: {
							type: String,
							enum: {
								values: ['exclusive', 'simple', 'shared'],
								message: 'Type de mandat invalide',
							},
						},
						saleReasons: {
							type: String,
							trim: true,
							maxlength: [500, 'Raisons de vente trop longues'],
						},
						presentDuringVisits: { type: Boolean, default: false },
						flexibleSchedule: { type: Boolean, default: false },
						acceptConditionalOffers: {
							type: Boolean,
							default: false,
						},
					},
				},
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

// Indexes for better query performance
propertySchema.index({ owner: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ city: 1 });
propertySchema.index({ postalCode: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ surface: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ publishedAt: -1 });

// Compound indexes
propertySchema.index({ status: 1, propertyType: 1 });
propertySchema.index({ city: 1, propertyType: 1 });
propertySchema.index({ price: 1, propertyType: 1 });

// Text search index
propertySchema.index({
	title: 'text',
	description: 'text',
	city: 'text',
	sector: 'text',
});

// Virtual for formatted price
propertySchema.virtual('formattedPrice').get(function (this: IProperty) {
	return this.price.toLocaleString('fr-FR') + ' €';
});

// Virtual for display surface
propertySchema.virtual('displaySurface').get(function (this: IProperty) {
	return this.surface + ' m²';
});

// Virtual to check if property is new (less than 7 days old)
propertySchema.virtual('isNewProperty').get(function (this: IProperty) {
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	return this.createdAt >= sevenDaysAgo;
});

// Middleware to set publishedAt when status changes to active
propertySchema.pre('save', function (this: IProperty, next) {
	if (
		this.isModified('status') &&
		this.status === 'active' &&
		!this.publishedAt
	) {
		this.publishedAt = new Date();
	}
	next();
});

// Static method to find active properties
propertySchema.statics.findActiveProperties = function () {
	return this.find({ status: 'active' }).populate(
		'owner',
		'firstName lastName email profileImage',
	);
};

// Static method to find properties by location
propertySchema.statics.findByLocation = function (
	city?: string,
	postalCode?: string,
) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const query: any = { status: 'active' };

	if (city) {
		query.city = new RegExp(city, 'i');
	}

	if (postalCode) {
		query.postalCode = postalCode;
	}

	return this.find(query).populate(
		'owner',
		'firstName lastName email profileImage',
	);
};

// Instance method to increment view count
propertySchema.methods.incrementViews = function (this: IProperty) {
	this.viewCount += 1;
	return this.save();
};

export const Property = mongoose.model<IProperty>('Property', propertySchema);
