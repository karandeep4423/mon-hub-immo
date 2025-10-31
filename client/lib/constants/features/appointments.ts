/**
 * Appointments Feature Constants
 * All appointment-related constants: statuses, routes, messages, UI text
 */

// ============================================================================
// APPOINTMENT STATUSES
// ============================================================================

/**
 * Appointment Status Values (lowercase - matches database)
 * Use these for comparisons and API calls
 */
export const APPOINTMENT_STATUS_VALUES = {
	PENDING: 'pending',
	CONFIRMED: 'confirmed',
	CANCELLED: 'cancelled',
	COMPLETED: 'completed',
	REJECTED: 'rejected',
} as const;

/**
 * Appointment Status Labels (French display text)
 * @deprecated Use APPOINTMENT_STATUS_CONFIG for display labels
 */
export const APPOINTMENT_STATUSES = {
	PENDING: 'En attente',
	CONFIRMED: 'Confirmé',
	CANCELLED: 'Annulé',
	COMPLETED: 'Terminé',
	REJECTED: 'Refusé',
} as const;

export type AppointmentStatus =
	(typeof APPOINTMENT_STATUS_VALUES)[keyof typeof APPOINTMENT_STATUS_VALUES];

/**
 * Appointment Status Configuration
 */
export interface StatusConfig {
	label: string;
	variant: 'success' | 'warning' | 'error' | 'info' | 'default';
	className: string;
}

