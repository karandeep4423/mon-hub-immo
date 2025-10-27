/**
 * Collaboration Detail Page Constants
 * Individual collaboration page at "/collaboration/[id]"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const COLLABORATION_DETAIL_PAGE = {
	title: 'Détails de la collaboration',
	description: 'Gérez votre collaboration immobilière',
	path: '/collaboration/[id]',
} as const;

// ============================================================================
// SECTIONS
// ============================================================================

export const COLLABORATION_DETAIL_SECTIONS = {
	header: 'En-tête',
	participants: 'Participants',
	contract: 'Contrat',
	timeline: 'Historique',
	progress: 'Progression',
	clientInfo: 'Informations client',
	postInfo: 'Annonce liée',
	chat: 'Discussion',
	notes: 'Notes',
	fees: 'Honoraires',
} as const;

// ============================================================================
// ACTION BUTTONS
// ============================================================================

export const COLLABORATION_DETAIL_ACTIONS = {
	accept: {
		label: 'Accepter',
		variant: 'success',
		icon: 'check',
	},
	reject: {
		label: 'Refuser',
		variant: 'danger',
		icon: 'x',
	},
	cancel: {
		label: 'Annuler',
		variant: 'danger',
		icon: 'x-circle',
	},
	complete: {
		label: 'Terminer',
		variant: 'success',
		icon: 'check-circle',
	},
	generateContract: {
		label: 'Générer le contrat',
		variant: 'primary',
		icon: 'file-text',
	},
	viewContract: {
		label: 'Voir le contrat',
		variant: 'secondary',
		icon: 'eye',
	},
	downloadContract: {
		label: 'Télécharger le contrat',
		variant: 'secondary',
		icon: 'download',
	},
	signContract: {
		label: 'Signer le contrat',
		variant: 'primary',
		icon: 'pen',
	},
	openChat: {
		label: 'Ouvrir la discussion',
		variant: 'secondary',
		icon: 'message-circle',
	},
	addNote: {
		label: 'Ajouter une note',
		variant: 'secondary',
		icon: 'plus',
	},
	updateFees: {
		label: 'Modifier les honoraires',
		variant: 'secondary',
		icon: 'edit',
	},
	updateClient: {
		label: 'Modifier les informations client',
		variant: 'secondary',
		icon: 'edit',
	},
} as const;

// ============================================================================
// CONFIRM DIALOGS
// ============================================================================

export const COLLABORATION_DETAIL_CONFIRM = {
	accept: {
		title: 'Accepter la collaboration',
		message: 'Êtes-vous sûr de vouloir accepter cette collaboration ?',
		confirmButton: 'Accepter',
		cancelButton: 'Annuler',
	},
	reject: {
		title: 'Refuser la collaboration',
		message:
			'Êtes-vous sûr de vouloir refuser cette collaboration ? Cette action est irréversible.',
		confirmButton: 'Refuser',
		cancelButton: 'Annuler',
	},
	cancel: {
		title: 'Annuler la collaboration',
		message:
			'Êtes-vous sûr de vouloir annuler cette collaboration ? Cette action est irréversible.',
		confirmButton: 'Annuler la collaboration',
		cancelButton: 'Retour',
	},
	complete: {
		title: 'Terminer la collaboration',
		message:
			'Êtes-vous sûr de vouloir marquer cette collaboration comme terminée ?',
		confirmButton: 'Terminer',
		cancelButton: 'Annuler',
	},
} as const;

// ============================================================================
// HEADER INFO
// ============================================================================

export const COLLABORATION_DETAIL_HEADER = {
	statusLabel: 'Statut',
	createdLabel: 'Créée le',
	updatedLabel: 'Mise à jour le',
	referenceLabel: 'Référence',
	backButton: 'Retour aux collaborations',
} as const;

// ============================================================================
// PARTICIPANTS INFO
// ============================================================================

export const COLLABORATION_DETAIL_PARTICIPANTS = {
	title: 'Participants',
	postOwner: "Propriétaire de l'annonce",
	collaborator: 'Collaborateur',
	role: 'Rôle',
	contact: 'Contact',
	email: 'Email',
	phone: 'Téléphone',
	agent: 'Agent',
	apporteur: 'Apporteur',
} as const;

// ============================================================================
// CONTRACT INFO
// ============================================================================

export const COLLABORATION_DETAIL_CONTRACT = {
	title: 'Contrat de collaboration',
	status: 'Statut du contrat',
	notGenerated: 'Contrat non généré',
	unsigned: 'En attente de signature',
	partiallySigned: 'Signé par une partie',
	fullySigned: 'Signé par les deux parties',
	signedBy: 'Signé par',
	signedAt: 'Signé le',
	waitingSignature: 'En attente de signature de',
	agencyFees: 'Honoraires agence',
	apporteurCompensation: 'Rémunération apporteur',
	totalAmount: 'Montant total',
} as const;

// ============================================================================
// TIMELINE
// ============================================================================

export const COLLABORATION_DETAIL_TIMELINE = {
	title: 'Historique',
	noActivity: 'Aucune activité pour le moment',
	created: 'Collaboration créée',
	accepted: 'Collaboration acceptée',
	rejected: 'Collaboration refusée',
	cancelled: 'Collaboration annulée',
	completed: 'Collaboration terminée',
	contractGenerated: 'Contrat généré',
	contractSigned: 'Contrat signé',
	progressUpdated: 'Progression mise à jour',
	noteAdded: 'Note ajoutée',
	feesUpdated: 'Honoraires mis à jour',
	clientUpdated: 'Informations client mises à jour',
} as const;

// ============================================================================
// PROGRESS TRACKER
// ============================================================================

export const COLLABORATION_DETAIL_PROGRESS = {
	title: 'Suivi de la progression',
	currentStep: 'Étape actuelle',
	completedSteps: 'Étapes complétées',
	remainingSteps: 'Étapes restantes',
	updateProgress: 'Mettre à jour la progression',
	validateStep: 'Valider cette étape',
	stepValidated: 'Étape validée',
	stepPending: 'En attente',
} as const;

// ============================================================================
// CLIENT INFO
// ============================================================================

export const COLLABORATION_DETAIL_CLIENT = {
	title: 'Informations client',
	noClient: 'Aucune information client',
	name: 'Nom du client',
	email: 'Email',
	phone: 'Téléphone',
	budget: 'Budget',
	notes: 'Notes',
	preferences: 'Préférences',
} as const;

// ============================================================================
// POST INFO
// ============================================================================

export const COLLABORATION_DETAIL_POST = {
	title: 'Annonce liée',
	property: 'Bien immobilier',
	searchAd: 'Recherche',
	viewProperty: 'Voir le bien',
	viewSearchAd: 'Voir la recherche',
	type: 'Type',
	location: 'Localisation',
	price: 'Prix',
	surface: 'Surface',
} as const;

// ============================================================================
// CHAT
// ============================================================================

export const COLLABORATION_DETAIL_CHAT = {
	title: 'Discussion',
	openChat: 'Ouvrir la discussion',
	closeChat: 'Fermer la discussion',
	newMessages: (count: number) =>
		`${count} nouveau${count !== 1 ? 'x' : ''} message${count !== 1 ? 's' : ''}`,
	noMessages: 'Aucun message',
} as const;

// ============================================================================
// NOTES
// ============================================================================

export const COLLABORATION_DETAIL_NOTES = {
	title: 'Notes',
	addNote: 'Ajouter une note',
	noNotes: 'Aucune note pour le moment',
	notePlaceholder: 'Saisissez votre note...',
	saveNote: 'Enregistrer',
	cancelNote: 'Annuler',
	deleteNote: 'Supprimer',
	editNote: 'Modifier',
	noteBy: 'Note de',
	noteAt: 'Le',
} as const;

// ============================================================================
// LOADING STATES
// ============================================================================

export const COLLABORATION_DETAIL_LOADING = {
	page: 'Chargement de la collaboration...',
	contract: 'Chargement du contrat...',
	timeline: "Chargement de l'historique...",
	progress: 'Chargement de la progression...',
	participants: 'Chargement des participants...',
	action: 'Traitement en cours...',
} as const;

// ============================================================================
// ERROR STATES
// ============================================================================

export const COLLABORATION_DETAIL_ERRORS = {
	notFound: 'Collaboration introuvable',
	loadError: 'Erreur lors du chargement de la collaboration',
	unauthorized: "Vous n'êtes pas autorisé à voir cette collaboration",
	actionError: "Erreur lors de l'exécution de l'action",
	contractError: 'Erreur lors du chargement du contrat',
} as const;
