export interface ProfileCompletionFormData extends Record<string, unknown> {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	profileImage: string;
	postalCode: string;
	city: string;
	interventionRadius: number;
	coveredCities: string;
	network: string;
	siretNumber: string;
	sirenNumber: string;
	agentType: string;
	tCard: string;
	rsacNumber: string;
	collaboratorCertificate: string;
	mandateTypes: string[];
	yearsExperience: string;
	personalPitch: string;
	collaborateWithAgents: boolean;
	shareCommission: boolean;
	independentAgent: boolean;
	alertsEnabled: boolean;
	alertFrequency: 'quotidien' | 'hebdomadaire';
	acceptTerms: boolean;
}

export type AgentType = 'independent' | 'commercial' | 'employee' | undefined;

export const AGENT_TYPE_LABELS: Record<string, string> = {
	independent: 'Agent immobilier indépendant',
	commercial: 'Agent commercial immobilier',
	employee: "Négociateur VRP employé d'agence",
};

export const AGENT_TYPE_OPTIONS = [
	{ value: 'independent', label: 'Agent immobilier indépendant' },
	{ value: 'commercial', label: 'Agent commercial immobilier' },
	{ value: 'employee', label: "Négociateur VRP employé d'agence" },
];

export const INTERVENTION_RADIUS_OPTIONS = [
	{ value: '10', label: '10 km' },
	{ value: '20', label: '20 km' },
	{ value: '30', label: '30 km' },
	{ value: '50', label: '50 km' },
	{ value: '100', label: '100 km' },
];

export const MANDATE_TYPE_OPTIONS = [
	{ id: 'simple', label: 'Simple' },
	{ id: 'exclusif', label: 'Exclusif' },
	{ id: 'co-mandat', label: 'Co-mandat' },
];
