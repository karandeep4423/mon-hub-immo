/**
 * Book Appointment Modal Constants
 * Multi-step appointment booking modal
 */

// ============================================================================
// MODAL CONFIG
// ============================================================================

export const BOOK_APPOINTMENT_MODAL = {
	title: 'Prendre rendez-vous',
	subtitle: (agentName: string) => `avec ${agentName}`,
	size: 'xl',
	maxHeight: 'max-h-[90vh]',
} as const;

// ============================================================================
// STEPS
// ============================================================================

export const BOOK_APPOINTMENT_STEPS = {
	1: {
		key: 1,
		label: 'Type & Date',
		title: 'Type de rendez-vous et date',
	},
	2: {
		key: 2,
		label: 'Horaire',
		title: 'Choisissez un horaire',
	},
	3: {
		key: 3,
		label: 'Coordonnées',
		title: 'Vos informations',
	},
} as const;

export const BOOK_APPOINTMENT_STEP_LABELS = [
	'Type & Date',
	'Horaire',
	'Coordonnées',
] as const;

// ============================================================================
// APPOINTMENT TYPES
// ============================================================================

export const BOOK_APPOINTMENT_TYPES = {
	conseil: {
		value: 'conseil',
		label: 'Conseil immobilier',
		icon: '💼',
		description: 'Obtenir des conseils personnalisés',
		duration: 30,
	},
	visite: {
		value: 'visite',
		label: 'Visite de bien',
		icon: '🏠',
		description: 'Visiter un bien immobilier',
		duration: 60,
	},
	estimation: {
		value: 'estimation',
		label: 'Estimation de bien',
		icon: '📊',
		description: 'Faire estimer votre bien',
		duration: 45,
	},
	signature: {
		value: 'signature',
		label: 'Signature de contrat',
		icon: '📝',
		description: 'Finaliser une transaction',
		duration: 60,
	},
	autre: {
		value: 'autre',
		label: 'Autre',
		icon: '📅',
		description: 'Autre type de rendez-vous',
		duration: 30,
	},
} as const;

export type AppointmentType = keyof typeof BOOK_APPOINTMENT_TYPES;

// ============================================================================
// DATE SELECTION
// ============================================================================

export const BOOK_APPOINTMENT_DATE = {
	minDaysAhead: 1, // Minimum 1 day in the future
	maxDaysAhead: 60, // Maximum 60 days in the future
	label: 'Date du rendez-vous',
	placeholder: 'Sélectionnez une date',
	formatDisplay: 'EEEE d MMMM yyyy', // e.g., "Lundi 15 janvier 2025"
	formatValue: 'yyyy-MM-dd', // ISO format
} as const;

// ============================================================================
// TIME SLOTS
// ============================================================================

export const BOOK_APPOINTMENT_TIME_SLOTS = {
	loading: 'Chargement des créneaux disponibles...',
	noSlotsAvailable: 'Aucun créneau disponible pour cette date',
	selectDate: "Sélectionnez d'abord une date",
	slotFormat: 'HH:mm', // e.g., "14:30"
	slotDuration: 30, // minutes
} as const;

// ============================================================================
// CONTACT DETAILS
// ============================================================================

export const BOOK_APPOINTMENT_CONTACT = {
	name: {
		label: 'Nom complet',
		placeholder: 'Votre nom',
		required: true,
	},
	email: {
		label: 'Email',
		placeholder: 'votre.email@example.com',
		required: true,
	},
	phone: {
		label: 'Téléphone',
		placeholder: '06 12 34 56 78',
		required: true,
	},
	notes: {
		label: 'Notes ou questions (optionnel)',
		placeholder: 'Parlez-nous de vos besoins...',
		maxLength: 500,
		required: false,
	},
} as const;

// ============================================================================
// PROPERTY DETAILS
// ============================================================================

export const BOOK_APPOINTMENT_PROPERTY = {
	address: {
		label: 'Adresse du bien',
		placeholder: '123 rue Example, Paris',
		required: false,
	},
	propertyType: {
		label: 'Type de bien',
		placeholder: 'Appartement, Maison...',
		required: false,
	},
	budget: {
		label: 'Budget',
		placeholder: 'Votre budget',
		required: false,
	},
} as const;

// ============================================================================
// BUTTONS
// ============================================================================

export const BOOK_APPOINTMENT_BUTTONS = {
	previous: 'Précédent',
	next: 'Suivant',
	submit: 'Confirmer le rendez-vous',
	cancel: 'Annuler',
	submitting: 'Envoi en cours...',
} as const;

// ============================================================================
// SUCCESS
// ============================================================================

export const BOOK_APPOINTMENT_SUCCESS = {
	title: 'Rendez-vous confirmé !',
	message: 'Votre demande de rendez-vous a été envoyée avec succès.',
	details: 'Vous recevrez une confirmation par email.',
	close: 'Fermer',
} as const;

// ============================================================================
// VALIDATION
// ============================================================================

export const BOOK_APPOINTMENT_VALIDATION = {
	required: 'Ce champ est obligatoire',
	invalidEmail: 'Email invalide',
	invalidPhone: 'Numéro de téléphone invalide',
	selectDate: 'Veuillez sélectionner une date',
	selectTime: 'Veuillez sélectionner un horaire',
	selectType: 'Veuillez sélectionner un type de rendez-vous',
	dateInPast: 'La date doit être dans le futur',
	dateTooFar: 'La date ne peut pas dépasser 60 jours',
} as const;

// ============================================================================
// PROGRESS STEPPER
// ============================================================================

export const BOOK_APPOINTMENT_PROGRESS = {
	backgroundColor: 'bg-gray-200',
	activeColor: 'bg-brand',
	circleSize: {
		mobile: 'w-10 h-10',
		desktop: 'w-12 h-12',
	},
	activeClasses:
		'bg-brand text-white border-brand shadow-xl ring-4 ring-brand/20 scale-110',
	completedClasses: 'bg-brand text-white border-brand shadow-lg',
	pendingClasses: 'bg-white text-gray-400 border-gray-300',
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const BOOK_APPOINTMENT_ERRORS = {
	loadSlots: 'Erreur lors du chargement des créneaux disponibles',
	submit: 'Erreur lors de la réservation du rendez-vous',
	network: 'Erreur de connexion. Veuillez réessayer.',
	unauthorized: 'Vous devez être connecté pour prendre rendez-vous',
	agentUnavailable: "Cet agent n'est pas disponible pour le moment",
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const BOOK_APPOINTMENT_A11Y = {
	modal: 'Fenêtre de réservation de rendez-vous',
	closeButton: 'Fermer la fenêtre',
	stepIndicator: (step: number, total: number) =>
		`Étape ${step} sur ${total}`,
	previousButton: "Retour à l'étape précédente",
	nextButton: "Passer à l'étape suivante",
	submitButton: 'Confirmer la réservation',
} as const;
