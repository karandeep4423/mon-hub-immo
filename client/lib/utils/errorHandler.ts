import { AxiosError } from 'axios';
import { logger } from './logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ApiErrorResponse {
	message: string;
	error?: string;
	errors?: Array<{ field: string; message: string }>;
	statusCode?: number;
}

export class ApiError extends Error {
	statusCode: number;
	errors?: Array<{ field: string; message: string }>;
	originalError?: unknown;

	constructor(
		message: string,
		statusCode: number = 500,
		errors?: Array<{ field: string; message: string }>,
		originalError?: unknown,
	) {
		super(message);
		this.name = 'ApiError';
		this.statusCode = statusCode;
		this.errors = errors;
		this.originalError = originalError;
	}
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isAxiosError(error: unknown): error is AxiosError {
	return (
		typeof error === 'object' &&
		error !== null &&
		'isAxiosError' in error &&
		error.isAxiosError === true
	);
}

export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
	return (
		typeof data === 'object' &&
		data !== null &&
		'message' in data &&
		typeof (data as ApiErrorResponse).message === 'string'
	);
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Centralized error handler for API calls
 * Extracts meaningful error messages and logs appropriately
 */
export function handleApiError(
	error: unknown,
	context: string,
	defaultMessage: string = 'Une erreur est survenue',
): ApiError {
	// Handle Axios errors (most common for API calls)
	if (isAxiosError(error)) {
		const statusCode = error.response?.status || 500;
		const responseData = error.response?.data;

		// Log error with context
		logger.error(`[${context}] API Error`, {
			statusCode,
			url: error.config?.url,
			method: error.config?.method,
			data: responseData,
		});

		// Extract error message from response
		if (isApiErrorResponse(responseData)) {
			return new ApiError(
				responseData.message || defaultMessage,
				statusCode,
				responseData.errors,
				error,
			);
		}

		// Handle specific HTTP status codes
		switch (statusCode) {
			case 400:
				return new ApiError(
					'Requête invalide',
					statusCode,
					undefined,
					error,
				);
			case 401:
				return new ApiError(
					'Non autorisé',
					statusCode,
					undefined,
					error,
				);
			case 403:
				return new ApiError(
					'Accès refusé',
					statusCode,
					undefined,
					error,
				);
			case 404:
				return new ApiError(
					'Ressource non trouvée',
					statusCode,
					undefined,
					error,
				);
			case 409:
				return new ApiError('Conflit', statusCode, undefined, error);
			case 422:
				return new ApiError(
					'Données invalides',
					statusCode,
					undefined,
					error,
				);
			case 500:
				return new ApiError(
					'Erreur serveur',
					statusCode,
					undefined,
					error,
				);
			default:
				return new ApiError(
					defaultMessage,
					statusCode,
					undefined,
					error,
				);
		}
	}

	// Handle ApiError instances (already processed)
	if (error instanceof ApiError) {
		return error;
	}

	// Handle standard Error instances
	if (error instanceof Error) {
		logger.error(`[${context}] Error`, error.message);
		return new ApiError(error.message, 500, undefined, error);
	}

	// Handle unknown error types
	logger.error(`[${context}] Unknown error`, error);
	return new ApiError(defaultMessage, 500, undefined, error);
}

/**
 * Extracts user-friendly error message from ApiError
 */
export function getErrorMessage(error: ApiError): string {
	if (error.errors && error.errors.length > 0) {
		return error.errors.map((e) => e.message).join(', ');
	}
	return error.message;
}

/**
 * Checks if error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
	if (isAxiosError(error)) {
		return (
			error.code === 'ECONNABORTED' ||
			error.code === 'ERR_NETWORK' ||
			error.message.toLowerCase().includes('network')
		);
	}
	return false;
}

/**
 * Checks if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
	if (error instanceof ApiError) {
		return error.statusCode === 401;
	}
	if (isAxiosError(error)) {
		return error.response?.status === 401;
	}
	return false;
}
