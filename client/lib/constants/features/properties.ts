/**
 * Properties Feature Constants
 * All property-related constants: badges, types, priorities, statuses, routes, messages
 */

// ============================================================================
// PROPERTY BADGES
// ============================================================================

export interface BadgeConfig {
	value: string;
	label: string;
	color: string;
	bgColor: string;
}

export const PROPERTY_BADGES: BadgeConfig[] = [
	{
		value: 'OFF_MARKET',
		label: 'OFF MARKET',
		color: 'text-white',
		bgColor: 'bg-gray-800',
	},
	{
		value: 'EXCLUSIVITE',
		label: 'EXCLUSIVITÉ',
		color: 'text-white',
		bgColor: 'bg-yellow-500',
	},
	{
		value: 'NOUVEAU',
		label: 'NOUVEAU',
		color: 'text-white',
		bgColor: 'bg-green-500',
	},
	{
		value: 'URGENT',
		label: 'URGENT',
		color: 'text-white',
		bgColor: 'bg-red-600',
	},
	{
		value: 'NEGOCIABLE',
		label: 'NÉGOCIABLE',
		color: 'text-white',
		bgColor: 'bg-info',
	},
	{
		value: 'SOUS_COMPROMIS',
		label: 'SOUS COMPROMIS',
		color: 'text-white',
		bgColor: 'bg-orange-500',
	},
	{
		value: 'COUP_DE_COEUR',
		label: 'COUP DE CŒUR',
		color: 'text-white',
		bgColor: 'bg-pink-500',
	},
	{
		value: 'CENTRE_VILLE',
		label: 'CENTRE-VILLE',
		color: 'text-white',
		bgColor: 'bg-indigo-600',
	},
	{
		value: 'EN_CAMPAGNE',
		label: 'EN CAMPAGNE',
		color: 'text-white',
		bgColor: 'bg-green-600',
	},
	{
		value: 'VUE_MER',
		label: 'VUE MER',
		color: 'text-white',
		bgColor: 'bg-brand',
	},
	{
		value: 'PROCHE_ECOLE',
		label: 'PROCHE ÉCOLE',
		color: 'text-white',
		bgColor: 'bg-purple-500',
	},
	{
		value: 'INVESTISSEUR',
		label: 'INVESTISSEUR',
		color: 'text-white',
		bgColor: 'bg-emerald-600',
	},
	{
		value: 'PROGRAMME_NEUF',
		label: 'PROGRAMME NEUF',
		color: 'text-white',
		bgColor: 'bg-teal-600',
	},
	{
		value: 'BAISSE_DE_PRIX',
		label: 'BAISSE DE PRIX',
		color: 'text-white',
		bgColor: 'bg-red-500',
	},
	{
		value: 'MAISON_FAMILIALE',
		label: 'MAISON FAMILIALE',
		color: 'text-white',
		bgColor: 'bg-amber-600',
	},
	{
		value: 'SANS_VIS_A_VIS',
		label: 'SANS VIS-À-VIS',
		color: 'text-white',
		bgColor: 'bg-lime-600',
	},
	{
		value: 'JARDIN_TERRASSE',
		label: 'JARDIN / TERRASSE',
		color: 'text-white',
		bgColor: 'bg-green-700',
	},
	{
		value: 'PISCINE',
		label: 'PISCINE',
		color: 'text-white',
		bgColor: 'bg-info',
	},
	{
		value: 'STANDING_PRESTIGE',
		label: 'STANDING / PRESTIGE',
		color: 'text-white',
		bgColor: 'bg-yellow-600',
	},
	{
		value: 'CALME_QUARTIER_RECHERCHE',
		label: 'CALME / QUARTIER RECHERCHÉ',
		color: 'text-white',
		bgColor: 'bg-slate-600',
	},
	{
		value: 'PARKING_GARAGE',
		label: 'PARKING / GARAGE',
		color: 'text-white',
		bgColor: 'bg-gray-600',
	},
] as const;

/**
 * Get badge configuration by value
 */
export const getBadgeConfig = (value: string): BadgeConfig | undefined => {
	return PROPERTY_BADGES.find((badge) => badge.value === value);
};

// ============================================================================
// SEARCH AD BADGES
// ============================================================================