export const APPOINTMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
	pending: {
		label: 'En attente',
		variant: 'warning',
		className: 'bg-yellow-100 text-yellow-800',
	},
	confirmed: {
		label: 'Confirmé',
		variant: 'success',
		className: 'bg-green-100 text-green-800',
	},
	cancelled: {
		label: 'Annulé',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
	completed: {
		label: 'Terminé',
		variant: 'info',
		className: 'bg-info-light text-info',
	},
	rejected: {
		label: 'Refusé',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
} as const;

// ============================================================================
// UI TEXT
// ============================================================================

export const APPOINTMENT_UI_TEXT = {
	// Page titles
	title: 'Rendez-vous',
	myAppointments: 'Mes rendez-vous',
	upcomingAppointments: 'Rendez-vous à venir',
	pastAppointments: 'Rendez-vous passés',
	bookAppointment: 'Réserver un rendez-vous',

	// Actions
	confirm: 'Confirmer',
	cancel: 'Annuler',
	reschedule: 'Reprogrammer',
	complete: 'Marquer comme complété',
	view: 'Voir les détails',

	// Status messages
	loading: 'Chargement des rendez-vous...',
	noAppointments: 'Aucun rendez-vous pour le moment',
	selectDateTime: 'Sélectionnez une date et une heure',
	noSlotsAvailable: 'Aucun créneau disponible pour cette date',

	// Form labels
	date: 'Date',
	time: 'Heure',
	duration: 'Durée',
	location: 'Lieu',
	notes: 'Notes',
	propertyAddress: 'Adresse du bien',
	agentName: 'Agent',
	clientName: 'Client',

	// Empty states
	noUpcomingAppointments: 'Aucun rendez-vous à venir',
	noPastAppointments: 'Aucun rendez-vous passé',
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const APPOINTMENT_TOAST_MESSAGES = {
	// CRUD operations
	FETCH_ERROR: 'Échec du chargement des rendez-vous',
	CREATE_SUCCESS: 'Rendez-vous créé avec succès',
	CREATE_ERROR: 'Erreur lors de la création du rendez-vous',
	UPDATE_SUCCESS: 'Rendez-vous mis à jour',
	UPDATE_ERROR: 'Erreur lors de la mise à jour du rendez-vous',

	// Status changes
	CANCEL_SUCCESS: 'Rendez-vous annulé',
	CANCEL_ERROR: "Erreur lors de l'annulation du rendez-vous",
	CONFIRM_SUCCESS: 'Rendez-vous confirmé',
	CONFIRM_ERROR: 'Erreur lors de la confirmation du rendez-vous',
	COMPLETE_SUCCESS: 'Rendez-vous marqué comme complété',
	COMPLETE_ERROR: 'Erreur lors du marquage comme complété',

	// Reschedule
	RESCHEDULE_SUCCESS: 'Rendez-vous reprogrammé avec succès !',
	RESCHEDULE_ERROR:
		'Une erreur est survenue lors de la reprogrammation du rendez-vous',

	// Validation
	NO_SLOTS_AVAILABLE: 'Aucun créneau disponible pour cette date',
	SELECT_DATE_TIME: 'Veuillez sélectionner une date et une heure',
	LOAD_SLOTS_ERROR: 'Erreur lors du chargement des créneaux',
} as const;

// ============================================================================
// AVAILABILITY MESSAGES
// ============================================================================

export const AVAILABILITY_TOAST_MESSAGES = {
	AUTO_SAVE_SUCCESS: 'Modifications enregistrées automatiquement',
	UPDATE_SUCCESS: 'Disponibilités mises à jour',
	UPDATE_ERROR: 'Erreur lors de la mise à jour des disponibilités',
	SAVE_ERROR: 'Erreur lors de la sauvegarde',
	FETCH_ERROR: 'Erreur lors du chargement des disponibilités',
	BLOCK_DATE_SUCCESS: 'Date bloquée avec succès',
	UNBLOCK_DATE_SUCCESS: 'Date débloquée avec succès',
	OVERLAPPING_SLOTS: 'Les créneaux horaires se chevauchent',
	INVALID_TIME_RANGE: 'Plage horaire invalide',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const APPOINTMENT_ENDPOINTS = {
	LIST: '/appointments',
	CREATE: '/appointments',
	GET_BY_ID: (id: string) => `/appointments/${id}`,
	UPDATE: (id: string) => `/appointments/${id}`,
	DELETE: (id: string) => `/appointments/${id}`,
	CONFIRM: (id: string) => `/appointments/${id}/confirm`,
	CANCEL: (id: string) => `/appointments/${id}/cancel`,
	RESCHEDULE: (id: string) => `/appointments/${id}/reschedule`,
	COMPLETE: (id: string) => `/appointments/${id}/complete`,
	AVAILABLE_SLOTS: '/appointments/available-slots',
	MY_APPOINTMENTS: '/appointments/my-appointments',
} as const;

export const AVAILABILITY_ENDPOINTS = {
	GET: '/availability',
	UPDATE: '/availability',
	BLOCK_DATE: '/availability/block',
	UNBLOCK_DATE: '/availability/unblock',
	GET_SLOTS: '/availability/slots',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const APPOINTMENT_ROUTES = {
	LIST: '/appointments',
	CREATE: '/appointments/create',
	DETAIL: (id: string) => `/appointments/${id}`,
	MY_APPOINTMENTS: '/dashboard/my-appointments',
	AVAILABILITY: '/dashboard/availability',
} as const;

// ============================================================================
// TIME SLOTS
// ============================================================================

export const DEFAULT_TIME_SLOTS = [
	'09:00',
	'09:30',
	'10:00',
	'10:30',
	'11:00',
	'11:30',
	'12:00',
	'12:30',
	'13:00',
	'13:30',
	'14:00',
	'14:30',
	'15:00',
	'15:30',
	'16:00',
	'16:30',
	'17:00',
	'17:30',
	'18:00',
] as const;

export const APPOINTMENT_DURATIONS = {
	SHORT: 30, // 30 minutes
	MEDIUM: 60, // 1 hour
	LONG: 90, // 1.5 hours
	EXTENDED: 120, // 2 hours
} as const;

export type AppointmentDuration =
	(typeof APPOINTMENT_DURATIONS)[keyof typeof APPOINTMENT_DURATIONS];

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const APPOINTMENT_ERRORS = {
	SAVE_FAILED: 'Erreur lors de la sauvegarde',
	LOAD_FAILED: 'Erreur lors du chargement des disponibilités',
	BLOCK_DATE_FAILED: 'Erreur lors du blocage de la date',
	UNBLOCK_DATE_FAILED: 'Erreur lors du déblocage de la date',
	RESCHEDULE_FAILED: 'Erreur lors de la reprogrammation',
	CANCEL_FAILED: "Erreur lors de l'annulation",
	BOOKING_FAILED: 'Erreur lors de la réservation',
} as const;

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const APPOINTMENT_LOADING = {
	AVAILABILITY: 'Chargement des disponibilités...',
	APPOINTMENTS: 'Chargement des rendez-vous...',
	SLOTS: 'Chargement des créneaux...',
	SAVING: 'Enregistrement en cours...',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const APPOINTMENT_SUCCESS = {
	SAVED: 'Disponibilités enregistrées',
	BLOCKED: 'Date bloquée avec succès',
	UNBLOCKED: 'Date débloquée avec succès',
	RESCHEDULED: 'Rendez-vous reprogrammé',
	CANCELLED: 'Rendez-vous annulé',
	BOOKED: 'Rendez-vous réservé avec succès',
} as const;

// ============================================================================
// CONFIRMATION DIALOGS
// ============================================================================

export const APPOINTMENT_CONFIRMATION_DIALOGS = {
	// Accept Appointment
	ACCEPT_DESCRIPTION: (appointmentType: string, userName: string) =>
		`Êtes-vous sûr de vouloir accepter ce rendez-vous de type "${appointmentType}" avec ${userName} ?`,

	// Reject Appointment
	REJECT_DESCRIPTION: (userName: string) =>
		`Êtes-vous sûr de vouloir refuser ce rendez-vous avec ${userName} ? Cette action est irréversible.`,

	// Unblock Date
	UNBLOCK_TITLE: 'Débloquer cette date',
	UNBLOCK_DESCRIPTION: (date: string) =>
		`Êtes-vous sûr de vouloir débloquer la date du ${date} ?`,

	// Common Buttons
	CANCEL_BUTTON: 'Annuler',
} as const;

// ============================================================================
// FORM PLACEHOLDERS
// ============================================================================

export const APPOINTMENT_FORM_PLACEHOLDERS = {
	// Booking Step 3
	PROPERTY_ADDRESS_HINT: 'Ex: 123 rue de la Paix, Paris',
	NOTES_HINT: 'Décrivez votre projet ou vos questions...',

	// Time/Date Selection
	TIME_SLOT_SELECT: 'Sélectionner un créneau',
	DATE_SELECT: 'Sélectionner une date',
} as const;
