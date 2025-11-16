/**
 * Authentication Toast Utilities
 * Centralized toast notifications for auth-related actions
 * Provides consistent user feedback with French messages
 */

import { toast, ToastOptions } from 'react-toastify';
import { Features } from '@/lib/constants';
import { FIELD_TRANSLATIONS } from '@/lib/constants/features/auth';
import { ApiError } from './errorHandler';

// Default toast options for auth notifications
const AUTH_TOAST_OPTIONS: ToastOptions = {
	position: 'top-right',
	autoClose: 5000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
};

// Loading toast options (no auto-close)
const LOADING_TOAST_OPTIONS: ToastOptions = {
	...AUTH_TOAST_OPTIONS,
	autoClose: false,
	closeButton: false,
};

/**
 * Show success toast notification
 */
export const authToastSuccess = (message: string, options?: ToastOptions) => {
	toast.success(message, { ...AUTH_TOAST_OPTIONS, ...options });
};

/**
 * Show error toast notification
 */
export const authToastError = (message: string, options?: ToastOptions) => {
	toast.error(message, { ...AUTH_TOAST_OPTIONS, ...options });
};

/**
 * Show info toast notification
 */
export const authToastInfo = (message: string, options?: ToastOptions) => {
	toast.info(message, { ...AUTH_TOAST_OPTIONS, ...options });
};

/**
 * Show warning toast notification
 */
export const authToastWarning = (message: string, options?: ToastOptions) => {
	toast.warning(message, { ...AUTH_TOAST_OPTIONS, ...options });
};

/**
 * Show loading toast notification
 */
export const authToastLoading = (message: string) => {
	return toast.loading(message, LOADING_TOAST_OPTIONS);
};

/**
 * Update an existing toast (typically used with loading toasts)
 */
export const authToastUpdate = (
	toastId: string | number,
	message: string,
	type: 'success' | 'error' | 'info' | 'warning',
	options?: ToastOptions,
) => {
	toast.update(toastId, {
		render: message,
		type,
		isLoading: false,
		...AUTH_TOAST_OPTIONS,
		...options,
	});
};

/**
 * Dismiss a specific toast
 */
export const authToastDismiss = (toastId?: string | number) => {
	toast.dismiss(toastId);
};

/**
 * Translate field name to French
 */
const translateFieldName = (fieldName: string): string => {
	return (
		FIELD_TRANSLATIONS[fieldName] ||
		FIELD_TRANSLATIONS['Field'] ||
		fieldName
	);
};

/**
 * Handle API errors and show appropriate toast messages
 * Maps backend error messages to user-friendly French messages
 */
