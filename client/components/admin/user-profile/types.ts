import { LucideIcon } from 'lucide-react';

export interface ProfessionalInfo {
	network?: string;
	tCard?: string;
	sirenNumber?: string;
	rsacNumber?: string;
	collaboratorCertificate?: string;
	agentType?: 'independent' | 'commercial' | 'employee';
	identityCard?: { url?: string; key?: string; uploadedAt?: string } | null;
	city?: string;
	postalCode?: string;
	interventionRadius?: number;
	coveredCities?: string[];
	siretNumber?: string;
	mandateTypes?: ('simple' | 'exclusif' | 'co-mandat')[];
	yearsExperience?: number;
	personalPitch?: string;
	collaborateWithAgents?: boolean;
	shareCommission?: boolean;
	independentAgent?: boolean;
	alertsEnabled?: boolean;
	alertFrequency?: 'quotidien' | 'hebdomadaire';
}

export interface UserProfile {
	_id: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string | null;
	userType?: string;
	type?: string;
	profileImage?: string | null;
	isValidated?: boolean;
	isBlocked?: boolean;
	isPaid?: boolean;
	accessGrantedByAdmin?: boolean;
	profileCompleted?: boolean;
	professionalInfo?: ProfessionalInfo | null;
	propertiesCount?: number;
	collaborationsActive?: number;
	collaborationsClosed?: number;
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	subscriptionStatus?: string;
	createdAt?: string | Date;
}

export interface UserProfileEditableProps {
	user: UserProfile;
	onUpdate: (updatedUser: UserProfile) => void;
	onDelete: () => void;
}

export type ConfirmAction =
	| 'validate'
	| 'invalidate'
	| 'block'
	| 'unblock'
	| 'delete'
	| 'grant_access'
	| 'revoke_access'
	| null;

export type KnownUserType = '' | 'agent' | 'apporteur' | 'admin';

export type TabId = 'personal' | 'professional' | 'documents' | 'account';

export interface TabConfig {
	id: TabId;
	label: string;
	icon: LucideIcon;
}
