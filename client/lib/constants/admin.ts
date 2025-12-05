/**
 * Admin module constants
 * Centralized configuration for admin components
 */
import {
	BarChart2,
	Users,
	Home,
	Handshake,
	type LucideIcon,
} from 'lucide-react';

// ==================== Navigation ====================

export interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	badge?: string | null;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
	{
		label: 'Tableau de bord',
		href: '/admin',
		icon: BarChart2,
		badge: null,
	},
	{
		label: 'Utilisateurs',
		href: '/admin/users',
		icon: Users,
		badge: null,
	},
	{
		label: 'Annonces',
		href: '/admin/properties',
		icon: Home,
		badge: null,
	},
	{
		label: 'Collaborations',
		href: '/admin/collaborations',
		icon: Handshake,
		badge: null,
	},
];

export const ADMIN_MOBILE_NAV_ITEMS = ADMIN_NAV_ITEMS.map((item) => ({
	href: item.href,
	label: item.label.length > 8 ? item.label.slice(0, 8) : item.label,
	icon: item.icon,
}));

// ==================== User Options ====================

export const USER_TYPE_OPTIONS = [
	{ value: '', label: 'Tous' },
	{ value: 'agent', label: 'Agent' },
	{ value: 'apporteur', label: 'Apporteur' },
	{ value: 'admin', label: 'Admin' },
];

export const USER_ROLE_OPTIONS = [
	{ value: 'agent', label: 'Agent' },
	{ value: 'apporteur', label: 'Apporteur' },
	{ value: 'admin', label: 'Admin' },
];

export const USER_STATUS_OPTIONS = [
	{ value: '', label: 'Tous' },
	{ value: 'active', label: 'Actif' },
	{ value: 'pending', label: 'En attente' },
	{ value: 'blocked', label: 'Bloqué' },
];

export const VALIDATION_OPTIONS = [
	{ value: '', label: 'Tous' },
	{ value: 'true', label: 'Validé' },
	{ value: 'false', label: 'Non validé' },
];

export const AGENT_TYPE_OPTIONS = [
	{ value: '', label: 'Sélectionner un type' },
	{ value: 'independent', label: 'Agent immobilier indépendant' },
	{ value: 'commercial', label: 'Agent commercial immobilier' },
	{ value: 'employee', label: "Négociateur VRP employé d'agence" },
];

// ==================== Property Options ====================

export const PROPERTY_TYPE_OPTIONS = [
	{ value: '', label: 'Tous types' },
	{ value: 'Appartement', label: 'Appartement' },
	{ value: 'Maison', label: 'Maison' },
	{ value: 'Terrain', label: 'Terrain' },
	{ value: 'Commercial', label: 'Commercial' },
];

export const PROPERTY_STATUS_OPTIONS = [
	{ value: '', label: 'Tous statuts' },
	{ value: 'active', label: 'Actif' },
	{ value: 'pending', label: 'En attente' },
	{ value: 'archived', label: 'Archivé' },
];

export const POST_TYPE_OPTIONS = [
	{ value: '', label: 'Tous' },
	{ value: 'property', label: 'Annonces' },
	{ value: 'search', label: 'Recherches' },
];

// ==================== Collaboration Options ====================

export const COLLABORATION_STATUS_OPTIONS = [
	{ value: '', label: 'Tous statuts' },
	{ value: 'pending', label: 'En attente' },
	{ value: 'active', label: 'Active' },
	{ value: 'completed', label: 'Complétée' },
	{ value: 'cancelled', label: 'Annulée' },
];

export const COLLAB_TYPE_OPTIONS = [
	{ value: '', label: 'Tous' },
	{ value: 'agent-agent', label: 'Agent-Agent' },
	{ value: 'agent-apporteur', label: 'Agent-Apporteur' },
];

// ==================== Status Mappings ====================

export const STATUS_LABELS: Record<string, string> = {
	pending: 'En attente',
	active: 'Active',
	completed: 'Complétée',
	cancelled: 'Annulée',
	blocked: 'Bloqué',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
	apartment: 'Appartement',
	house: 'Maison',
	land: 'Terrain',
	commercial: 'Commercial',
	studio: 'Studio',
	search: 'Recherche',
	property: 'Annonce',
};

// ==================== Color Mappings ====================

export const STAT_CARD_COLORS = {
	blue: 'from-blue-50 to-cyan-50 border-blue-100',
	green: 'from-emerald-50 to-green-50 border-emerald-100',
	yellow: 'from-amber-50 to-yellow-50 border-amber-100',
	purple: 'from-purple-50 to-indigo-50 border-purple-100',
	rose: 'from-rose-50 to-pink-50 border-rose-100',
} as const;

export const GRADIENT_COLORS = {
	blue: 'from-blue-600 to-cyan-600',
	green: 'from-emerald-600 to-green-600',
	purple: 'from-purple-600 to-indigo-600',
	rose: 'from-rose-600 to-pink-600',
} as const;

// ==================== Pagination ====================

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// ==================== Confirmation Messages ====================

export const CONFIRM_MESSAGES = {
	DELETE_USER:
		'Supprimer définitivement cet utilisateur ? Cette action supprimera aussi ses biens, collaborations et messages.',
	BLOCK_USER: 'Bloquer cet utilisateur ?',
	UNBLOCK_USER: 'Débloquer cet utilisateur ?',
	VALIDATE_USER: 'Valider cet utilisateur ?',
	INVALIDATE_USER: 'Retirer la validation de cet utilisateur ?',
	GRANT_ACCESS:
		"Donner l'accès manuel à cet utilisateur (outrepasse le paiement) ?",
	REVOKE_ACCESS: "Révoquer l'accès manuel pour cet utilisateur ?",
	PAYMENT_REMINDER: 'Envoyer un rappel de paiement à cet utilisateur ?',
	DELETE_PROPERTY: 'Supprimer cette annonce ?',
	DELETE_COLLABORATION:
		'Supprimer définitivement cette collaboration ? Cette action est irréversible.',
	CANCEL_COLLABORATION: 'Annuler cette collaboration ?',
	COMPLETE_COLLABORATION: 'Forcer la complétion de cette collaboration ?',
} as const;

// ==================== Action Success Messages ====================

export const ACTION_SUCCESS_MESSAGES: Record<string, string> = {
	validate: 'Utilisateur validé avec succès',
	invalidate: 'Validation retirée',
	block: 'Utilisateur bloqué',
	unblock: 'Utilisateur débloqué',
	grant_access: 'Accès manuel accordé',
	revoke_access: 'Accès manuel révoqué',
	delete: 'Utilisateur supprimé',
	payment_reminder: 'Rappel de paiement envoyé',
};
