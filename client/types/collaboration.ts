import type { Property } from '@/lib/api/propertyApi';
import type { SearchAd } from './searchAd';

export interface Collaboration {
	_id: string;
	postId: string | Partial<Property> | Partial<SearchAd>;
	postType: 'Property' | 'SearchAd';
	postOwnerId: {
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
	compensationType?: 'percentage' | 'fixed_amount' | 'gift_vouchers';
	compensationAmount?: number;
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
		| 'retour_client'
		| 'offre_en_cours'
		| 'negociation_en_cours'
		| 'compromis_signe'
		| 'signature_notaire'
		| 'affaire_conclue';
	progressSteps: ProgressStepData[];

	activities: CollaborationActivity[];
	createdAt: string;
	updatedAt: string;
	completedAt?: string;

	// Completion/Termination details
	completionReason?:
		| 'vente_conclue_collaboration'
		| 'vente_conclue_seul'
		| 'bien_retire'
		| 'mandat_expire'
		| 'client_desiste'
		| 'vendu_tiers'
		| 'sans_suite';
	completedBy?: string; // User ID who marked it as completed
	completedByRole?: 'owner' | 'collaborator'; // Role of user who completed
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
		| 'retour_client'
		| 'offre_en_cours'
		| 'negociation_en_cours'
		| 'compromis_signe'
		| 'signature_notaire'
		| 'affaire_conclue';
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
	propertyId?: string;
	searchAdId?: string;
	collaboratorId?: string; // Optional - backend will use authenticated user if not provided
	commissionPercentage?: number;
	message?: string;
	compensationType?: 'percentage' | 'fixed_amount' | 'gift_vouchers';
	compensationAmount?: number;
}

export interface RespondToCollaborationRequest {
	response: 'accepted' | 'rejected';
}

export interface AddCollaborationNoteRequest {
	content: string;
}
