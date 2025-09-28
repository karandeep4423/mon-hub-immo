import { z } from 'zod';

// Shared helpers
const mongoId = z.string().regex(/^[a-f\d]{24}$/i, 'ID invalide');
const frenchPostalCode = z.string().regex(/^\d{5}$/i, 'Code postal invalide');

// Auth
export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export const signupSchema = z.object({
	firstName: z.string().min(2).max(50),
	lastName: z.string().min(2).max(50),
	email: z.string().email(),
	password: z.string().min(8).max(128),
	phone: z
		.string()
		.regex(/^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/)
		.optional()
		.or(z.literal('').transform(() => undefined)),
	userType: z.enum(['agent', 'apporteur']).optional(),
});

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
	characteristics: z.string().max(200).optional(),
	saleType: z.enum(['ancien', 'viager']).optional(),
	feesResponsibility: z.enum(['buyer', 'seller']).optional(),
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

	isExclusive: z.boolean().optional(),
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
