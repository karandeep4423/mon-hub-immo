// Progress Tracking Types (Workflow 2)
// Used for detailed step-by-step tracking between agents

export type ProgressStep =
	| 'accord_collaboration' // Collaboration agreement
	| 'premier_contact' // First client contact
	| 'visite_programmee' // Scheduled visit
	| 'visite_realisee' // Completed visit
	| 'retour_client' // Client feedback
	| 'offre_en_cours' // Offer in progress
	| 'negociation_en_cours' // Negotiation in progress
	| 'compromis_signe' // Sales agreement signed
	| 'signature_notaire' // Notary signature
	| 'affaire_conclue'; // Deal closed

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
	id: ProgressStep;
	title: string;
	description: string;
	completed: boolean;
	current: boolean;
	validatedAt?: string; // Date when first agent validated
	ownerValidated: boolean;
	collaboratorValidated: boolean;
	notes: StepNote[]; // Multiple notes from different agents
}

export interface ProgressUpdate {
	step: ProgressStep;
	completed: boolean;
	notes?: string;
}

export interface ProgressStatusUpdate {
	targetStep: ProgressStep;
	notes?: string;
	validatedBy: 'owner' | 'collaborator'; // Who is validating
}

export interface ProgressTrackingProps {
	collaborationId: string;
	currentStep: ProgressStep;
	steps: ProgressStepData[];
	canUpdate: boolean;
	onStepUpdate?: (update: ProgressUpdate) => void;
	onStatusUpdate?: (update: ProgressStatusUpdate) => Promise<void>;
}

// Step configuration for display and logic
export const PROGRESS_STEPS_CONFIG: Record<
	ProgressStep,
	{
		title: string;
		description: string;
		order: number;
		icon: string;
	}
> = {
	accord_collaboration: {
		title: 'Accord de collaboration',
		description: 'Accord validé par les deux agents',
		order: 1,
		icon: '🤝',
	},
	premier_contact: {
		title: 'Premier contact client',
		description: 'Contact initial avec le client',
		order: 2,
		icon: '📞',
	},
	visite_programmee: {
		title: 'Visite programmée',
		description: 'Visite planifiée avec le client',
		order: 3,
		icon: '📅',
	},
	visite_realisee: {
		title: 'Visite réalisée',
		description: 'Visite effectuée',
		order: 4,
		icon: '🏠',
	},
	retour_client: {
		title: 'Retour client',
		description: 'Feedback du client reçu',
		order: 5,
		icon: '💬',
	},
	offre_en_cours: {
		title: 'Offre en cours',
		description: 'Une offre a été déposée',
		order: 6,
		icon: '📝',
	},
	negociation_en_cours: {
		title: 'Négociation en cours',
		description: 'Négociation active avec le client',
		order: 7,
		icon: '🤝',
	},
	compromis_signe: {
		title: 'Compromis signé',
		description: 'Compromis de vente validé',
		order: 8,
		icon: '✅',
	},
	signature_notaire: {
		title: 'Signature notaire',
		description: 'Acte authentique signé',
		order: 9,
		icon: '📜',
	},
	affaire_conclue: {
		title: 'Affaire conclue',
		description: 'Collaboration réussie et clôturée avec BRAVO',
		order: 10,
		icon: '🎉',
	},
} as const;
