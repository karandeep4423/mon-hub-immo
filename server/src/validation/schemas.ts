import { z } from 'zod';

// Shared helpers
const mongoId = z.string().regex(/^[a-f\d]{24}$/i, 'ID invalide');
const frenchPostalCode = z.string().regex(/^\d{5}$/i, 'Code postal invalide');

// Auth
export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export const signupSchema = z
	.object({
		firstName: z.string().min(2).max(50).trim(),
		lastName: z.string().min(2).max(50).trim(),
		email: z.string().email().toLowerCase().trim(),
		password: z.string().min(8).max(128),
		phone: z
			.string()
			.regex(/^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/)
			.optional()
			.or(z.literal('').transform(() => undefined)),
		userType: z.enum(['agent', 'apporteur']),
		confirmPassword: z.string().optional(),
	})
	.refine(
		(data) =>
			!data.confirmPassword || data.password === data.confirmPassword,
		{
			message: "Passwords don't match",
			path: ['confirmPassword'],
		},
	);

// Property
export const propertyBaseSchema = z.object({
	title: z.string().min(10).max(200),
	description: z.string().min(50).max(2000),
	price: z.number().min(1000).max(50_000_000),
	surface: z.number().min(1).max(10_000),
	propertyType: z.enum([
		'Appartement',
		'Maison',
		'Terrain',
		'Local commercial',
		'Bureaux',
	]),
	transactionType: z.enum(['Vente', 'Location']).optional(),
	address: z.string().min(5).max(200).optional(),
	city: z.string().min(2).max(100),
	postalCode: frenchPostalCode.optional(),
	sector: z.string().min(2).max(100),
	mainImage: z.string().url(),
	images: z.array(z.string().url()).optional(),
	rooms: z.number().int().min(1).max(50).optional(),
	bedrooms: z.number().int().min(0).max(20).optional(),
	bathrooms: z.number().int().min(0).max(10).optional(),
	floor: z.number().int().min(-5).max(100).optional(),
	totalFloors: z.number().int().min(1).max(200).optional(),
	energyRating: z
		.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Non soumis au DPE'])
		.optional(),
	gasEmissionClass: z
		.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Non soumis au DPE'])
		.optional(),
	yearBuilt: z
		.number()
		.int()
		.min(1800)
		.max(new Date().getFullYear() + 5)
		.optional(),
	heatingType: z.string().max(100).optional(),
	orientation: z
		.enum([
			'Nord',
			'Sud',
			'Est',
			'Ouest',
			'Nord-Est',
			'Nord-Ouest',
			'Sud-Est',
			'Sud-Ouest',
		])
		.optional(),
	hasParking: z.boolean().optional(),
	hasGarden: z.boolean().optional(),
	hasElevator: z.boolean().optional(),
	hasBalcony: z.boolean().optional(),
	hasTerrace: z.boolean().optional(),
	hasGarage: z.boolean().optional(),

	// New fields from screenshots
	condition: z.enum(['new', 'good', 'refresh', 'renovate']).optional(),
	propertyNature: z.string().max(100).optional(),
	saleType: z.string().max(100).optional(),
	annualCondoFees: z.number().min(0).max(100000).optional(),
	tariffLink: z.string().max(500).optional(),
	landArea: z.number().min(1).max(1000000).optional(),
	levels: z.number().int().min(1).max(20).optional(),
	parkingSpaces: z.number().int().min(0).max(50).optional(),
	exterior: z
		.array(z.enum(['garden', 'balcony', 'terrace', 'courtyard', 'none']))
		.optional(),
	availableFromDate: z
		.string()
		.regex(/^\d{2}\/\d{4}$/)
		.optional(),

	// Client Information
	clientInfo: z
		.object({
			commercialDetails: z
				.object({
					strengths: z.string().max(1000).optional(),
					weaknesses: z.string().max(1000).optional(),
					occupancyStatus: z.enum(['occupied', 'vacant']).optional(),
					openToLowerOffers: z.boolean().optional(),
				})
				.optional(),
			propertyHistory: z
				.object({
					listingDate: z.string().optional(),
					lastVisitDate: z.string().optional(),
					totalVisits: z.number().int().min(0).optional(),
					visitorFeedback: z.string().max(2000).optional(),
					priceReductions: z.string().max(1000).optional(),
				})
				.optional(),
			ownerInfo: z
				.object({
					urgentToSell: z.boolean().optional(),
					openToNegotiation: z.boolean().optional(),
					mandateType: z
						.enum(['exclusive', 'simple', 'shared'])
						.optional(),
					saleReasons: z.string().max(500).optional(),
					presentDuringVisits: z.boolean().optional(),
					flexibleSchedule: z.boolean().optional(),
					acceptConditionalOffers: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),

	badges: z.array(z.string()).optional(),
	isFeatured: z.boolean().optional(),
	status: z
		.enum(['active', 'sold', 'rented', 'draft', 'archived'])
		.optional(),
});

export const createPropertySchema = propertyBaseSchema.required({
	title: true,
	description: true,
	price: true,
	surface: true,
	propertyType: true,
	address: true,
	city: true,
	postalCode: true,
	sector: true,
	mainImage: true,
});

export const updatePropertySchema = propertyBaseSchema.partial();

export const updatePropertyStatusSchema = z.object({
	status: z.enum(['active', 'sold', 'rented', 'draft', 'archived']),
});

// Collaboration
export const proposeCollaborationSchema = z.object({
	propertyId: mongoId,
	collaboratorId: mongoId.optional(),
	commissionPercentage: z.number().min(0).max(100),
	message: z.string().max(500).optional(),
});

export const collaborationIdParam = z.object({ id: mongoId });
export const propertyIdParam = z.object({ propertyId: mongoId });

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type ProposeCollaborationInput = z.infer<
	typeof proposeCollaborationSchema
>;

// Search Ads
export const searchAdBaseSchema = z.object({
	title: z.string().min(5).max(200),
	description: z.string().min(10).max(2000).optional(),
	propertyTypes: z
		.array(z.enum(['house', 'apartment', 'land', 'building', 'commercial']))
		.min(1),
	propertyState: z.array(z.enum(['new', 'old'])).optional(),
	projectType: z.enum(['primary', 'secondary', 'investment']).optional(),
	location: z.object({
		cities: z.array(z.string()).min(1),
		maxDistance: z.number().min(0).max(500).optional(),
		openToOtherAreas: z.boolean().optional(),
	}),
	minRooms: z.number().int().min(1).max(50).optional(),
	minBedrooms: z.number().int().min(1).max(20).optional(),
	minSurface: z.number().min(1).max(10000).optional(),
	hasExterior: z.boolean().optional(),
	hasParking: z.boolean().optional(),
	acceptedFloors: z.string().max(50).optional(),
	desiredState: z
		.array(z.enum(['new', 'good', 'refresh', 'renovate']))
		.optional(),
	budget: z.object({
		max: z.number().min(1000).max(100_000_000),
		ideal: z.number().min(1000).max(100_000_000).optional(),
		financingType: z.enum(['loan', 'cash', 'pending']).optional(),
		isSaleInProgress: z.boolean().optional(),
		hasBankApproval: z.boolean().optional(),
	}),
	priorities: z
		.object({
			mustHaves: z.array(z.string()).optional(),
			niceToHaves: z.array(z.string()).optional(),
			dealBreakers: z.array(z.string()).optional(),
		})
		.optional(),
	status: z
		.enum(['active', 'paused', 'fulfilled', 'sold', 'rented', 'archived'])
		.optional(),
	// Client Information
	clientInfo: z
		.object({
			qualificationInfo: z
				.object({
					clientName: z.string().max(200).optional(),
					clientStatus: z
						.enum(['particulier', 'investisseur', 'entreprise'])
						.optional(),
					profession: z.string().max(200).optional(),
					projectType: z.enum(['couple', 'seul']).optional(),
					hasRealEstateAgent: z.boolean().optional(),
					hasVisitedProperties: z.boolean().optional(),
				})
				.optional(),
			timelineInfo: z
				.object({
					urgency: z
						.enum(['immediat', '3_mois', '6_mois', 'pas_presse'])
						.optional(),
					visitAvailability: z.string().max(500).optional(),
					idealMoveInDate: z.string().max(20).optional(),
				})
				.optional(),
		})
		.optional(),
});

export const createSearchAdSchema = searchAdBaseSchema.required({
	title: true,
	propertyTypes: true,
	location: true,
	budget: true,
});

export const updateSearchAdSchema = searchAdBaseSchema.partial();

export type CreateSearchAdInput = z.infer<typeof createSearchAdSchema>;
export type UpdateSearchAdInput = z.infer<typeof updateSearchAdSchema>;
