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
