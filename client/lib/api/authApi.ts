// client/lib/auth.ts
import { api } from '../api';
import { TokenManager } from '../utils/tokenManager';
import { handleApiError } from '../utils/errorHandler';
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
			const response = await api.post('/auth/signup', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.signUp',
				"Erreur lors de l'inscription",
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
			const response = await api.post('/auth/login', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.login',
				'Erreur lors de la connexion',
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
			const response = await api.post('/auth/verify-email', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.verifyEmail',
				"Erreur lors de la vérification de l'email",
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
			const response = await api.post('/auth/resend-verification', {
				email,
			});
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.resendVerificationCode',
				"Erreur lors de l'envoi du code",
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
			const response = await api.post('/auth/forgot-password', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.forgotPassword',
				'Erreur lors de la réinitialisation du mot de passe',
			);
		}
	}

	/**
	 * Reset password with code
	 */
	static async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
		try {
			const response = await api.post('/auth/reset-password', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.resetPassword',
				'Erreur lors de la réinitialisation du mot de passe',
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
			const response = await api.get('/auth/profile');
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.getProfile',
				'Erreur lors de la récupération du profil',
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
			const response = await api.put('/auth/profile', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.updateProfile',
				'Erreur lors de la mise à jour du profil',
			);
		}
	}

	/**
	 * Complete user profile (agent-specific)
	 */
	static async completeProfile(data: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		professionalInfo?: any;
		profileImage?: string;
	}): Promise<AuthResponse> {
		try {
			const response = await api.post('/auth/complete-profile', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.completeProfile',
				'Erreur lors de la complétion du profil',
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
			const response = await api.patch('/auth/search-preferences', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'AuthApi.updateSearchPreferences',
				'Erreur lors de la mise à jour des préférences',
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
