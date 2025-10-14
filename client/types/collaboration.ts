import type { Property } from '@/lib/api/propertyApi';

export interface Collaboration {
	_id: string;
	propertyId: string | Partial<Property>;
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
		| 'accord_collaboration'
		| 'premier_contact'
		| 'visite_programmee'
		| 'visite_realisee'
		| 'retour_client';
	progressSteps: ProgressStepData[];

	activities: CollaborationActivity[];
	createdAt: string;
	updatedAt: string;
}

export interface StepNote {
	note: string;
	createdBy: {
		_id: string;
		firstName?: string;
		lastName?: string;
		profileImage?: string | null;
	};
	createdAt: string;
}

export interface ProgressStepData {
	id:
		| 'accord_collaboration'
		| 'premier_contact'
		| 'visite_programmee'
		| 'visite_realisee'
		| 'retour_client';
	completed: boolean;
	validatedAt?: string;
	ownerValidated: boolean;
	collaboratorValidated: boolean;
	notes: StepNote[];
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
	message?: string;
}

export interface RespondToCollaborationRequest {
	response: 'accepted' | 'rejected';
}

export interface AddCollaborationNoteRequest {
	content: string;
}
