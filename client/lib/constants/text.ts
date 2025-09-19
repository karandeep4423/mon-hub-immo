/**
 * UI Text Constants
 * Centralized location for all hardcoded text in the application
 * This improves maintainability and prepares for future internationalization
 */

// ============================================================================
// NAVIGATION & HEADER
// ============================================================================

export const NAV_TEXT = {
	forSale: 'En vente',
	favorites: 'Favoris',
	dashboard: 'Tableau de bord',
	logout: 'Déconnexion',
} as const;

// ============================================================================
// DASHBOARD - AGENT
// ============================================================================

export const DASHBOARD_AGENT = {
	activeProperties: 'Annonces actives',
	totalViews: 'Vues totales',
	messages: 'Messages',
	manageProperties: 'Gérer mes annonces',
	overview: "Vue d'ensemble",
	myProperties: 'Mes annonces',
} as const;

// ============================================================================
// PROPERTY MANAGEMENT
// ============================================================================

export const PROPERTY_TEXT = {
	title: 'Mes annonces immobilières',
	subtitle: 'Gérez et publiez vos biens',
	newProperty: 'Nouvelle annonce',
	noProperties: 'Aucune annonce pour le moment',
	noPropertiesSubtitle:
		'Créez votre première annonce pour commencer à attirer des clients potentiels.',
	loading: 'Chargement de vos biens...',

	// Property actions
	edit: 'Modifier',
	delete: 'Supprimer',

	// Property status
	available: 'Disponible',
	sold: 'Vendu',
	rented: 'Loué',
	archived: 'Archivé',

	// Property features
	new: 'Nouveau',
	exclusive: 'Exclusivité',
} as const;

// ============================================================================
// FORMS & INPUTS
// ============================================================================

export const FORM_TEXT = {
	save: 'Enregistrer',
	cancel: 'Annuler',
	submit: 'Valider',
	loading: 'Chargement...',
	saving: 'Enregistrement...',
} as const;

// ============================================================================
// NOTIFICATIONS & MESSAGES
// ============================================================================

export const NOTIFICATIONS = {
	success: {
		propertySaved: 'Annonce enregistrée avec succès',
		propertyDeleted: 'Annonce supprimée avec succès',
		messageSent: 'Message envoyé',
	},
	error: {
		propertyError: 'Erreur lors de la sauvegarde',
		deleteError: 'Erreur lors de la suppression',
		loadingError: 'Erreur lors du chargement',
		networkError: 'Erreur de connexion',
	},
	loading: {
		loadingProperties: 'Chargement des biens...',
		savingProperty: 'Enregistrement en cours...',
		deletingProperty: 'Suppression en cours...',
	},
} as const;

// ============================================================================
// CHAT & MESSAGING
// ============================================================================

export const CHAT_TEXT = {
	// General
	title: 'Discussions',
	noConversation: 'Sélectionnez une conversation',
	noMessages: 'Aucun message',
	noMessagesYet: 'Pas encore de messages',
	typingIndicator: 'est en train de taper...',
	loadingMessages: 'Chargement des messages...',
	loadingOlderMessages: 'Chargement des anciens messages...',
	loadingUsers: 'Chargement des utilisateurs...',

	// Message input
	sendMessage: 'Envoyer un message...',
	typeMessage: 'Tapez un message...',
	selectUserToChat: 'Sélectionnez un utilisateur pour commencer à discuter',
	sendingMessage: 'Envoi du message...',
	send: 'Envoyer',

	// User presence
	online: 'en ligne',
	offline: 'hors ligne',
	lastSeen: 'Vu il y a',
	justNow: "à l'instant",

	// Search
	searchUsers: 'Rechercher des utilisateurs...',
	noUsersFound: 'Aucun utilisateur trouvé',

	// Message status
	delivered: 'Livré',
	read: 'Lu',
	sending: 'Envoi...',
	failed: 'Échec',

	// Aria labels
	messageInput: 'Saisie de message',
	sendMessageButton: "Bouton d'envoi de message",
	messageAttachment: 'Pièce jointe du message',
	userAvatar: "Avatar de l'utilisateur",
} as const;

// ============================================================================
// COLLABORATION
// ============================================================================

export const COLLABORATION_TEXT = {
	title: 'Collaboration',
	lastUpdate: 'Dernière mise à jour',
	currentStep: 'Étape actuelle',
	contractContent: 'Contenu du contrat',
	additionalTerms: 'Conditions supplémentaires',
	signature: 'Signature',
	noContentDefined: 'Aucun contenu défini',
	signContract: 'Signer le contrat',
	editContract: 'Modifier le contrat',
	enterContractContent: 'Saisissez le contenu du contrat...',
} as const;

// ============================================================================
// LANDING PAGE
// ============================================================================

