// client/lib/auth.ts
import { api } from '../api';
import { handleApiError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { Features } from '../constants';
import { AUTH_ENDPOINTS } from '../constants/api/endpoints';
import {
	SignUpData,
	LoginData,
	VerifyEmailData,
	ForgotPasswordData,
	ResetPasswordData,
	AuthResponse,
} from '@/types/auth';

/**
 * Authentication API Service
 * Centralized API operations for authentication and user management
 */
export class AuthApi {
	/**
	 * Register a new user
	 * @param data - User registration data
	 * @param identityCardFile - Optional identity card file for agents
	 * @returns Auth response with token and user data
	 * @throws {Error} Registration validation errors
	 */
	static async signUp(
		data: SignUpData,
		identityCardFile?: File | null,
	): Promise<AuthResponse> {
		try {
			// If identity card file is provided, send as multipart/form-data
			if (identityCardFile) {
				const formData = new FormData();

				// Add all form fields
				Object.entries(data).forEach(([key, value]) => {
					if (value !== undefined && value !== null) {
						formData.append(key, value.toString());
					}
				});

				// Add identity card file
				formData.append('identityCard', identityCardFile);

				const response = await api.post(
					AUTH_ENDPOINTS.SIGNUP,
					formData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
						},
					},
				);
				return response.data;
			}

			// Otherwise, send as JSON
			const response = await api.post(AUTH_ENDPOINTS.SIGNUP, data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.signUp',
				Features.Auth.AUTH_ERRORS.SIGNUP_FAILED,
			);
		}
	}

	/**
	 * Login user
	 * @param data - Login credentials (email and password)
	 * @returns Auth response with JWT token
	 * @throws {Error} Invalid credentials or account not verified
	 */
	static async login(data: LoginData): Promise<AuthResponse> {
		try {
			const response = await api.post(AUTH_ENDPOINTS.LOGIN, data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.login',
				Features.Auth.AUTH_ERRORS.LOGIN_FAILED,
			);
		}
	}

	/**
	 * Verify email with code
	 * @param data - Email and verification code
	 * @returns Auth response after successful verification
	 * @throws {Error} Invalid or expired verification code
	 */
	static async verifyEmail(data: VerifyEmailData): Promise<AuthResponse> {
		try {
			const response = await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.verifyEmail',
				Features.Auth.AUTH_ERRORS.VERIFY_EMAIL_FAILED,
			);
		}
	}

	/**
	 * Resend verification code
	 * @param email - User email address
	 * @returns Success response
	 * @throws {Error} Email not found or already verified
	 */
	static async resendVerificationCode(email: string): Promise<AuthResponse> {
		try {
			const response = await api.post(
				AUTH_ENDPOINTS.RESEND_VERIFICATION,
				{
					email,
				},
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.resendVerificationCode',
				Features.Auth.AUTH_ERRORS.RESEND_CODE_FAILED,
			);
		}
	}

	/**
	 * Request password reset
	 */
	static async forgotPassword(
		data: ForgotPasswordData,
	): Promise<AuthResponse> {
		try {
			const response = await api.post(
				AUTH_ENDPOINTS.FORGOT_PASSWORD,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.forgotPassword',
				Features.Auth.AUTH_ERRORS.FORGOT_PASSWORD_FAILED,
			);
		}
	}

	/**
	 * Reset password with code
	 */
	static async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
		try {
			const response = await api.post(
				AUTH_ENDPOINTS.RESET_PASSWORD,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.resetPassword',
				Features.Auth.AUTH_ERRORS.RESET_PASSWORD_FAILED,
			);
		}
	}

	/**
	 * Set password from invite token (email + token + newPassword)
	 */
	static async setPasswordFromInvite(data: { email: string; token: string; newPassword: string; }): Promise<AuthResponse> {
		try {
			const response = await api.post(AUTH_ENDPOINTS.SET_PASSWORD, data);
			return response.data;
		} catch (error) {
			throw handleApiError(error, 'AuthApi.setPasswordFromInvite', 'Impossible de définir le mot de passe');
		}
	}

	/**
	 * Get current user profile
	 * @returns User profile data
	 * @throws {Error} Unauthorized or token expired
	 */
	static async getProfile(): Promise<AuthResponse> {
		try {
			const response = await api.get(AUTH_ENDPOINTS.PROFILE);
			return response.data;
		} catch (error: unknown) {
			// Don't log 401/400 errors (user not logged in) as errors
			const hasResponse =
				error && typeof error === 'object' && 'response' in error;
			const statusCode = hasResponse
				? (error as { response: { status: number } }).response.status
				: 0;
			const isAuthError = statusCode === 401 || statusCode === 400;

			if (isAuthError) {
				// Silently throw without logging - this is expected when not logged in
				throw error;
			}

			throw handleApiError(
				error,
				'AuthApi.getProfile',
				Features.Auth.AUTH_ERRORS.GET_PROFILE_FAILED,
			);
		}
	}

	/**
	 * Refresh access token using refresh token
	 * @param refreshToken - The refresh token from storage
	 * @returns New access token and refresh token
	 * @throws {Error} Invalid or expired refresh token
	 */
	static async refreshToken(refreshToken: string): Promise<AuthResponse> {
		try {
			const response = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
				refreshToken,
			});
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.refreshToken',
				'Failed to refresh token',
			);
		}
	}

	/**
	 * Update user profile
	 * @param data - Profile fields to update (firstName, lastName, phone, profileImage, professionalInfo)
	 * @returns Updated user data
	 * @throws {Error} Validation errors
	 */
	static async updateProfile(data: {
		firstName?: string;
		lastName?: string;
		phone?: string;
		profileImage?: string;
		professionalInfo?: Record<string, unknown>;
	}): Promise<AuthResponse> {
		try {
			const response = await api.put(AUTH_ENDPOINTS.PROFILE, data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.updateProfile',
				Features.Auth.AUTH_ERRORS.UPDATE_PROFILE_FAILED,
			);
		}
	}

	/**
	 * Complete user profile (agent-specific)
	 */
	static async completeProfile(data: {
		professionalInfo?: {
			postalCode?: string;
			city?: string;
			interventionRadius?: number;
			network?: string;
			siretNumber?: string;
			yearsExperience?: number;
			personalPitch?: string;
			mandateTypes?: Array<'simple' | 'exclusif' | 'co-mandat'>;
			coveredCities?: string[];
			collaborateWithAgents?: boolean;
			shareCommission?: boolean;
			independentAgent?: boolean;
			alertsEnabled?: boolean;
			alertFrequency?: 'quotidien' | 'hebdomadaire';
		};
		profileImage?: string;
		identityCard?: {
			url: string;
			key: string;
		};
	}): Promise<AuthResponse> {
		try {
			const response = await api.post(
				AUTH_ENDPOINTS.COMPLETE_PROFILE,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.completeProfile',
				Features.Auth.AUTH_ERRORS.COMPLETE_PROFILE_FAILED,
			);
		}
	}

	/**
	 * Update search preferences
	 */
	static async updateSearchPreferences(data: {
		preferredRadius?: number;
		lastSearchLocations?: Array<{
			city: string;
			postcode: string;
			coordinates?: {
				lat: number;
				lon: number;
			};
		}>;
	}): Promise<{
		success: boolean;
		searchPreferences: {
			preferredRadius?: number;
			lastSearchLocations?: Array<{
				city: string;
				postcode: string;
				coordinates?: {
					lat: number;
					lon: number;
				};
			}>;
		};
	}> {
		try {
			const response = await api.patch(AUTH_ENDPOINTS.PREFERENCES, data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.updateSearchPreferences',
				Features.Auth.AUTH_ERRORS.UPDATE_PREFERENCES_FAILED,
			);
		}
	}

	/**
	 * Upload identity card document
	 */
	static async uploadIdentityCard(file: File): Promise<{
		success: boolean;
		data: { url: string; key: string };
	}> {
		try {
			const formData = new FormData();
			formData.append('identityCard', file);

			const response = await api.post('/upload/identity-card', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.uploadIdentityCard',
				"Erreur lors de l'upload de la carte d'identité",
			);
		}
	}

	/**
	 * Logout user
	 * Clears httpOnly cookies on server
	 */
	static async logout(): Promise<void> {
		try {
			// Call server to clear httpOnly cookies
			await api.post('/auth/logout');
		} catch (error) {
			logger.error('[AuthApi] Logout API call failed', error);
		}
	}
}

// Backward compatibility: export object-style API
export const authService = {
	signUp: AuthApi.signUp.bind(AuthApi),
	login: AuthApi.login.bind(AuthApi),
	verifyEmail: AuthApi.verifyEmail.bind(AuthApi),
	resendVerificationCode: AuthApi.resendVerificationCode.bind(AuthApi),
	forgotPassword: AuthApi.forgotPassword.bind(AuthApi),
	resetPassword: AuthApi.resetPassword.bind(AuthApi),
	setPasswordFromInvite: AuthApi.setPasswordFromInvite.bind(AuthApi),
	getProfile: AuthApi.getProfile.bind(AuthApi),
	updateProfile: AuthApi.updateProfile.bind(AuthApi),
	completeProfile: AuthApi.completeProfile.bind(AuthApi),
	updateSearchPreferences: AuthApi.updateSearchPreferences.bind(AuthApi),
	uploadIdentityCard: AuthApi.uploadIdentityCard.bind(AuthApi),
	logout: AuthApi.logout.bind(AuthApi),
};
