/**
 * Footer Component Constants
 * Site footer links and information
 */

// ============================================================================
// BRANDING
// ============================================================================

export const FOOTER_BRANDING = {
	name: 'MonHubImmo',
	tagline: 'Votre plateforme immobilière de confiance',
	description:
		"Connectez agents immobiliers et apporteurs d'affaires pour des collaborations réussies.",
	copyright: (year: number) => `© ${year} MonHubImmo. Tous droits réservés.`,
} as const;

// ============================================================================
// NAVIGATION SECTIONS
// ============================================================================

export const FOOTER_NAV = {
	platform: {
		title: 'Plateforme',
		links: [
			{ label: 'Trouver un agent', href: '/monagentimmo' },
			{ label: 'Recherches', href: '/search-ads' },
			{ label: 'Tableau de bord', href: '/dashboard' },
			{ label: 'Messages', href: '/chat' },
		],
	},
	company: {
		title: 'Entreprise',
		links: [
			{ label: 'À propos', href: '/about' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Blog', href: '/blog' },
			{ label: 'Carrières', href: '/careers' },
		],
	},
	legal: {
		title: 'Légal',
		links: [
			{ label: 'Mentions légales', href: '/legal' },
			{ label: 'Politique de confidentialité', href: '/privacy' },
			{ label: 'CGU', href: '/terms' },
			{ label: 'Cookies', href: '/cookies' },
		],
	},
	help: {
		title: 'Aide',
		links: [
			{ label: "Centre d'aide", href: '/help' },
			{ label: 'FAQ', href: '/faq' },
			{ label: 'Support', href: '/support' },
			{ label: 'Guide de démarrage', href: '/getting-started' },
		],
	},
} as const;

// ============================================================================
// SOCIAL MEDIA
// ============================================================================

export const FOOTER_SOCIAL = {
	title: 'Suivez-nous',
	links: [
		{
			name: 'Facebook',
			icon: 'facebook',
			href: 'https://facebook.com/monhubimmo',
			ariaLabel: 'Suivez-nous sur Facebook',
		},
		{
			name: 'Twitter',
			icon: 'twitter',
			href: 'https://twitter.com/monhubimmo',
			ariaLabel: 'Suivez-nous sur Twitter',
		},
		{
			name: 'LinkedIn',
			icon: 'linkedin',
			href: 'https://linkedin.com/company/monhubimmo',
			ariaLabel: 'Suivez-nous sur LinkedIn',
		},
		{
			name: 'Instagram',
			icon: 'instagram',
			href: 'https://instagram.com/monhubimmo',
			ariaLabel: 'Suivez-nous sur Instagram',
		},
	],
} as const;

// ============================================================================
// CONTACT INFO
// ============================================================================

export const FOOTER_CONTACT = {
	title: 'Contact',
	email: 'contact@monhubimmo.fr',
	phone: '+33 1 23 45 67 89',
	address: {
		street: '123 Avenue des Champs-Élysées',
		city: 'Paris',
		postalCode: '75008',
		country: 'France',
	},
	hours: 'Lundi - Vendredi: 9h - 18h',
} as const;

// ============================================================================
// NEWSLETTER
// ============================================================================

export const FOOTER_NEWSLETTER = {
	title: 'Newsletter',
	description: 'Restez informé des dernières actualités immobilières',
	placeholder: 'Votre email',
	button: "S'abonner",
	submitting: 'Inscription...',
	success: 'Merci pour votre inscription !',
	error: "Erreur lors de l'inscription",
	privacy:
		'Nous respectons votre vie privée. Désinscription possible à tout moment.',
} as const;

// ============================================================================
// LANGUAGE SELECTOR
// ============================================================================

export const FOOTER_LANGUAGE = {
	title: 'Langue',
	current: 'Français',
	options: [
		{ code: 'fr', label: 'Français' },
		{ code: 'en', label: 'English' },
		{ code: 'es', label: 'Español' },
	],
} as const;

// ============================================================================
// APP DOWNLOADS
// ============================================================================

export const FOOTER_APP_DOWNLOADS = {
	title: "Télécharger l'application",
	appStore: {
		label: "Télécharger sur l'App Store",
		href: '#',
	},
	playStore: {
		label: 'Disponible sur Google Play',
		href: '#',
	},
} as const;

// ============================================================================
// TRUST BADGES
// ============================================================================

export const FOOTER_TRUST_BADGES = {
	title: 'Certifications',
	badges: [
		{ name: 'SSL Sécurisé', icon: '🔒' },
		{ name: 'RGPD Conforme', icon: '✓' },
		{ name: 'Paiement Sécurisé', icon: '💳' },
	],
} as const;

// ============================================================================
// STYLES
// ============================================================================

export const FOOTER_STYLES = {
	container: 'bg-gray-900 text-white',
	wrapper: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12',
	sectionTitle: 'text-lg font-semibold mb-4',
	link: 'text-gray-400 hover:text-white transition-colors',
	divider: 'border-t border-gray-800 mt-8 pt-8',
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const FOOTER_A11Y = {
	nav: 'Navigation du pied de page',
	social: 'Réseaux sociaux',
	newsletter: 'Inscription à la newsletter',
	language: 'Sélecteur de langue',
} as const;
