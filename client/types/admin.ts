/**
 * Admin module types
 * Centralized TypeScript interfaces for admin components
 */

// ==================== User Types ====================

export interface AdminUser {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	type: 'agent' | 'apporteur' | 'admin';
	status?: 'active' | 'pending' | 'blocked';
	isBlocked?: boolean;
	isValidated?: boolean;
	registeredAt: string;
	propertiesCount?: number;
	collaborationsActive?: number;
	collaborationsClosed?: number;
	connectionsCount?: number;
	lastActive?: string;
	phone?: string;
	profileImage?: string;
	userType?: string;
	isPaid?: boolean;
	professionalInfo?: ProfessionalInfo;
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	subscriptionStatus?: string;
	profileCompleted?: boolean;
	accessGrantedByAdmin?: boolean;
}

export interface ProfessionalInfo {
	network?: string;
	tCard?: string;
	sirenNumber?: string;
	rsacNumber?: string;
	collaboratorCertificate?: string;
	agentType?: 'independent' | 'commercial' | 'employee';
	identityCard?: {
		url?: string;
		key?: string;
		uploadedAt?: string;
	} | null;
}

export interface AdminUserFilters {
	type: '' | 'agent' | 'apporteur' | 'admin';
	status: '' | 'active' | 'pending' | 'blocked';
	search: string;
	network: string;
	email: string;
}

export interface AdminUserUpdatePayload {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	profileImage?: string;
	userType?: AdminUser['type'];
	type?: AdminUser['type'];
	professionalInfo?: ProfessionalInfo;
	profileCompleted?: boolean;
	isValidated?: boolean;
	isBlocked?: boolean;
	[key: string]: unknown;
}

// ==================== Property Types ====================

export interface AdminProperty {
	_id: string;
	title: string;
	propertyType?: string;
	type?: string;
	city?: string;
	location?: string;
	price: number;
	views?: number;
	status: string;
	createdAt: string;
	transactionType?: string;
	owner?: {
		_id: string;
		firstName?: string;
		lastName?: string;
		network?: string;
	};
	surface?: number;
}

export interface AdminPropertyFilters {
	type: string;
	status: string;
	search: string;
	postType: string;
}

// ==================== Collaboration Types ====================

export interface CollaborationPostRef {
	_id?: string;
	title?: string;
	address?: string;
}

export interface CollaborationParticipant {
	_id: string;
	firstName?: string;
	lastName?: string;
	userType?: string;
}

export interface AdminCollaboration {
	_id: string;
	agent?: CollaborationParticipant | string;
	agentId?: string;
	agentName?: string;
	apporteur?: CollaborationParticipant | string;
	apporteurId?: string;
	apporteurName?: string;
	property?: string;
	propertyId?: string;
	postId?: CollaborationPostRef;
	postOwnerId?: CollaborationParticipant;
	collaboratorId?: CollaborationParticipant;
	postType?: string;
	status: 'pending' | 'active' | 'completed' | 'cancelled';
	commission?: number;
	proposedCommission?: number;
	createdAt: string;
	updatedAt: string;
}

export interface AdminCollaborationFilters {
	status: string;
	search: string;
	collabType: string;
}

export type CollaborationType = 'agent-agent' | 'agent-apporteur';

// ==================== Stats Types ====================

export interface TopItem {
	name: string;
	count: number;
}

export interface AdminStats {
	agentsTotal: number;
	agentsActive: number;
	agentsPending: number;
	agentsUnsubscribed: number;
	apporteursTotal: number;
	apporteursActive: number;
	apporteursPending: number;
	propertiesActive: number;
	propertiesArchived: number;
	propertiesInCollab: number;
	collabOpen: number;
	collabClosed: number;
	feesTotal: number;
	topNetworks: TopItem[];
	topRegions: TopItem[];
}

// ==================== UI Types ====================

export interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	color: 'blue' | 'green' | 'yellow' | 'purple' | 'rose';
}

export interface ConfirmActionState {
	label: string;
	onConfirm: () => Promise<void>;
	type?: string;
}

export interface ConfirmDialogState {
	open: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	variant?: 'danger' | 'warning' | 'info' | 'primary';
}

// ==================== Utility Types ====================

export type BadgeVariant =
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'gray'
	| 'primary'
	| 'secondary';

export type UserStatus = 'active' | 'pending' | 'blocked';

export type CollaborationStatus =
	| 'pending'
	| 'active'
	| 'completed'
	| 'cancelled';