export const LANDING_TEXT = {
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
// DASHBOARD
// ============================================================================

export const DASHBOARD_TEXT = {
	// Common
	overview: "Vue d'ensemble",
	myProperties: 'Mes annonces',
	myCollaborations: 'Mes collaborations',
	logout: 'Déconnexion',

	// Agent dashboard
	agentDashboard: 'Dashboard Agent',
	welcomeAgent: 'Voici votre tableau de bord HubImmo.',

	// Apporteur dashboard
	apporteurDashboard: 'Dashboard Apporteur',
	successTips: 'Conseils pour réussir',
	updatePropertiesRegularly: 'Mettez à jour vos annonces régulièrement',
} as const;

// ============================================================================
// AUTH
// ============================================================================

export const AUTH_TEXT = {
	// Common auth
	collaborativeNetwork: 'Le 1er réseau social immobilier collaboratif',
	brandName: 'monhubimmo',

	// Login
	chooseAccess: 'Choisissez votre accès:',
	agentTitle: 'Agent Immobilier',
	providerTitle: "Apporteur d'affaires",
	partnerAccess: 'Accès Partenaire',
	emailPlaceholder: 'E-mail',
	passwordPlaceholder: 'Mot de passe',
	forgotPassword: 'Mot de passe oublié ?',
	loginButton: 'Connexion',
	orChooseAnother: "Ou choisir un autre type d'accès:",
	noAccount: 'Pas encore inscrit ?',
	signUpHere: 'Créer un compte',

	// Sign up
	signUpTitle: 'Inscription',
	firstName: 'Prénom',
	lastName: 'Nom',
	email: 'Email',
	phone: 'Téléphone',
	password: 'Mot de passe',
	confirmPassword: 'Confirmer le mot de passe',
	userType: "Type d'utilisateur",
	agentType: "Type d'agent",
	tCard: 'Carte T',
	sirenNumber: 'Numéro SIREN',
	rsacNumber: 'Numéro RSAC',
	collaboratorCertificate: 'Certificat de collaborateur',
	signUpButton: "S'inscrire",
	alreadyHaveAccount: 'Déjà un compte ?',
	loginHere: 'Connectez-vous ici',

	// Email verification
	verifyEmail: 'Vérifier votre email',
	enterVerificationCode:
		'Entrez le code de vérification envoyé à votre email',
	verificationCode: 'Code de vérification',
	verifyButton: 'Vérifier',
	resendCode: 'Renvoyer le code',

	// Password reset
	resetPassword: 'Réinitialiser le mot de passe',
	enterEmailForReset:
		'Entrez votre email pour réinitialiser votre mot de passe',
	sendResetLink: 'Envoyer le lien de réinitialisation',
	newPassword: 'Nouveau mot de passe',
	confirmNewPassword: 'Confirmer le nouveau mot de passe',
	resetPasswordButton: 'Réinitialiser le mot de passe',

	// Profile completion
	completeProfile: 'Compléter votre profil',
	professionalInfo: 'Informations professionnelles',
	postalCode: 'Code postal',
	city: 'Ville',
	interventionRadius: "Rayon d'intervention (km)",
	coveredCities: 'Villes couvertes',
	personalPitch: 'Présentation personnelle',
	mandateTypes: {
		simple: 'Simple',
		exclusive: 'Exclusif',
		coMandate: 'Co-mandat',
	},
	yearsExperience: "Années d'expérience",
	collaborateWithAgents: "Collaborer avec d'autres agents",
	shareCommission: 'Partager les commissions',
	independentAgent: 'Agent indépendant',
	alertsEnabled: 'Activer les alertes',
	alertFrequency: 'Fréquence des alertes',
	daily: 'Quotidien',
	weekly: 'Hebdomadaire',
	dailyAlerts: 'Alertes : nouveaux biens, clients apports',
	certifyIndependentAgent:
		'Je certifie être un agent immobilier indépendant ou mandataire non sédentaire',
	saveProfile: 'Enregistrer le profil',

	// Welcome
	welcome: 'Bienvenue',
	welcomeMessage: 'Votre compte a été créé avec succès !',
	getStarted: 'Commencer',

	// Error messages
	somethingWentWrong: 'Une erreur est survenue',
	invalidCredentials: 'Identifiants invalides',
	emailRequired: 'Email requis',
	passwordRequired: 'Mot de passe requis',

	// Success messages
	signupSuccess: 'Inscription réussie ! Vérifiez votre email.',
	verificationSent: 'Code de vérification envoyé !',
	passwordResetSent: 'Lien de réinitialisation envoyé !',
	profileSaved: 'Profil sauvegardé avec succès !',
} as const;

// ============================================================================
// COUNTS & PLURALIZATION
// ============================================================================

export const getPropertyCountText = (count: number): string => {
	return `${count} annonce${count !== 1 ? 's' : ''}`;
};

export const getMessageCountText = (count: number): string => {
	return `${count} message${count !== 1 ? 's' : ''}`;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type NavTextKeys = keyof typeof NAV_TEXT;
export type PropertyTextKeys = keyof typeof PROPERTY_TEXT;
export type FormTextKeys = keyof typeof FORM_TEXT;
export type CollaborationTextKeys = keyof typeof COLLABORATION_TEXT;
export type LandingTextKeys = keyof typeof LANDING_TEXT;
export type DashboardTextKeys = keyof typeof DASHBOARD_TEXT;
export type AuthTextKeys = keyof typeof AUTH_TEXT;
