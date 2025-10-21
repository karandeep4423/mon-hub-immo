// client/lib/auth.ts
import { api } from '../api';
import {
	SignUpData,
	LoginData,
	VerifyEmailData,
	ForgotPasswordData,
	ResetPasswordData,
	AuthResponse,
} from '@/types/auth';

export const authService = {
	async signUp(data: SignUpData): Promise<AuthResponse> {
		const response = await api.post('/auth/signup', data);
		return response.data;
	},

	async login(data: LoginData): Promise<AuthResponse> {
		const response = await api.post('/auth/login', data);
		return response.data;
	},

	async verifyEmail(data: VerifyEmailData): Promise<AuthResponse> {
		const response = await api.post('/auth/verify-email', data);
		return response.data;
	},

	async resendVerificationCode(email: string): Promise<AuthResponse> {
		const response = await api.post('/auth/resend-verification', { email });
		return response.data;
	},

	async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
		const response = await api.post('/auth/forgot-password', data);
		return response.data;
	},

	async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
		const response = await api.post('/auth/reset-password', data);
		return response.data;
	},

	async getProfile(): Promise<AuthResponse> {
		const response = await api.get('/auth/profile');
		return response.data;
	},

	async updateProfile(data: {
		firstName?: string;
		lastName?: string;
		phone?: string;
		profileImage?: string;
	}): Promise<AuthResponse> {
		const response = await api.put('/auth/profile', data);
		return response.data;
	},

	async completeProfile(data: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		professionalInfo?: any;
		profileImage?: string;
	}): Promise<AuthResponse> {
		const response = await api.post('/auth/complete-profile', data);
		return response.data;
	},

	async updateSearchPreferences(data: {
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
		const response = await api.patch('/auth/search-preferences', data);
		return response.data;
	},

	logout() {
		localStorage.removeItem('token');
		window.location.href = '/';
	},
};
