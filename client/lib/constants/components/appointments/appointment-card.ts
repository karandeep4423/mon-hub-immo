/**
 * Appointment Card Constants
 * Appointment display card component
 */

// ============================================================================
// CARD CONFIG
// ============================================================================

export const APPOINTMENT_CARD = {
	className:
		'bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow',
	imageSize: 'w-16 h-16',
	avatarSize: 'w-12 h-12',
} as const;

// ============================================================================
// STATUS BADGES
// ============================================================================

export const APPOINTMENT_STATUS_BADGES = {
	pending: {
		label: 'En attente',
		color: 'bg-yellow-100 text-yellow-800',
		icon: '⏳',
	},
	confirmed: {
		label: 'Confirmé',
		color: 'bg-green-100 text-green-800',
		icon: '✓',
	},
	cancelled: {
		label: 'Annulé',
		color: 'bg-red-100 text-red-800',
		icon: '✕',
	},
	completed: {
		label: 'Terminé',
		color: 'bg-blue-100 text-blue-800',
		icon: '✓',
	},
	rescheduled: {
		label: 'Reporté',
		color: 'bg-purple-100 text-purple-800',
		icon: '↻',
	},
} as const;

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS_BADGES;

// ============================================================================
// TYPE LABELS
// ============================================================================

export const APPOINTMENT_TYPE_LABELS = {
	conseil: 'Conseil immobilier',
	visite: 'Visite de bien',
	estimation: 'Estimation',
	signature: 'Signature',
	autre: 'Autre',
} as const;

// ============================================================================
// TYPE ICONS
// ============================================================================

export const APPOINTMENT_TYPE_ICONS = {
	conseil: '💼',
	visite: '🏠',
	estimation: '📊',
	signature: '📝',
	autre: '📅',
} as const;

// ============================================================================
// ACTIONS
// ============================================================================

export const APPOINTMENT_CARD_ACTIONS = {
	view: 'Voir les détails',
	reschedule: 'Reporter',
	cancel: 'Annuler',
	confirm: 'Confirmer',
	message: 'Envoyer un message',
	directions: 'Itinéraire',
	join: 'Rejoindre',
} as const;

// ============================================================================
// DATE FORMAT
// ============================================================================

export const APPOINTMENT_CARD_DATE = {
	format: 'EEEE d MMMM yyyy', // e.g., "Lundi 15 janvier 2025"
	timeFormat: 'HH:mm', // e.g., "14:30"
	relativeFormat: {
		today: "Aujourd'hui",
		tomorrow: 'Demain',
		yesterday: 'Hier',
	},
} as const;

// ============================================================================
// LABELS
// ============================================================================

export const APPOINTMENT_CARD_LABELS = {
	with: 'avec',
	on: 'le',
	at: 'à',
	duration: 'Durée',
	location: 'Lieu',
	notes: 'Notes',
	minutes: 'min',
	remote: 'À distance',
	inPerson: 'En personne',
} as const;

// ============================================================================
// EMPTY STATE
// ============================================================================

export const APPOINTMENT_CARD_EMPTY = {
	title: 'Aucun rendez-vous',
	message: "Vous n'avez pas de rendez-vous prévu",
	action: 'Prendre rendez-vous',
} as const;

// ============================================================================
// CONFIRM DIALOGS
// ============================================================================

export const APPOINTMENT_CARD_CONFIRM = {
	cancel: {
		title: 'Annuler le rendez-vous',
		message: 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
		confirm: 'Oui, annuler',
		cancel: 'Non, garder',
	},
	delete: {
		title: 'Supprimer le rendez-vous',
		message: 'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
		confirm: 'Supprimer',
		cancel: 'Annuler',
	},
} as const;
