// client/lib/auth.ts
import { api } from '../api';
import { TokenManager } from '../utils/tokenManager';
import { handleApiError } from '../utils/errorHandler';
import { Features } from '../constants';
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
	 * @returns Auth response with token and user data
	 * @throws {Error} Registration validation errors
	 */
	static async signUp(data: SignUpData): Promise<AuthResponse> {
		try {
			const response = await api.post(
				Features.Auth.AUTH_ENDPOINTS.SIGNUP,
				data,
			);
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
			const response = await api.post(
				Features.Auth.AUTH_ENDPOINTS.LOGIN,
				data,
			);
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
			const response = await api.post(
				Features.Auth.AUTH_ENDPOINTS.VERIFY_EMAIL,
				data,
			);
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
				Features.Auth.AUTH_ENDPOINTS.RESEND_VERIFICATION,
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
				Features.Auth.AUTH_ENDPOINTS.FORGOT_PASSWORD,
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
				Features.Auth.AUTH_ENDPOINTS.RESET_PASSWORD,
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
	 * Get current user profile
	 * @returns User profile data
	 * @throws {Error} Unauthorized or token expired
	 */
	static async getProfile(): Promise<AuthResponse> {
		try {
			const response = await api.get(
				Features.Auth.AUTH_ENDPOINTS.GET_PROFILE,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.getProfile',
				Features.Auth.AUTH_ERRORS.GET_PROFILE_FAILED,
			);
		}
	}

	/**
	 * Update user profile
	 * @param data - Profile fields to update (firstName, lastName, phone, profileImage)
	 * @returns Updated user data
	 * @throws {Error} Validation errors
	 */
	static async updateProfile(data: {
		firstName?: string;
		lastName?: string;
		phone?: string;
		profileImage?: string;
	}): Promise<AuthResponse> {
		try {
			const response = await api.put(
				Features.Auth.AUTH_ENDPOINTS.UPDATE_PROFILE,
				data,
			);
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
			agentType?: string;
			registeredCities?: string[];
			sirenNumber?: string;
			tCard?: string;
			rsacNumber?: string;
			collaboratorCertificate?: string;
		};
		profileImage?: string;
	}): Promise<AuthResponse> {
		try {
			const response = await api.post(
				Features.Auth.AUTH_ENDPOINTS.COMPLETE_PROFILE,
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
			const response = await api.patch(
				Features.Auth.AUTH_ENDPOINTS.UPDATE_PREFERENCES,
				data,
			);
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
	 * Logout user
	 * Clears all local tokens and redirects to home
	 */
	static logout(): void {
		TokenManager.clearAll();
		window.location.href = '/';
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
	getProfile: AuthApi.getProfile.bind(AuthApi),
	updateProfile: AuthApi.updateProfile.bind(AuthApi),
	completeProfile: AuthApi.completeProfile.bind(AuthApi),
	updateSearchPreferences: AuthApi.updateSearchPreferences.bind(AuthApi),
	logout: AuthApi.logout.bind(AuthApi),
};
