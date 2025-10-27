/**
 * Home Page (Landing) Constants
 * Main landing page at root path "/"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const HOME_PAGE = {
	title: 'MonHubImmo - Plateforme Immobilière Collaborative',
	description:
		"Le 1er réseau collaboratif entre tous professionnels de l'immobilier",
	path: '/',
} as const;

// ============================================================================
// HERO SECTION
// ============================================================================

export const HOME_HERO = {
	intro: 'Ici, peu importe votre réseau:',
	introMain: "ce qui compte : c'est de conclure plus de ventes, ensemble.",
	mainTitle: 'Découvrez',
	brandName: 'monhubimmo',
	ctaText: 'Commencer maintenant',
	ctaLink: '/auth/signup',
} as const;

// ============================================================================
// FEATURES SECTION
// ============================================================================

export const HOME_FEATURES = {
	networkTitle:
		"Le 1er réseau collaboratif entre tous professionnels de l'immobilier.",
	sharingTitle: 'Partagez biens et clients de toutes enseignes confondues.',
	sectionTitle: 'Pourquoi rejoindre MonHubimmo ?',
} as const;

export const HOME_FEATURE_CARDS = [
	{
		key: 'shareProperties',
		title: 'Partage de biens',
		description:
			"Partagez votre stock (mandats simples, exclusifs ou off market) avec d'autres mandataires.",
		icon: 'share',
	},
	{
		key: 'realTimeVisibility',
		title: 'Visibilité en temps réel',
		description:
			"Visualisez les biens disponibles sur votre secteur et ceux de vos confrères en un coup d'œil.",
		icon: 'eye',
	},
	{
		key: 'findForClients',
		title: 'Trouvez pour vos clients',
		description:
			'Accédez aux biens des autres mandataires pour satisfaire les besoins de vos clients.',
		icon: 'search',
	},
	{
		key: 'targetedSearches',
		title: 'Recherches clients ciblées',
		description:
			'Déposez des recherches et recevez des propositions adaptées automatiquement.',
		icon: 'target',
	},
	{
		key: 'multiNetworkCollab',
		title: 'Collaboration multi-réseaux',
		description:
			"Collaborez facilement avec d'autres mandataires, quelle que soit leur enseigne.",
		icon: 'network',
	},
	{
		key: 'privateMessaging',
		title: 'Messagerie privée',
		description:
			"Consultez l'historique de vos échanges et discutez en toute confidentialité.",
		icon: 'message',
	},
	{
		key: 'intuitiveBoard',
		title: 'Tableau de bord intuitif',
		description:
			'Gérez vos fiches clients, mandats et recherches simplement depuis un espace unique.',
		icon: 'dashboard',
	},
] as const;

// ============================================================================
// PROFESSIONAL SECTION
// ============================================================================

export const HOME_PROFESSIONAL = {
	title: 'Vous êtes mandataire immobiliers, agent immobilier ou négociateurs vrp chez IAD, MAISON ROUGE, SAFTI, GUY HOCQUET, BSK, NAOS, LAFORET, EFFICITY ou un autre réseau ?',
	subtitle:
		'Vous travaillez dur pour vos clients, mais vous êtes souvent seul face à vos annonces, vos recherches acquéreurs ou vos exclusivités à diffuser…',
	description:
		"MonHubImmo est le 1er réseau de collaboration 100% entre professionnels de l'immobilier, toutes enseignes confondues.",
} as const;

// ============================================================================
// LAUNCH OFFER SECTION
// ============================================================================

export const HOME_LAUNCH_OFFER = {
	title: 'Offre de lancement! Inscrivez-vous maintenant!',
	subtitle: 'Profitez de 3 mois offerts pour les 100 premiers inscrits',
	description: "Rejoignez la 1ère plateforme collaborative de l'immobilier",
	ctaText: "S'inscrire maintenant",
} as const;

// ============================================================================
// CONTACT FORM
// ============================================================================

export const HOME_CONTACT_FORM = {
	title: 'Entrez vos informations :',
	placeholders: {
		name: 'Nom',
		email: 'Adresse e-mail',
		phone: 'Numéro de téléphone',
	},
	submitButton: 'Envoyer',
	submitting: 'Envoi...',
} as const;

// ============================================================================
// NAVIGATION BUTTONS
// ============================================================================

export const HOME_NAV_BUTTONS = {
	signUpNow: 'Inscrivez-vous maintenant',
	registerAsAgent: "S'inscrire en tant qu'agent",
	registerAsProvider: "S'inscrire en tant qu'apporteur",
	discoverMonHubImmo: 'Découvrir MonHubImmo',
} as const;

// ============================================================================
// SECTIONS
// ============================================================================

export const HOME_SECTIONS = {
	hero: 'hero',
	features: 'features',
	professional: 'professional',
	launchOffer: 'launch-offer',
	contact: 'contact',
	footer: 'footer',
} as const;

export type HomeSection = (typeof HOME_SECTIONS)[keyof typeof HOME_SECTIONS];
