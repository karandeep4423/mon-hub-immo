export const STATUS_COLORS = {
	// Collaboration statuses
	pending: {
		bg: 'bg-yellow-100',
		text: 'text-yellow-800',
		border: 'border-yellow-200',
		label: 'En attente',
	},
	accepted: {
		bg: 'bg-blue-100',
		text: 'text-blue-800',
		border: 'border-blue-200',
		label: 'Acceptée',
	},
	active: {
		bg: 'bg-green-100',
		text: 'text-green-800',
		border: 'border-green-200',
		label: 'Active',
	},
	completed: {
		bg: 'bg-gray-100',
		text: 'text-gray-800',
		border: 'border-gray-200',
		label: 'Terminée',
	},
	rejected: {
		bg: 'bg-red-100',
		text: 'text-red-800',
		border: 'border-red-200',
		label: 'Refusée',
	},
	cancelled: {
		bg: 'bg-gray-100',
		text: 'text-gray-600',
		border: 'border-gray-200',
		label: 'Annulée',
	},
} as const;

export const STEP_INDICATOR_COLORS = {
	completed: 'bg-green-500 text-white',
	current: 'bg-blue-500 text-white',
	upcoming: 'bg-gray-200 text-gray-600',
} as const;

export type StatusType = keyof typeof STATUS_COLORS;
export type StepIndicatorState = keyof typeof STEP_INDICATOR_COLORS;
