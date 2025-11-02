import { AxiosError } from 'axios';
import { logger } from './logger';

export interface ApiErrorData {
	message?: string;
	errors?: Array<{ path: string; message: string }>;
}

export interface FormErrors {
	[key: string]: string;
}

/**
 * Extracts form field errors from API error response
 * @param error - Axios error object
 * @returns Object with field names as keys and error messages as values
 */
export const extractFormErrors = (error: unknown): FormErrors => {
	const formErrors: FormErrors = {};

	if (error instanceof Error && 'response' in error) {
		const axiosError = error as AxiosError<ApiErrorData>;
		const data = axiosError.response?.data;

		if (data?.errors && Array.isArray(data.errors)) {
			data.errors.forEach((err) => {
				formErrors[err.path] = err.message;
			});
		}
	}

	return formErrors;
};

/**
 * Gets user-friendly error message from API error
 * @param error - Error object (preferably AxiosError)
 * @param fallbackMessage - Message to show if no specific error found
 * @returns User-friendly error message
 */
export const getErrorMessage = (
	error: unknown,
	fallbackMessage = 'Une erreur est survenue',
): string => {
	if (error instanceof Error && 'response' in error) {
		const axiosError = error as AxiosError<ApiErrorData>;
		const data = axiosError.response?.data;

		if (data?.message) {
			return data.message;
		}

		if (
			data?.errors &&
			Array.isArray(data.errors) &&
			data.errors.length > 0
		) {
			return data.errors[0].message;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return fallbackMessage;
};

/**
 * Handles form submission errors - extracts field errors and sets them, logs the error
 * @param error - Error object from API call
 * @param setErrors - Function to set form errors
 * @param logContext - Context string for logging (e.g., component name)
 * @returns General error message (non-field-specific)
 */
export const handleFormSubmitError = (
	error: unknown,
	setErrors: (errors: FormErrors) => void,
	logContext: string,
): string => {
	logger.error(`[${logContext}] Form submission error:`, error);

	const formErrors = extractFormErrors(error);
	const generalMessage = getErrorMessage(
		error,
		'Erreur lors de la soumission du formulaire',
	);

	if (Object.keys(formErrors).length > 0) {
		setErrors(formErrors);
	} else {
		// If no field-specific errors, set a general submit error
		setErrors({ submit: generalMessage });
	}

	return generalMessage;
};
