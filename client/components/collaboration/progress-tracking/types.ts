// Progress Tracking Types (Workflow 2)
// Used for detailed step-by-step tracking between agents

export type ProgressStep =
	| 'proposal' // Initial proposal sent
	| 'accepted' // Proposal accepted
	| 'visit_planned' // Visit scheduled
	| 'visit_completed' // Property visit done
	| 'negotiation' // In negotiation phase
	| 'offer_made' // Offer submitted
	| 'compromise_signed' // Preliminary agreement signed
	| 'final_act'; // Final sale completed

export interface ProgressStepData {
	id: ProgressStep;
	title: string;
	description: string;
	completed: boolean;
	current: boolean;
	completedAt?: string;
	notes?: string;
}

export interface ProgressUpdate {
	step: ProgressStep;
	completed: boolean;
	notes?: string;
}

export interface ProgressStatusUpdate {
	targetStep: ProgressStep;
	notes?: string;
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
	proposal: {
		title: 'Proposition',
		description: 'Proposition envoyée',
		order: 1,
		icon: '📋',
	},
	accepted: {
		title: 'Acceptée',
		description: 'Proposition acceptée',
		order: 2,
		icon: '✅',
	},
	visit_planned: {
		title: 'Visite prévue',
		description: 'Visite planifiée',
		order: 3,
		icon: '📅',
	},
	visit_completed: {
		title: 'Visite réalisée',
		description: 'Visite effectuée',
		order: 4,
		icon: '🏠',
	},
	negotiation: {
		title: 'Négociation',
		description: 'En cours de négociation',
		order: 5,
		icon: '💬',
	},
	offer_made: {
		title: 'Offre',
		description: 'Offre déposée',
		order: 6,
		icon: '💰',
	},
	compromise_signed: {
		title: 'Compromis signé',
		description: 'Avant-contrat signé',
		order: 7,
		icon: '📝',
	},
	final_act: {
		title: 'Acte définitif',
		description: 'Vente finalisée',
		order: 8,
		icon: '🎉',
	},
} as const;