export const SEARCH_AD_BADGES: Record<string, BadgeConfig> = {
	'Vente urgente': {
		value: 'Vente urgente',
		label: 'VENTE URGENTE',
		color: 'text-white',
		bgColor: 'bg-red-600',
	},
	'Bien rare': {
		value: 'Bien rare',
		label: 'BIEN RARE',
		color: 'text-white',
		bgColor: 'bg-purple-600',
	},
	'Secteur recherché': {
		value: 'Secteur recherché',
		label: 'SECTEUR RECHERCHÉ',
		color: 'text-white',
		bgColor: 'bg-indigo-600',
	},
	'Bonne affaire': {
		value: 'Bonne affaire',
		label: 'BONNE AFFAIRE',
		color: 'text-white',
		bgColor: 'bg-green-600',
	},
	'Fort potentiel': {
		value: 'Fort potentiel',
		label: 'FORT POTENTIEL',
		color: 'text-white',
		bgColor: 'bg-emerald-600',
	},
	'Mandat possible rapidement': {
		value: 'Mandat possible rapidement',
		label: 'MANDAT RAPIDE',
		color: 'text-white',
		bgColor: 'bg-orange-600',
	},
	'Signature imminente': {
		value: 'Signature imminente',
		label: 'SIGNATURE IMMINENTE',
		color: 'text-white',
		bgColor: 'bg-red-500',
	},
	'Contact direct propriétaire': {
		value: 'Contact direct propriétaire',
		label: 'CONTACT DIRECT',
		color: 'text-white',
		bgColor: 'bg-info',
	},
	'Contact ami / famille': {
		value: 'Contact ami / famille',
		label: 'CONTACT AMI/FAMILLE',
		color: 'text-white',
		bgColor: 'bg-brand',
	},
	'Contact pro (collègue, artisan, notaire…)': {
		value: 'Contact pro (collègue, artisan, notaire…)',
		label: 'CONTACT PRO',
		color: 'text-white',
		bgColor: 'bg-teal-600',
	},
	'Vendeur joignable': {
		value: 'Vendeur joignable',
		label: 'VENDEUR JOIGNABLE',
		color: 'text-white',
		bgColor: 'bg-green-500',
	},
	'Maison individuelle': {
		value: 'Maison individuelle',
		label: 'MAISON',
		color: 'text-white',
		bgColor: 'bg-amber-600',
	},
	Appartement: {
		value: 'Appartement',
		label: 'APPARTEMENT',
		color: 'text-white',
		bgColor: 'bg-info',
	},
	'Terrain constructible': {
		value: 'Terrain constructible',
		label: 'TERRAIN',
		color: 'text-white',
		bgColor: 'bg-lime-600',
	},
	Commerce: {
		value: 'Commerce',
		label: 'COMMERCE',
		color: 'text-white',
		bgColor: 'bg-yellow-600',
	},
	Immeuble: {
		value: 'Immeuble',
		label: 'IMMEUBLE',
		color: 'text-white',
		bgColor: 'bg-slate-600',
	},
	Bâtiment: {
		value: 'Bâtiment',
		label: 'BÂTIMENT',
		color: 'text-white',
		bgColor: 'bg-gray-600',
	},
	Atypique: {
		value: 'Atypique',
		label: 'ATYPIQUE',
		color: 'text-white',
		bgColor: 'bg-pink-600',
	},
	'Bien à rénover': {
		value: 'Bien à rénover',
		label: 'À RÉNOVER',
		color: 'text-white',
		bgColor: 'bg-orange-500',
	},
	'Jeune couple primo-accédant': {
		value: 'Jeune couple primo-accédant',
		label: 'PRIMO-ACCÉDANT',
		color: 'text-white',
		bgColor: 'bg-rose-600',
	},
	'Famille agrandissement': {
		value: 'Famille agrandissement',
		label: 'FAMILLE',
		color: 'text-white',
		bgColor: 'bg-violet-600',
	},
	'Retraité / résidence secondaire': {
		value: 'Retraité / résidence secondaire',
		label: 'RETRAITÉ',
		color: 'text-white',
		bgColor: 'bg-fuchsia-600',
	},
	'Investisseur locatif': {
		value: 'Investisseur locatif',
		label: 'INVESTISSEUR',
		color: 'text-white',
		bgColor: 'bg-emerald-700',
	},
	'Projet rénovation / construction': {
		value: 'Projet rénovation / construction',
		label: 'RÉNOVATION',
		color: 'text-white',
		bgColor: 'bg-amber-700',
	},
	'Recherche résidence principale': {
		value: 'Recherche résidence principale',
		label: 'RÉSIDENCE PRINCIPALE',
		color: 'text-white',
		bgColor: 'bg-sky-600',
	},
	'À rappeler rapidement': {
		value: 'À rappeler rapidement',
		label: 'À RAPPELER',
		color: 'text-white',
		bgColor: 'bg-red-500',
	},
	'Disponible cette semaine': {
		value: 'Disponible cette semaine',
		label: 'DISPONIBLE',
		color: 'text-white',
		bgColor: 'bg-green-500',
	},
	'Projet à court terme (<3 mois)': {
		value: 'Projet à court terme (<3 mois)',
		label: 'COURT TERME',
		color: 'text-white',
		bgColor: 'bg-orange-600',
	},
	'Projet à moyen terme (6-12 mois)': {
		value: 'Projet à moyen terme (6-12 mois)',
		label: 'MOYEN TERME',
		color: 'text-white',
		bgColor: 'bg-yellow-600',
	},
	'Projet en réflexion': {
		value: 'Projet en réflexion',
		label: 'EN RÉFLEXION',
		color: 'text-white',
		bgColor: 'bg-gray-500',
	},
} as const;

