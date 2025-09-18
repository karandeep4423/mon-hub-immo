// Overall Collaboration Status Types (Workflow 1)
// Used for high-level collaboration state on dashboard and cards

export type OverallCollaborationStatus =
	| 'pending' // Waiting for response
	| 'accepted' // Accepted but not yet active
	| 'active' // Currently working together
	| 'completed' // Successfully finished
	| 'cancelled' // Cancelled by either party
	| 'rejected'; // Rejected by property owner

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

// Status display configuration
export const OVERALL_STATUS_CONFIG = {
	pending: {
		label: 'En attente',
		color: 'yellow',
		bgColor: 'bg-yellow-100',
		textColor: 'text-yellow-800',
		borderColor: 'border-yellow-300',
	},
	accepted: {
		label: 'Acceptée',
		color: 'blue',
		bgColor: 'bg-blue-100',
		textColor: 'text-blue-800',
		borderColor: 'border-blue-300',
	},
	active: {
		label: 'Active',
		color: 'green',
		bgColor: 'bg-green-100',
		textColor: 'text-green-800',
		borderColor: 'border-green-300',
	},
	completed: {
		label: 'Terminée',
		color: 'green',
		bgColor: 'bg-green-100',
		textColor: 'text-green-800',
		borderColor: 'border-green-300',
	},
	cancelled: {
		label: 'Annulée',
		color: 'red',
		bgColor: 'bg-red-100',
		textColor: 'text-red-800',
		borderColor: 'border-red-300',
	},
	rejected: {
		label: 'Refusée',
		color: 'red',
		bgColor: 'bg-red-100',
		textColor: 'text-red-800',
		borderColor: 'border-red-300',
	},
} as const;
