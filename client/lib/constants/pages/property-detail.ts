/**
 * Property Detail Page Constants
 * Individual property page at "/property/[id]"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const PROPERTY_DETAIL_PAGE = {
	title: 'Détails du bien',
	description: 'Découvrez les caractéristiques détaillées de ce bien',
	path: '/property/[id]',
} as const;

// ============================================================================
// SECTIONS
// ============================================================================

export const PROPERTY_DETAIL_SECTIONS = {
	gallery: 'Galerie photos',
	details: 'Caractéristiques',
	description: 'Description',
	location: 'Localisation',
	features: 'Équipements',
	energy: 'Performance énergétique',
	agent: 'Agent',
	contact: 'Contact',
	similar: 'Biens similaires',
} as const;

// ============================================================================
// GALLERY
// ============================================================================

export const PROPERTY_DETAIL_GALLERY = {
	mainImage: 'Photo principale',
	thumbnails: 'Miniatures',
	previousImage: 'Photo précédente',
	nextImage: 'Photo suivante',
	viewFullscreen: 'Voir en plein écran',
	closeFullscreen: 'Fermer le plein écran',
	imageCount: (current: number, total: number) =>
		`Photo ${current} sur ${total}`,
	noImages: 'Aucune photo disponible',
} as const;

// ============================================================================
// DETAILS
// ============================================================================

export const PROPERTY_DETAIL_INFO = {
	price: 'Prix',
	type: 'Type de bien',
	surface: 'Surface',
	rooms: 'Pièces',
	bedrooms: 'Chambres',
	bathrooms: 'Salles de bain',
	floor: 'Étage',
	totalFloors: "Nombre d'étages",
	constructionYear: 'Année de construction',
	condition: 'État',
	heating: 'Chauffage',
	parking: 'Parking',
	garden: 'Jardin',
	balcony: 'Balcon',
	terrace: 'Terrasse',
	elevator: 'Ascenseur',
	basement: 'Cave',
	furnished: 'Meublé',
	availability: 'Disponibilité',
	reference: 'Référence',
} as const;

// ============================================================================
// DESCRIPTION
// ============================================================================

export const PROPERTY_DETAIL_DESCRIPTION = {
	title: 'Description',
	readMore: 'Lire plus',
	readLess: 'Lire moins',
	noDescription: 'Aucune description disponible',
} as const;

// ============================================================================
// LOCATION
// ============================================================================

export const PROPERTY_DETAIL_LOCATION = {
	title: 'Localisation',
	address: 'Adresse',
	city: 'Ville',
	postalCode: 'Code postal',
	department: 'Département',
	region: 'Région',
	viewOnMap: 'Voir sur la carte',
	hideMap: 'Masquer la carte',
	nearby: 'À proximité',
	transport: 'Transports',
	schools: 'Écoles',
	shops: 'Commerces',
	addressPrivate: 'Adresse exacte visible après contact',
} as const;

// ============================================================================
// FEATURES & AMENITIES
// ============================================================================

export const PROPERTY_DETAIL_FEATURES = {
	title: 'Équipements',
	interior: 'Intérieur',
	exterior: 'Extérieur',
	security: 'Sécurité',
	comfort: 'Confort',
	noFeatures: 'Aucun équipement spécifié',
} as const;

// ============================================================================
// ENERGY PERFORMANCE
// ============================================================================

export const PROPERTY_DETAIL_ENERGY = {
	title: 'Performance énergétique',
	dpe: 'DPE (Diagnostic de Performance Énergétique)',
	ges: 'GES (Gaz à Effet de Serre)',
	consumption: 'Consommation énergétique',
	emissions: 'Émissions de GES',
	notAvailable: 'Non disponible',
	rating: 'Classe',
	value: 'Valeur',
} as const;

// ============================================================================
// AGENT INFO
// ============================================================================

export const PROPERTY_DETAIL_AGENT = {
	title: 'Votre agent',
	name: 'Nom',
	agency: 'Agence',
	phone: 'Téléphone',
	email: 'Email',
	experience: 'Expérience',
	properties: 'Annonces actives',
	viewProfile: 'Voir le profil',
	contact: 'Contacter',
} as const;

// ============================================================================
// CONTACT FORM
// ============================================================================

export const PROPERTY_DETAIL_CONTACT = {
	title: "Contacter l'agent",
	subtitle: "Obtenir plus d'informations sur ce bien",
	name: 'Votre nom',
	email: 'Votre email',
	phone: 'Votre téléphone',
	message: 'Votre message',
	messagePlaceholder: 'Je suis intéressé par ce bien...',
	sendButton: 'Envoyer',
	sending: 'Envoi...',
	scheduleVisit: 'Programmer une visite',
	requestInfo: 'Demander des informations',
	makeOffer: 'Faire une offre',
} as const;

// ============================================================================
// ACTION BUTTONS
// ============================================================================

export const PROPERTY_DETAIL_ACTIONS = {
	favorite: {
		add: 'Ajouter aux favoris',
		remove: 'Retirer des favoris',
		icon: 'heart',
	},
	share: {
		label: 'Partager',
		icon: 'share',
		copyLink: 'Copier le lien',
		linkCopied: 'Lien copié !',
	},
	print: {
		label: 'Imprimer',
		icon: 'printer',
	},
	report: {
		label: 'Signaler',
		icon: 'flag',
	},
	contact: {
		label: 'Contacter',
		icon: 'message',
	},
	visit: {
		label: 'Visiter',
		icon: 'calendar',
	},
	collaborate: {
		label: 'Collaborer',
		icon: 'users',
	},
} as const;

// ============================================================================
// SIMILAR PROPERTIES
// ============================================================================

export const PROPERTY_DETAIL_SIMILAR = {
	title: 'Biens similaires',
	noSimilar: 'Aucun bien similaire trouvé',
	viewAll: 'Voir tous les biens',
	loadingMore: 'Chargement de plus de biens...',
} as const;

// ============================================================================
// BADGES
// ============================================================================

export const PROPERTY_DETAIL_BADGES = {
	exclusive: 'Exclusivité',
	new: 'Nouveau',
	urgent: 'Urgent',
	negotiable: 'Négociable',
	reduced: 'Prix réduit',
	premium: 'Premium',
	featured: 'En vedette',
} as const;

// ============================================================================
// LOADING STATES
// ============================================================================

export const PROPERTY_DETAIL_LOADING = {
	page: 'Chargement du bien...',
	images: 'Chargement des photos...',
	agent: 'Chargement des informations agent...',
	similar: 'Chargement des biens similaires...',
} as const;

// ============================================================================
// ERROR STATES
// ============================================================================

export const PROPERTY_DETAIL_ERRORS = {
	notFound: 'Bien introuvable',
	loadError: 'Erreur lors du chargement du bien',
	unauthorized: "Vous n'êtes pas autorisé à voir ce bien",
	contactError: "Erreur lors de l'envoi du message",
	favoriteError: 'Erreur lors de la modification des favoris',
} as const;

// ============================================================================
// BACK BUTTON
// ============================================================================

export const PROPERTY_DETAIL_BACK = {
	label: 'Retour aux annonces',
	ariaLabel: 'Retourner à la liste des annonces',
} as const;
