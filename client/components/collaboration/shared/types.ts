// Shared types between both workflows

import { OverallCollaborationStatus } from '../overall-status/types';
import { ProgressStep } from '../progress-tracking/types';

export interface BaseCollaboration {
	_id: string;
	postId: string;
	postType: 'Property' | 'SearchAd';
	postOwnerId: {
		_id: string;
		firstName: string;
		lastName: string;
	};
	collaboratorId: {
		_id: string;
		firstName: string;
		lastName: string;
	};
	proposedCommission: number;
	proposalMessage: string;
	activities: CollaborationActivity[];
	createdAt: string;
	updatedAt: string;
}

// Extended with both workflow statuses
export interface Collaboration extends BaseCollaboration {
	// Workflow 1: Overall status
	status: OverallCollaborationStatus;

	// Workflow 2: Progress tracking
	currentProgressStep: ProgressStep;
	progressHistory: ProgressStepData[];

	// Contract related (separate from workflows)
	ownerSigned: boolean;
	ownerSignedAt?: string;
	collaboratorSigned: boolean;
	collaboratorSignedAt?: string;
	contractText?: string;
	additionalTerms?: string;
	contractModified?: boolean;
}

export interface CollaborationActivity {
	type:
		| 'overall_status_change' // Workflow 1 status change
		| 'progress_step_update' // Workflow 2 step update
		| 'contract_action' // Contract related
		| 'note' // Manual note
		| 'system'; // System generated
	message: string;
	createdBy: string;
	createdAt: string;
	metadata?: {
		previousStatus?: OverallCollaborationStatus;
		newStatus?: OverallCollaborationStatus;
		progressStep?: ProgressStep;
		stepCompleted?: boolean;
	};
}

// For API requests
export interface ProposeCollaborationRequest {
	propertyId: string;
	collaboratorId?: string;
	commissionPercentage: number;
	message: string;
}

export interface AddCollaborationNoteRequest {
	content: string;
}

// Progress step data (imported from progress-tracking types)
export interface ProgressStepData {
	id: ProgressStep;
	title: string;
	description: string;
	completed: boolean;
	current: boolean;
	completedAt?: string;
	notes?: string;
}
