/**
 * Search Ads Create Page Constants
 * Create search ad page at "/search-ads/create"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const SEARCH_ADS_CREATE_PAGE = {
	title: 'Créer une annonce de recherche',
	description: 'Publiez votre recherche pour trouver le bien idéal',
	path: '/search-ads/create',
} as const;

// ============================================================================
// HEADER
// ============================================================================

export const SEARCH_ADS_CREATE_HEADER = {
	title: 'Nouvelle recherche',
	subtitle: 'Décrivez le bien que vous recherchez pour vos clients',
	backButton: 'Retour aux recherches',
} as const;

// ============================================================================
// FORM STEPS
// ============================================================================

export const SEARCH_ADS_CREATE_STEPS = {
	basics: {
		key: 'basics',
		label: 'Informations de base',
		title: 'Informations générales',
		description: 'Type de bien et localisation recherchés',
	},
	criteria: {
		key: 'criteria',
		label: 'Critères de recherche',
		title: 'Critères détaillés',
		description: 'Surface, pièces et caractéristiques souhaitées',
	},
	budget: {
		key: 'budget',
		label: 'Budget',
		title: 'Budget et conditions',
		description: 'Budget disponible et modalités de financement',
	},
	contact: {
		key: 'contact',
		label: 'Contact',
		title: 'Informations de contact',
		description: 'Comment les agents peuvent vous contacter',
	},
	review: {
		key: 'review',
		label: 'Vérification',
		title: 'Vérifiez votre recherche',
		description: 'Relisez et confirmez les informations',
	},
} as const;

export type SearchAdCreateStep = keyof typeof SEARCH_ADS_CREATE_STEPS;

// ============================================================================
// FORM SECTIONS
// ============================================================================

export const SEARCH_ADS_CREATE_FORM = {
	// Basic info
	propertyType: {
		label: 'Type de bien recherché',
		placeholder: 'Sélectionnez un type',
		required: true,
	},
	transactionType: {
		label: 'Type de transaction',
		placeholder: 'Vente ou location',
		required: true,
		options: {
			sale: 'Vente',
			rent: 'Location',
		},
	},
	location: {
		label: 'Localisation',
		placeholder: 'Ville ou code postal',
		required: true,
	},
	radius: {
		label: 'Rayon de recherche',
		placeholder: 'Rayon en km',
		unit: 'km',
		min: 5,
		max: 100,
		default: 25,
	},

	// Criteria
	surface: {
		label: 'Surface',
		min: 'Surface minimale',
		max: 'Surface maximale',
		unit: 'm²',
		placeholder: 'Surface en m²',
	},
	rooms: {
		label: 'Nombre de pièces',
		min: 'Minimum',
		placeholder: 'Nombre de pièces',
	},
	bedrooms: {
		label: 'Nombre de chambres',
		min: 'Minimum',
		placeholder: 'Nombre de chambres',
	},
	bathrooms: {
		label: 'Salles de bain',
		min: 'Minimum',
		placeholder: 'Nombre de salles de bain',
	},

	// Budget
	budget: {
		label: 'Budget',
		min: 'Budget minimum',
		max: 'Budget maximum',
		placeholder: 'Montant en €',
		required: true,
	},
	financing: {
		label: 'Type de financement',
		options: {
			cash: 'Comptant',
			loan: 'Crédit',
			mixed: 'Mixte',
		},
	},

	// Description
	description: {
		label: 'Description de la recherche',
		placeholder:
			'Décrivez en détail le bien recherché, les critères importants, etc.',
		maxLength: 2000,
	},
	mustHaves: {
		label: 'Critères indispensables',
		placeholder: 'Ex: parking, jardin, terrasse...',
	},
	niceToHaves: {
		label: 'Critères souhaités',
		placeholder: 'Ex: cheminée, cave, balcon...',
	},
	dealBreakers: {
		label: 'Critères rédhibitoires',
		placeholder: 'Ex: rez-de-chaussée, travaux importants...',
	},

	// Priority
	priority: {
		label: 'Priorité de la recherche',
		options: {
			urgent: 'Urgent - Recherche immédiate',
			high: 'Haute - Dans le mois',
			medium: 'Moyenne - Dans les 3 mois',
			low: 'Basse - Pas de délai',
		},
	},

	// Contact
	contactPreference: {
		label: 'Préférence de contact',
		options: {
			email: 'Email',
			phone: 'Téléphone',
			both: 'Email et téléphone',
		},
	},
	availability: {
		label: 'Disponibilité pour visites',
		placeholder: 'Ex: Lundi-Vendredi après 18h, Samedi toute la journée',
	},
} as const;

// ============================================================================
// BUTTONS
// ============================================================================

export const SEARCH_ADS_CREATE_BUTTONS = {
	previous: 'Précédent',
	next: 'Suivant',
	save: 'Enregistrer',
	saveDraft: 'Enregistrer comme brouillon',
	publish: 'Publier',
	cancel: 'Annuler',
	reset: 'Réinitialiser',
} as const;

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const SEARCH_ADS_CREATE_VALIDATION = {
	required: 'Ce champ est obligatoire',
	minLength: (min: number) => `Minimum ${min} caractères`,
	maxLength: (max: number) => `Maximum ${max} caractères`,
	minValue: (min: number) => `Valeur minimale: ${min}`,
	maxValue: (max: number) => `Valeur maximale: ${max}`,
	invalidEmail: 'Email invalide',
	invalidPhone: 'Numéro de téléphone invalide',
	invalidPostalCode: 'Code postal invalide',
	budgetRange: 'Le budget minimum doit être inférieur au budget maximum',
	surfaceRange:
		'La surface minimale doit être inférieure à la surface maximale',
} as const;

// ============================================================================
// REVIEW SECTION
// ============================================================================

export const SEARCH_ADS_CREATE_REVIEW = {
	title: 'Récapitulatif de votre recherche',
	subtitle: 'Vérifiez les informations avant de publier',
	sections: {
		basics: 'Informations de base',
		criteria: 'Critères',
		budget: 'Budget',
		contact: 'Contact',
		description: 'Description',
	},
	edit: 'Modifier',
	confirm: 'Confirmer et publier',
	agreementText:
		"En publiant cette recherche, vous acceptez d'être contacté par des agents immobiliers",
} as const;

// ============================================================================
// SUCCESS
// ============================================================================

export const SEARCH_ADS_CREATE_SUCCESS = {
	title: 'Recherche publiée avec succès !',
	message:
		'Votre recherche est maintenant visible par les agents. Vous recevrez des propositions par email.',
	viewSearchAd: 'Voir ma recherche',
	createAnother: 'Créer une autre recherche',
	goToDashboard: 'Aller au tableau de bord',
} as const;

// ============================================================================
// TIPS
// ============================================================================

export const SEARCH_ADS_CREATE_TIPS = {
	title: 'Conseils pour une recherche efficace',
	tips: [
		'Soyez précis dans vos critères pour recevoir des propositions pertinentes',
		'Indiquez votre budget réel pour éviter les propositions inadaptées',
		'Mentionnez vos critères indispensables et rédhibitoires',
		'Mettez à jour votre recherche si vos critères évoluent',
		'Répondez rapidement aux propositions des agents',
	],
} as const;

// ============================================================================
// HELP TEXT
// ============================================================================

export const SEARCH_ADS_CREATE_HELP = {
	propertyType: 'Sélectionnez le type de bien que vous recherchez',
	location: 'Indiquez la ville ou le code postal où vous recherchez un bien',
	radius: 'Définissez le périmètre de recherche autour de la localisation',
	budget: 'Indiquez votre budget réel pour recevoir des propositions adaptées',
	mustHaves:
		'Listez les équipements ou caractéristiques absolument nécessaires',
	dealBreakers: 'Indiquez ce qui vous ferait refuser un bien immédiatement',
	priority:
		"Indiquez l'urgence de votre recherche pour aider les agents à prioriser",
} as const;
