import { User, Briefcase, Files, Settings } from 'lucide-react';
import { TabConfig } from './types';

export const INTERVENTION_RADIUS_OPTIONS = [
	{ value: '10', label: '10 km' },
	{ value: '20', label: '20 km' },
	{ value: '30', label: '30 km' },
	{ value: '50', label: '50 km' },
	{ value: '75', label: '75 km' },
	{ value: '100', label: '100 km' },
];

export const MANDATE_TYPE_OPTIONS = [
	{ value: 'simple', label: 'Simple' },
	{ value: 'exclusif', label: 'Exclusif' },
	{ value: 'co-mandat', label: 'Co-mandat' },
];

export const TABS: TabConfig[] = [
	{ id: 'personal', label: 'Personnel', icon: User },
	{ id: 'professional', label: 'Professionnel', icon: Briefcase },
	{ id: 'documents', label: 'Documents', icon: Files },
	{ id: 'account', label: 'Compte', icon: Settings },
];

export const formatDate = (date: string | Date | undefined) => {
	if (!date) return 'N/A';
	return new Date(date).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};
