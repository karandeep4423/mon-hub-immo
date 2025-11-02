/**
 * Landing Page Feature Constants
 * Centralized constants for the public landing page
 */

// ============================================================================
// UI TEXT
// ============================================================================

export const LANDING_UI_TEXT = {
	// Loading states
	redirecting: 'Redirection...',
	loading: 'Chargement...',

	// Hero section - new intro
	heroIntro: 'Ici, peu importe votre réseau:',
	heroIntroMain: "ce qui compte : c'est de conclure plus de ventes,ensemble.",
	heroMainTitle: 'Découvrez',
	heroBrandName: 'monhubimmo',

	// Feature highlights
	networkTitle:
		"Le 1ère réseau collaboratif entre tous professionnels de l'immobilier.",
	sharingTitle: 'Partagez biens et clients de toutes enseignes confondues.',

	// Call to action
	wantToBeInformed: 'Je veux être informé dès maintenant',

	// Benefits section
	whyJoin: 'Pourquoi rejoindre MonHubimmo ?',

	// Benefit cards
	benefitShareProperties: 'Partage de biens',
	benefitSharePropertiesDesc:
		"Partagez votre stock (mandats simples, exclusifs ou off market) avec d'autres mandataires.",

	benefitRealTimeVisibility: 'Visibilité en temps réel',
	benefitRealTimeVisibilityDesc:
		"Visualisez les biens disponibles sur votre secteur et ceux de vos confrères en un coup d'œil.",

	benefitFindForClients: 'Trouvez pour vos clients',
	benefitFindForClientsDesc:
		'Accédez aux biens des autres mandataires pour satisfaire les besoins de vos clients.',

	benefitTargetedSearches: 'Recherches clients ciblées',
	benefitTargetedSearchesDesc:
		'Déposez des recherches et recevez des propositions adaptées automatiquement.',

	benefitMultiNetworkCollab: 'Collaboration multi-réseaux',
	benefitMultiNetworkCollabDesc:
		"Collaborez facilement avec d'autres mandataires, quelle que soit leur enseigne.",

	benefitPrivateMessaging: 'Messagerie privée',
	benefitPrivateMessagingDesc:
		"Consultez l'historique de vos échanges et discutez en toute confidentialité.",

	benefitIntuitiveBoard: 'Tableau de bord intuitif',
	benefitIntuitiveBoardDesc:
		'Gérez vos fiches clients, mandats et recherches simplement depuis un espace unique.',

	// Professional section
	professionalTitle:
		'Vous êtes mandataire immobiliers, agent immobilier ou négociateurs vrp chez IAD, MAISON ROUGE, SAFTI, GUY HOCQUET, BSK, NAOS, LAFORET, EFFICITY ou un autre réseau ?',
	professionalSubtitle:
		'Vous travaillez dur pour vos clients, mais vous êtes souvent seul face à vos annonces, vos recherches acquéreurs ou vos exclusivités à diffuser…',
	professionalDescription:
		"MonHubImmo est le 1er réseau de collaboration 100% entre professionnels de l'immobilier, toutes enseignes confondues de l'immobilier.",

	// Launch offer section
	launchOfferTitle: 'Offre de lancement! Inscrivez-vous maintenant!',
	launchOfferSubtitle:
		'Profitez de 3 mois offerts pour les 100 premiers inscrits',
	launchOfferDescription:
		"Rejoignez la 1er plateforme collaborative de l'immobilier",

	// Form section
	formTitle: 'Entrez vos informations :',
	namePlaceholder: 'Nom',
	emailPlaceholder: 'Adresse e-mail',
	phonePlaceholder: 'Numéro de téléphone',
	submitButton: 'Envoyer',
	submitting: 'Envoi...',

	// Form validation
	sendError: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",

	// Contact
	contactSuccess:
		'Votre message a été envoyé avec succès. Nous vous contacterons bientôt.',
	contactError: 'Une erreur est survenue. Veuillez réessayer plus tard.',

	// Navigation buttons
	signUpNow: 'Inscrivez vous maintenant',
	registerAsAgent: "S'inscrire en tant qu'agent",
	registerAsProvider: "S'inscrire en tant qu'apporteur",

	// Footer
	usefulLinks: 'Liens utiles',
	discoverMonHubImmo: 'Découvrir MonHubImmo',
	signUpThreeMonthsFree: 'Inscription (3 mois offerts)',
	generalConditions: 'Conditions générales',
	privacyPolicy: 'Politique de confidentialité',
	followUs: 'Suivez-nous',
	allRightsReserved: '© 2025 MonHubImmo - Tous droits réservés',
	connectProfessionals: 'Connecter les pros, partager les opportunités.',
	cookiePolicy: 'Politique cookies',
	legalNotices: 'Mentions légales',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const LANDING_ROUTES = {
	HOME: '/',
	HOME_PAGE: '/home',
	ABOUT: '/about',
	CONTACT: '/contact',
	LOGIN: '/login',
	SIGNUP: '/signup',
	LEGAL: '/mentions-legales',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LandingUITextKeys = keyof typeof LANDING_UI_TEXT;
export type LandingRouteKeys = keyof typeof LANDING_ROUTES;
