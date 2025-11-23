export interface AuthResponse {
	success: boolean;
	message: string;
	user?: User;
	token?: string;
	refreshToken?: string; // JWT refresh token for token renewal
	requiresVerification?: boolean;
	codeSent?: boolean;
	requiresProfileCompletion?: boolean; // Add this
	requiresAdminValidation?: boolean; // True when account is created/verified but awaiting admin validation
	errors?: ValidationError[];
}

// Update User interface
export interface User {
	id: string;
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	userType: '' | 'agent' | 'apporteur' | 'admin';
	isEmailVerified: boolean;
	isValidated?: boolean;
	profileImage?: string;
	profileCompleted: boolean; // Make sure this is included

	professionalInfo?: {
		postalCode?: string;
		city?: string;
		interventionRadius?: number;
		coveredCities?: string[];
		network?: string;
		siretNumber?: string;
		mandateTypes?: ('simple' | 'exclusif' | 'co-mandat')[];
		yearsExperience?: number;
		personalPitch?: string;
		collaborateWithAgents?: boolean;
		shareCommission?: boolean;
		independentAgent?: boolean;
		alertsEnabled?: boolean;
		alertFrequency?: 'quotidien' | 'hebdomadaire';
		identityCard?: {
			url: string;
			key: string;
			uploadedAt: string;
		};
	};

	searchPreferences?: {
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

	createdAt?: string;
	updatedAt?: string;
}

export interface ValidationError {
	field: string;
	message: string;
}

export interface SignUpData {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	userType: '' | 'agent' | 'apporteur' | 'admin';
	password: string;
	confirmPassword: string;
	// Agent-specific fields
	agentType?: string;
	tCard?: string;
	sirenNumber?: string;
	rsacNumber?: string;
	collaboratorCertificate?: string;
}

export interface LoginData {
	email: string;
	password: string;
}

export interface VerifyEmailData {
	email: string;
	code: string;
}

export interface ForgotPasswordData {
	email: string;
}

export interface ResetPasswordData {
	email: string;
	code: string;
	newPassword: string;
}
