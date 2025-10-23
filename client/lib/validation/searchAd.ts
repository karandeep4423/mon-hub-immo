import { z } from 'zod';

/**
 * Shared Search Ad validation schema
 * Matches server-side validation in server/src/validation/schemas.ts
 */
export const searchAdValidationSchema = z.object({
	title: z
		.string()
		.min(5, 'Le titre doit contenir au moins 5 caractères.')
		.max(200, 'Le titre ne peut pas dépasser 200 caractères.'),
	description: z
		.string()
		.min(10, 'La description doit contenir au moins 10 caractères.')
		.max(2000, 'La description ne peut pas dépasser 2000 caractères.')
		.optional(),
	propertyTypes: z
		.array(z.string())
		.min(1, 'Veuillez sélectionner au moins un type de bien.'),
	cities: z.string().min(2, 'La localisation est requise.'),
	budgetMax: z.number().min(1, 'Le budget maximum doit être positif.'),
	budgetIdeal: z.number().optional(),
	minSurface: z.number().min(1).optional(),
	minRooms: z.number().int().min(1).optional(),
	minBedrooms: z.number().int().min(1).optional(),
});

/**
 * Validates search ad form data
 * @param data Form data to validate
 * @returns Validation result with success flag and error message if any
 */
export const validateSearchAdForm = (
	data: unknown,
): { success: true } | { success: false; error: string } => {
	try {
		searchAdValidationSchema.parse(data);
		return { success: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			// Return first error message
			const firstError = error.issues[0];
			return { success: false, error: firstError.message };
		}
		return { success: false, error: 'Validation échouée' };
	}
};

// Type inference
export type SearchAdFormData = z.infer<typeof searchAdValidationSchema>;
