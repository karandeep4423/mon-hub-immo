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
		bgColor: 'bg-blue-500',
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
		bgColor: 'bg-cyan-500',
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
		bgColor: 'bg-blue-400',
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
];

export const getBadgeConfig = (value: string): BadgeConfig | undefined => {
	return PROPERTY_BADGES.find((badge) => badge.value === value);
};

// Search Ad Badges
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
		bgColor: 'bg-blue-600',
	},
	'Contact ami / famille': {
		value: 'Contact ami / famille',
		label: 'CONTACT AMI/FAMILLE',
		color: 'text-white',
		bgColor: 'bg-cyan-600',
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
		bgColor: 'bg-blue-500',
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
};

export const getSearchAdBadgeConfig = (
	value: string,
): BadgeConfig | undefined => {
	return SEARCH_AD_BADGES[value];
};
