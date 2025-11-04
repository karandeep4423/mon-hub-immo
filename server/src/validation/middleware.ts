import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema, ZodIssue } from 'zod';

// Generic Zod validator middleware
export const validate =
	(
		schema: ZodSchema,
		source: 'body' | 'params' | 'query' = 'body',
	): RequestHandler =>
	(req: Request, res: Response, next: NextFunction) => {
		const data = req[source];
		const result = schema.safeParse(data);
		if (!result.success) {
			const issues = result.error.issues.map((i: ZodIssue) => ({
				path: i.path.join('.'),
				message: i.message,
			}));
			res.status(400).json({
				success: false,
				message: 'Les données fournies ne sont pas valides',
				errors: issues,
			});
			return;
		}
		// attach parsed data for downstream handlers to use if desired
		const key = `validated_${source}` as const;
		(req as unknown as Record<typeof key, unknown>)[key] = result.data;
		next();
	};
