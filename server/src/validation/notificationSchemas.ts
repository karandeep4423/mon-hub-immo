import { z } from 'zod';

export const listNotificationsSchema = z.object({
	cursor: z.string().datetime().optional(),
	limit: z
		.string()
		.regex(/^\d+$/)
		.transform((v) => parseInt(v, 10))
		.optional(),
});

export const markReadParamsSchema = z.object({
	id: z.string().min(1),
});
