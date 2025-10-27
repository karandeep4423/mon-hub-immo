/**
 * Pagination Component Constants
 * Pagination controls and configuration
 */

// ============================================================================
// DEFAULTS
// ============================================================================

export const PAGINATION_DEFAULTS = {
	itemsPerPage: 10,
	maxVisiblePages: 5,
	firstPage: 1,
} as const;

// ============================================================================
// ITEMS PER PAGE OPTIONS
// ============================================================================

export const PAGINATION_ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;

// ============================================================================
// LABELS
// ============================================================================

export const PAGINATION_LABELS = {
	previous: 'Précédent',
	next: 'Suivant',
	first: 'Premier',
	last: 'Dernier',
	page: 'Page',
	of: 'sur',
	itemsPerPage: 'Éléments par page',
	showing: 'Affichage de',
	to: 'à',
	results: 'résultats',
	noResults: 'Aucun résultat',
} as const;

// ============================================================================
// BUTTON CLASSES
// ============================================================================

export const PAGINATION_BUTTON_CLASSES = {
	base: 'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
	active: 'bg-brand-600 text-white',
	inactive: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300',
	disabled: 'opacity-50 cursor-not-allowed',
	navigation: 'px-4 py-2',
} as const;

// ============================================================================
// CONTAINER CLASSES
// ============================================================================

export const PAGINATION_CONTAINER = {
	wrapper: 'flex items-center justify-between',
	controls: 'flex items-center gap-2',
	info: 'text-sm text-gray-700',
} as const;

// ============================================================================
// INFO TEXT
// ============================================================================

export const PAGINATION_INFO = {
	format: (start: number, end: number, total: number) =>
		`${PAGINATION_LABELS.showing} ${start} ${PAGINATION_LABELS.to} ${end} ${PAGINATION_LABELS.of} ${total} ${PAGINATION_LABELS.results}`,
	empty: PAGINATION_LABELS.noResults,
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const PAGINATION_A11Y = {
	navigation: 'Navigation de pagination',
	previous: 'Page précédente',
	next: 'Page suivante',
	page: (page: number) => `Aller à la page ${page}`,
	currentPage: (page: number) => `Page ${page}, page actuelle`,
} as const;