export const handleAuthError = (error: unknown): void => {
	// Error is already logged by errorHandler.ts, no need to log again

	// Handle ApiError instances
	if (error instanceof ApiError) {
		const statusCode = error.statusCode;
		const message = error.message?.toLowerCase() || '';

		// Login-specific errors
		if (message.includes('invalid credentials')) {
			authToastError(
				Features.Auth.AUTH_TOAST_MESSAGES.INVALID_CREDENTIALS,
			);
			return;
		}

		if (
			message.includes('account locked') ||
			message.includes('locked for')
		) {
			// Extract minutes if available
			const minutesMatch = message.match(/(\d+)\s*minute/i);
			if (minutesMatch) {
				const minutes = parseInt(minutesMatch[1], 10);
				authToastError(
					Features.Auth.AUTH_TOAST_MESSAGES.ACCOUNT_LOCKED_WITH_TIME(
						minutes,
					),
				);
			} else {
				authToastError(
					Features.Auth.AUTH_TOAST_MESSAGES.ACCOUNT_LOCKED,
				);
			}
			return;
		}

		// Rate limiting errors - backend sends user-friendly French messages with exact timing
		// Example: "Trop de tentatives de connexion. Veuillez réessayer dans 28 minutes."
		if (
			message.includes('trop de tentatives') ||
			message.includes('trop de demandes') ||
			message.includes('trop de requêtes') ||
			message.includes('veuillez réessayer dans') ||
			message.includes('multiple failed') ||
			message.includes('too many')
		) {
			// Show the backend message directly (it has correct timing)
			authToastError(error.message);
			return;
		}

		if (
			message.includes('verify your email') ||
			message.includes('email address before logging')
		) {
			authToastWarning(
				Features.Auth.AUTH_TOAST_MESSAGES.EMAIL_NOT_VERIFIED,
			);
			return;
		}

		// Signup-specific errors
		if (
			message.includes('email already') ||
			message.includes('existe déjà')
		) {
			authToastError(
				Features.Auth.AUTH_TOAST_MESSAGES.EMAIL_ALREADY_EXISTS,
			);
			return;
		}

		// Verification errors
		if (
			message.includes('invalid code') ||
			message.includes('code invalide') ||
			message.includes('expired')
		) {
			authToastError(
				Features.Auth.AUTH_TOAST_MESSAGES.INVALID_VERIFICATION_CODE,
			);
			return;
		}

		// Password errors
		if (message.includes('password') && message.includes('not match')) {
			authToastError(Features.Auth.AUTH_TOAST_MESSAGES.PASSWORD_MISMATCH);
			return;
		}

		if (
			message.includes('cannot reuse') ||
			message.includes('last 5 passwords') ||
			message.includes('password history')
		) {
			authToastError(
				Features.Auth.AUTH_TOAST_MESSAGES.PASSWORD_IN_HISTORY,
			);
			return;
		}

		if (message.includes('reset code') && message.includes('invalid')) {
			authToastError(
				Features.Auth.AUTH_TOAST_MESSAGES.INVALID_RESET_CODE,
			);
			return;
		}

		// Validation errors with field-specific messages
		if (
			message.includes('validation') &&
			error.errors &&
			Array.isArray(error.errors) &&
			error.errors.length > 0
		) {
			// Show each field error as a separate toast
			error.errors.forEach((fieldError) => {
				if (fieldError.message) {
					const fieldKey =
						fieldError.field || fieldError.path || 'Field';
					const translatedField = translateFieldName(fieldKey);
					authToastError(`${translatedField}: ${fieldError.message}`);
				}
			});
			return;
		}

		// HTTP status code based messages
		switch (statusCode) {
			case 400:
				// Handle 400 validation errors with specific fields
				if (
					error.errors &&
					Array.isArray(error.errors) &&
					error.errors.length > 0
				) {
					error.errors.forEach((fieldError) => {
						if (fieldError.message) {
							const fieldKey =
								fieldError.field || fieldError.path || 'Field';
							const translatedField =
								translateFieldName(fieldKey);
							authToastError(
								`${translatedField}: ${fieldError.message}`,
							);
						}
					});
					return;
				}
				// Generic 400 error
				authToastError(
					Features.Auth.AUTH_TOAST_MESSAGES.VALIDATION_ERROR,
				);
				return;
			case 401:
				authToastError(Features.Auth.AUTH_TOAST_MESSAGES.UNAUTHORIZED);
				return;
			case 403:
					// Distinguish a blocked account vs admin validation pending
					if (message.includes('non valid') || message.includes("non validé") || message.includes('non validé par')) {
						authToastError('Votre compte est en attente de validation par l\'équipe MonHubImmo.');
					} else {
						authToastError(Features.Auth.AUTH_TOAST_MESSAGES.ACCOUNT_LOCKED);
					}
				return;
			case 404:
				authToastError(
					Features.Auth.AUTH_TOAST_MESSAGES.ACCOUNT_NOT_FOUND,
				);
				return;
			case 422:
				authToastError(
					Features.Auth.AUTH_TOAST_MESSAGES.VALIDATION_ERROR,
				);
				return;
			case 429:
				// Rate limiting - backend sends user-friendly message with timing
				// Show the actual message from API (e.g., "Veuillez réessayer dans 28 minutes")
				if (error.message) {
					authToastError(error.message);
				} else {
					authToastError(
						'⚠️ Trop de tentatives. Veuillez réessayer plus tard.',
					);
				}
				return;
			case 500:
			case 502:
			case 503:
				authToastError(Features.Auth.AUTH_TOAST_MESSAGES.SERVER_ERROR);
				return;
		}

		// If we have a message from the API, show it
		if (error.message) {
			authToastError(error.message);
			return;
		}
	}

	// Handle Error instances
	if (error instanceof Error) {
		const message = error.message?.toLowerCase() || '';

		// Network errors
		if (message.includes('network') || message.includes('fetch')) {
			authToastError(Features.Auth.AUTH_TOAST_MESSAGES.NETWORK_ERROR);
			return;
		}

		// Validation errors
		if (message.includes('validation')) {
			authToastError(Features.Auth.AUTH_TOAST_MESSAGES.VALIDATION_ERROR);
			return;
		}

		// Show the error message if it's meaningful
		if (error.message) {
			authToastError(error.message);
			return;
		}
	}

	// Fallback to generic error message
	authToastError(Features.Auth.AUTH_TOAST_MESSAGES.LOGIN_ERROR);
};

/**
 * Show login success toast with redirect info
 */
export const showLoginSuccess = (
	requiresProfileCompletion: boolean = false,
) => {
	authToastSuccess(Features.Auth.AUTH_TOAST_MESSAGES.LOGIN_SUCCESS);
	if (requiresProfileCompletion) {
		setTimeout(() => {
			authToastInfo(Features.Auth.AUTH_TOAST_MESSAGES.REDIRECTING);
		}, 500);
	}
};

/**
 * Show signup success toast
 */
export const showSignupSuccess = () => {
	authToastSuccess(Features.Auth.AUTH_TOAST_MESSAGES.SIGNUP_SUCCESS);
	setTimeout(() => {
		authToastInfo(Features.Auth.AUTH_TOAST_MESSAGES.REDIRECTING);
	}, 500);
};

/**
 * Show email verification success toast
 */
export const showVerificationSuccess = () => {
	authToastSuccess(Features.Auth.AUTH_TOAST_MESSAGES.EMAIL_VERIFIED);
	setTimeout(() => {
		authToastInfo(Features.Auth.AUTH_TOAST_MESSAGES.REDIRECTING);
	}, 500);
};

/**
 * Show password reset success toast
 */
export const showPasswordResetSuccess = () => {
	authToastSuccess(Features.Auth.AUTH_TOAST_MESSAGES.PASSWORD_RESET_SUCCESS);
	setTimeout(() => {
		authToastInfo(Features.Auth.AUTH_TOAST_MESSAGES.REDIRECTING);
	}, 500);
};

/**
 * Show profile completion success toast
 */
export const showProfileCompletionSuccess = () => {
	authToastSuccess(Features.Auth.AUTH_TOAST_MESSAGES.PROFILE_COMPLETED);
	setTimeout(() => {
		authToastInfo(Features.Auth.AUTH_TOAST_MESSAGES.REDIRECTING);
	}, 500);
};
