// Overall Collaboration Status Types (Workflow 1)
// Used for high-level collaboration state on dashboard and cards

export type OverallCollaborationStatus =
	| 'pending'
	| 'accepted'
	| 'active'
	| 'completed'
	| 'cancelled'
	| 'rejected';

export interface OverallStatusUpdate {
	status: OverallCollaborationStatus;
	note?: string;
}

export interface OverallStatusBadgeProps {
	status: OverallCollaborationStatus;
	size?: 'sm' | 'md' | 'lg';
}

export interface OverallStatusManagerProps {
	collaborationId: string;
	currentStatus: OverallCollaborationStatus;
	canUpdate: boolean;
	// Role flags for permission-based actions
	isOwner?: boolean;
	isCollaborator?: boolean;
	onStatusUpdate?: (status: OverallCollaborationStatus) => void;
}
