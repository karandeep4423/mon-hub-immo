export interface Collaboration {
	_id: string;
	propertyId: string;
	propertyOwnerId: {
		_id: string;
		firstName: string;
		lastName: string;
		profileImage?: string | null;
	};
	collaboratorId: {
		_id: string;
		firstName: string;
		lastName: string;
		profileImage?: string | null;
	};
	status:
		| 'pending'
		| 'accepted'
		| 'active'
		| 'completed'
		| 'cancelled'
		| 'rejected';
	proposedCommission: number;
	proposalMessage: string;
	ownerSigned: boolean;
	ownerSignedAt?: string;
	collaboratorSigned: boolean;
	collaboratorSignedAt?: string;
	contractText?: string;
	additionalTerms?: string;
	contractModified?: boolean;
	currentStep: 'proposal' | 'contract_signing' | 'active' | 'completed';

	// Progress tracking
	currentProgressStep:
		| 'proposal'
		| 'accepted'
		| 'visit_planned'
		| 'visit_completed'
		| 'negotiation'
		| 'offer_made'
		| 'compromise_signed'
		| 'final_act';
	progressSteps: ProgressStepData[];

	activities: CollaborationActivity[];
	createdAt: string;
	updatedAt: string;
}

export interface ProgressStepData {
	id:
		| 'proposal'
		| 'accepted'
		| 'visit_planned'
		| 'visit_completed'
		| 'negotiation'
		| 'offer_made'
		| 'compromise_signed'
		| 'final_act';
	completed: boolean;
	completedAt?: string;
	notes?: string;
	completedBy?: string;
}

export interface CollaborationActivity {
	type:
		| 'proposal'
		| 'acceptance'
		| 'rejection'
		| 'signing'
		| 'status_update'
		| 'progress_step_update'
		| 'note';
	message: string;
	createdBy: string;
	createdAt: string;
}

export interface ProposeCollaborationRequest {
	propertyId: string;
	collaboratorId?: string; // Optional - backend will use authenticated user if not provided
	commissionPercentage: number;
	message: string;
}

export interface RespondToCollaborationRequest {
	response: 'accepted' | 'rejected';
}

export interface AddCollaborationNoteRequest {
	content: string;
}
