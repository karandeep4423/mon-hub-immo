import { Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface MongoServerError extends Error {
	code: number;
}

interface ValidationErrorItem {
	message: string;
	[key: string]: unknown;
}

interface MongooseValidationError extends Error {
	errors: {
		[key: string]: ValidationErrorItem;
	};
}

export const errorHandler = (
	err: AppError | Error,
	req: Request,
	res: Response,
): void => {
	let error = { ...err } as AppError;
	error.message = err.message;

	// Log error
	logger.error(`[ErrorHandler] ${err.message}`, { stack: err.stack });

	// Mongoose bad ObjectId
	if (err.name === 'CastError') {
		const message = 'Ressource non trouvée';
		error = new AppError(message, 404);
	}

	// Mongoose duplicate key
	if (
		err.name === 'MongoServerError' &&
		typeof (err as MongoServerError).code !== 'undefined' &&
		(err as MongoServerError).code === 11000
	) {
		const message = 'Cette valeur existe déjà dans le système';
		error = new AppError(message, 400);
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const validationErr = err as MongooseValidationError;
		const message = Object.values(validationErr.errors)
			.map((val) => val.message)
			.join(', ');
		error = new AppError(message, 400);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		message:
			error.message ||
			'Une erreur est survenue sur le serveur. Veuillez réessayer dans quelques instants.',
	});
};
