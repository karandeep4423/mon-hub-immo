/**
 * Search Ads Detail Page Constants
 * Individual search ad page at "/search-ads/[id]"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const SEARCH_ADS_DETAIL_PAGE = {
	title: 'Détails de la recherche',
	description: 'Découvrez les détails de cette recherche immobilière',
	path: '/search-ads/[id]',
} as const;

// ============================================================================
// HEADER
// ============================================================================

export const SEARCH_ADS_DETAIL_HEADER = {
	backButton: 'Retour aux recherches',
	reference: 'Référence',
	postedBy: 'Publié par',
	postedOn: 'Publié le',
	updatedOn: 'Mis à jour le',
	status: 'Statut',
	views: 'vues',
	proposals: 'propositions',
} as const;

// ============================================================================
// SECTIONS
// ============================================================================

export const SEARCH_ADS_DETAIL_SECTIONS = {
	overview: "Vue d'ensemble",
	criteria: 'Critères de recherche',
	location: 'Localisation',
	budget: 'Budget',
	description: 'Description',
	contact: 'Contact',
	proposals: 'Propositions',
	similar: 'Recherches similaires',
} as const;

// ============================================================================
// ACTION BUTTONS
// ============================================================================

export const SEARCH_ADS_DETAIL_ACTIONS = {
	propose: {
		label: 'Proposer un bien',
		icon: 'home-plus',
		variant: 'primary',
	},
	contact: {
		label: 'Contacter',
		icon: 'message',
		variant: 'secondary',
	},
	share: {
		label: 'Partager',
		icon: 'share',
		variant: 'ghost',
		copyLink: 'Copier le lien',
		linkCopied: 'Lien copié !',
	},
	edit: {
		label: 'Modifier',
		icon: 'edit',
		variant: 'secondary',
	},
	delete: {
		label: 'Supprimer',
		icon: 'trash',
		variant: 'danger',
	},
	pause: {
		label: 'Mettre en pause',
		icon: 'pause',
		variant: 'secondary',
	},
	resume: {
		label: 'Réactiver',
		icon: 'play',
		variant: 'success',
	},
	archive: {
		label: 'Archiver',
		icon: 'archive',
		variant: 'ghost',
	},
} as const;

// ============================================================================
// OVERVIEW
// ============================================================================

export const SEARCH_ADS_DETAIL_OVERVIEW = {
	propertyType: 'Type de bien',
	transactionType: 'Transaction',
	location: 'Localisation',
	radius: 'Rayon de recherche',
	budget: 'Budget',
	surface: 'Surface',
	rooms: 'Pièces',
	bedrooms: 'Chambres',
	priority: 'Priorité',
	status: 'Statut',
	financing: 'Financement',
} as const;

// ============================================================================
// CRITERIA
// ============================================================================

export const SEARCH_ADS_DETAIL_CRITERIA = {
	title: 'Critères de recherche',
	mustHaves: 'Indispensables',
	niceToHaves: 'Souhaités',
	dealBreakers: 'Rédhibitoires',
	noMustHaves: 'Aucun critère indispensable spécifié',
	noNiceToHaves: 'Aucun critère souhaité spécifié',
	noDealBreakers: 'Aucun critère rédhibitoire spécifié',
} as const;

// ============================================================================
// LOCATION
// ============================================================================

export const SEARCH_ADS_DETAIL_LOCATION = {
	title: 'Zone de recherche',
	city: 'Ville',
	postalCode: 'Code postal',
	radius: 'Rayon',
	viewOnMap: 'Voir sur la carte',
	hideMap: 'Masquer la carte',
	km: 'km',
} as const;

// ============================================================================
// BUDGET
// ============================================================================

export const SEARCH_ADS_DETAIL_BUDGET = {
	title: 'Budget',
	min: 'Minimum',
	max: 'Maximum',
	financing: 'Type de financement',
	cash: 'Comptant',
	loan: 'Crédit',
	mixed: 'Mixte',
} as const;

// ============================================================================
// DESCRIPTION
// ============================================================================

export const SEARCH_ADS_DETAIL_DESCRIPTION = {
	title: 'Description',
	readMore: 'Lire plus',
	readLess: 'Lire moins',
	noDescription: 'Aucune description fournie',
} as const;

// ============================================================================
// CONTACT
// ============================================================================

export const SEARCH_ADS_DETAIL_CONTACT = {
	title: 'Informations de contact',
	name: 'Nom',
	email: 'Email',
	phone: 'Téléphone',
	preference: 'Préférence de contact',
	availability: 'Disponibilité',
	notSpecified: 'Non spécifié',
	contactButton: 'Contacter le demandeur',
	proposeButton: 'Proposer un bien',
} as const;

// ============================================================================
// PROPOSE MODAL
// ============================================================================

export const SEARCH_ADS_DETAIL_PROPOSE = {
	title: 'Proposer un bien',
	subtitle:
		'Sélectionnez un bien de votre portfolio qui correspond à cette recherche',
	selectProperty: 'Sélectionner un bien',
	noProperties: "Vous n'avez pas encore de biens",
	createProperty: 'Créer un bien',
	message: 'Message personnalisé',
	messagePlaceholder:
		'Expliquez pourquoi ce bien correspond à la recherche...',
	sendProposal: 'Envoyer la proposition',
	cancel: 'Annuler',
	sending: 'Envoi en cours...',
} as const;

// ============================================================================
// PROPOSALS
// ============================================================================

export const SEARCH_ADS_DETAIL_PROPOSALS = {
	title: 'Propositions reçues',
	count: (count: number) =>
		`${count} proposition${count !== 1 ? 's' : ''} reçue${count !== 1 ? 's' : ''}`,
	noProposals: 'Aucune proposition pour le moment',
	viewAll: 'Voir toutes les propositions',
	viewProperty: 'Voir le bien',
	contact: "Contacter l'agent",
	accept: 'Accepter',
	reject: 'Refuser',
	pending: 'En attente',
	accepted: 'Acceptée',
	rejected: 'Refusée',
	proposedBy: 'Proposé par',
	proposedOn: 'Proposé le',
} as const;

// ============================================================================
// SIMILAR SEARCHES
// ============================================================================

export const SEARCH_ADS_DETAIL_SIMILAR = {
	title: 'Recherches similaires',
	noSimilar: 'Aucune recherche similaire trouvée',
	viewAll: 'Voir toutes les recherches',
} as const;

// ============================================================================
// CONFIRM DIALOGS
// ============================================================================

export const SEARCH_ADS_DETAIL_CONFIRM = {
	delete: {
		title: 'Supprimer la recherche',
		message:
			'Êtes-vous sûr de vouloir supprimer cette recherche ? Cette action est irréversible.',
		confirmButton: 'Supprimer',
		cancelButton: 'Annuler',
	},
	pause: {
		title: 'Mettre en pause',
		message:
			'Êtes-vous sûr de vouloir mettre cette recherche en pause ? Elle ne sera plus visible par les agents.',
		confirmButton: 'Mettre en pause',
		cancelButton: 'Annuler',
	},
	archive: {
		title: 'Archiver la recherche',
		message:
			'Êtes-vous sûr de vouloir archiver cette recherche ? Vous pourrez toujours la consulter mais elle ne sera plus active.',
		confirmButton: 'Archiver',
		cancelButton: 'Annuler',
	},
} as const;

// ============================================================================
// LOADING STATES
// ============================================================================

export const SEARCH_ADS_DETAIL_LOADING = {
	page: 'Chargement de la recherche...',
	proposals: 'Chargement des propositions...',
	similar: 'Chargement des recherches similaires...',
	action: 'Traitement en cours...',
} as const;

// ============================================================================
// ERROR STATES
// ============================================================================

export const SEARCH_ADS_DETAIL_ERRORS = {
	notFound: 'Recherche introuvable',
	loadError: 'Erreur lors du chargement de la recherche',
	unauthorized: "Vous n'êtes pas autorisé à voir cette recherche",
	actionError: "Erreur lors de l'exécution de l'action",
	proposeError: 'Erreur lors de la proposition',
	contactError: "Erreur lors de l'envoi du message",
} as const;

// ============================================================================
// BADGES
// ============================================================================

export const SEARCH_ADS_DETAIL_BADGES = {
	urgent: 'Urgent',
	high: 'Priorité haute',
	medium: 'Priorité moyenne',
	low: 'Priorité basse',
	active: 'Actif',
	paused: 'En pause',
	fulfilled: 'Satisfait',
	archived: 'Archivé',
	new: 'Nouveau',
} as const;