/**
 * Get search ad badge configuration by value
 */
export const getSearchAdBadgeConfig = (
	value: string,
): BadgeConfig | undefined => {
	return SEARCH_AD_BADGES[value];
};

/**
 * Search Ad Badge Options (for forms/selectors)
 */
export const SEARCH_AD_BADGE_OPTIONS = [
	'Vente urgente',
	'Bien rare',
	'Secteur recherché',
	'Bonne affaire',
	'Fort potentiel',
	'Mandat possible rapidement',
	'Signature imminente',
	'Contact direct propriétaire',
	'Contact ami / famille',
	'Contact pro (collègue, artisan, notaire…)',
] as const;

// ============================================================================
// PROPERTY TYPES
// ============================================================================

export const PROPERTY_TYPES = [
	'Maison',
	'Appartement',
	'Terrain',
	'Immeuble',
	'Local commercial',
	'Bureau',
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

// ============================================================================
// PROPERTY PRIORITIES
// ============================================================================

export const PRIORITIES = [
	'Jardin/Extérieur',
	'Garage/Parking',
	'Proche des transports',
	'Proche des écoles',
	'Quartier calme',
	'Lumineux',
	'Sans travaux',
	'Piscine',
	'Balcon/Terrasse',
	'Ascenseur',
	'Vue dégagée',
	'Calme',
] as const;

export type Priority = (typeof PRIORITIES)[number];

// ============================================================================
// PROPERTY STATUSES
// ============================================================================

export const PROPERTY_STATUSES = {
	ACTIVE: 'active',
	DRAFT: 'draft',
	SOLD: 'sold',
	RENTED: 'rented',
	ARCHIVED: 'archived',
} as const;

export type PropertyStatus =
	(typeof PROPERTY_STATUSES)[keyof typeof PROPERTY_STATUSES];

/**
 * Property Status Configuration
 */
export interface StatusConfig {
	label: string;
	variant: 'success' | 'warning' | 'error' | 'info' | 'default';
	className: string;
}

export const PROPERTY_STATUS_CONFIG: Record<string, StatusConfig> = {
	active: {
		label: 'Actif',
		variant: 'success',
		className: 'bg-green-100 text-green-800',
	},
	draft: {
		label: 'Brouillon',
		variant: 'default',
		className: 'bg-gray-100 text-gray-800',
	},
	sold: {
		label: 'Vendu',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
	rented: {
		label: 'Loué',
		variant: 'info',
		className: 'bg-info-light text-info',
	},
	archived: {
		label: 'Archivé',
		variant: 'warning',
		className: 'bg-yellow-100 text-yellow-800',
	},
} as const;

// ============================================================================
// UI TEXT
// ============================================================================

export const PROPERTY_UI_TEXT = {
	// Page titles
	title: 'Mes annonces immobilières',
	subtitle: 'Gérez et publiez vos biens',
	newProperty: 'Nouvelle annonce',

	// Empty states
	noProperties: 'Aucune annonce pour le moment',
	noPropertiesSubtitle:
		'Créez votre première annonce pour commencer à attirer des clients potentiels.',

	// Loading states
	loading: 'Chargement de vos biens...',
	saving: 'Enregistrement en cours...',
	deleting: 'Suppression en cours...',

	// Actions
	edit: 'Modifier',
	delete: 'Supprimer',
	view: 'Voir',
	publish: 'Publier',
	unpublish: 'Dépublier',
	archive: 'Archiver',

	// Status labels
	available: 'Disponible',
	sold: 'Vendu',
	rented: 'Loué',
	archived: 'Archivé',
	draft: 'Brouillon',

	// Features
	new: 'Nouveau',
	exclusive: 'Exclusivité',
	urgent: 'Urgent',
	negotiable: 'Négociable',
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const PROPERTY_TOAST_MESSAGES = {
	// CRUD operations
	FETCH_ERROR: 'Erreur lors de la récupération de vos biens',
	CREATE_SUCCESS: 'Bien créé avec succès',
	CREATE_ERROR: 'Erreur lors de la création du bien',
	UPDATE_SUCCESS: 'Bien mis à jour avec succès',
	UPDATE_ERROR: 'Erreur lors de la mise à jour du bien',
	DELETE_SUCCESS: 'Bien supprimé avec succès !',
	DELETE_ERROR: 'Erreur lors de la suppression du bien',

	// Status updates
	STATUS_UPDATE_SUCCESS: 'Statut mis à jour avec succès !',
	STATUS_UPDATE_ERROR: 'Erreur lors de la mise à jour du statut',

	// Legacy messages (for backwards compatibility)
	propertySaved: 'Annonce enregistrée avec succès',
	propertyDeleted: 'Annonce supprimée avec succès',
	propertyPublished: 'Annonce publiée avec succès',
	propertyUnpublished: 'Annonce dépubliée avec succès',
	propertyArchived: 'Annonce archivée avec succès',
	propertyError: 'Erreur lors de la sauvegarde',
	deleteError: 'Erreur lors de la suppression',
	loadingError: 'Erreur lors du chargement',
	publishError: 'Erreur lors de la publication',
	networkError: 'Erreur de connexion',
} as const;

export const FAVORITES_TOAST_MESSAGES = {
	ADD_SUCCESS: 'Ajouté aux favoris',
	REMOVE_SUCCESS: 'Retiré des favoris',
	TOGGLE_ERROR: 'Erreur lors de la modification des favoris',
	FETCH_ERROR: 'Erreur lors du chargement des favoris',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const PROPERTY_ENDPOINTS = {
	LIST: '/properties',
	CREATE: '/properties',
	GET_BY_ID: (id: string) => `/properties/${id}`,
	UPDATE: (id: string) => `/properties/${id}`,
	DELETE: (id: string) => `/properties/${id}`,
	SEARCH: '/properties/search',
	MY_PROPERTIES: '/properties/my-properties',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const PROPERTY_ROUTES = {
	LIST: '/properties',
	CREATE: '/properties/create',
	EDIT: (id: string) => `/properties/edit/${id}`,
	DETAIL: (id: string) => `/property/${id}`,
	MY_PROPERTIES: '/dashboard/my-properties',
	AGENTS: '/monagentimmo',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate pluralized property count text
 * @param count - Number of properties
 * @returns Formatted string with proper pluralization
 */
export const getPropertyCountText = (count: number): string => {
	return `${count} annonce${count !== 1 ? 's' : ''}`;
};

/**
 * Generate pluralized message count text
 * @param count - Number of messages
 * @returns Formatted string with proper pluralization
 */
export const getMessageCountText = (count: number): string => {
	return `${count} message${count !== 1 ? 's' : ''}`;
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const PROPERTY_ERRORS = {
	NOT_FOUND: 'Annonce non trouvée',
	LOADING_FAILED: "Erreur lors du chargement de l'annonce",
	SAVE_FAILED: "Erreur lors de l'enregistrement de l'annonce",
	DELETE_FAILED: "Erreur lors de la suppression de l'annonce",
} as const;

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const PROPERTY_LOADING = {
	PAGE: 'Chargement...',
	DETAILS: "Chargement de l'annonce...",
	SAVING: 'Enregistrement en cours...',
} as const;

// ============================================================================
// CONFIRMATION DIALOGS
// ============================================================================

export const PROPERTY_CONFIRMATION_DIALOGS = {
	// Delete Property
	DELETE_TITLE: 'Supprimer le bien',
	DELETE_DESCRIPTION:
		'Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.',
	DELETE_CONFIRM: 'Supprimer',
	DELETE_CANCEL: 'Annuler',
} as const;

// ============================================================================
// FORM PLACEHOLDERS
// ============================================================================

export const PROPERTY_FORM_PLACEHOLDERS = {
	// Step 1: Basic Info
	TITLE: 'Ex: Bel appartement 3 pièces avec balcon',
	DESCRIPTION: 'Décrivez votre bien en détail...',
	SELECT_OPTION: 'Choisissez...',

	// Step 2: Location
	ADDRESS: 'Rechercher une adresse...',
	CITY: 'Ex: Paris, Lyon, Marseille...',
	NEIGHBORHOOD: 'Centre-ville',

	// Step 3: Details
	AVAILABLE_FROM: 'MM / AAAA',
} as const;
