/**
 * Modal Component Constants
 * Reusable modal/dialog component configuration
 */

// ============================================================================
// SIZES
// ============================================================================

export const MODAL_SIZES = {
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
	'2xl': '2xl',
	full: 'full',
} as const;

export type ModalSize = (typeof MODAL_SIZES)[keyof typeof MODAL_SIZES];

// ============================================================================
// SIZE CLASSES
// ============================================================================

export const MODAL_SIZE_CLASSES = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
	'2xl': 'max-w-2xl',
	full: 'max-w-full mx-4',
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const MODAL_ANIMATION = {
	backdrop: {
		enter: 'transition-opacity duration-200 ease-out',
		enterFrom: 'opacity-0',
		enterTo: 'opacity-100',
		leave: 'transition-opacity duration-150 ease-in',
		leaveFrom: 'opacity-100',
		leaveTo: 'opacity-0',
	},
	modal: {
		enter: 'transition-all duration-200 ease-out',
		enterFrom: 'opacity-0 scale-95',
		enterTo: 'opacity-100 scale-100',
		leave: 'transition-all duration-150 ease-in',
		leaveFrom: 'opacity-100 scale-100',
		leaveTo: 'opacity-0 scale-95',
	},
} as const;

// ============================================================================
// BACKDROP
// ============================================================================

export const MODAL_BACKDROP = {
	className:
		'fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200',
	zIndex: 'z-40',
} as const;

// ============================================================================
// CONTAINER
// ============================================================================

export const MODAL_CONTAINER = {
	className: 'fixed inset-0 z-50 flex items-center justify-center p-4',
	maxHeight: 'max-h-[90vh]',
	overflow: 'overflow-y-auto',
} as const;

// ============================================================================
// CONTENT
// ============================================================================

export const MODAL_CONTENT = {
	baseClassName:
		'relative bg-white rounded-2xl shadow-xl w-full m-4 animate-scale-in',
	headerClassName:
		'flex items-center justify-between p-6 border-b border-gray-200',
	bodyClassName: 'p-6',
	footerClassName:
		'flex items-center justify-end gap-3 p-6 border-t border-gray-200',
} as const;

// ============================================================================
// CLOSE BUTTON
// ============================================================================

export const MODAL_CLOSE_BUTTON = {
	ariaLabel: 'Fermer',
	className:
		'text-gray-400 hover:text-gray-600 transition-colors duration-200',
	iconClassName: 'w-6 h-6',
} as const;

// ============================================================================
// DEFAULTS
// ============================================================================

export const MODAL_DEFAULTS = {
	size: MODAL_SIZES.md,
	closeOnBackdrop: true,
	closeOnEscape: true,
	showCloseButton: true,
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const MODAL_A11Y = {
	role: 'dialog',
	ariaModal: true,
	ariaLabelledby: 'modal-title',
	ariaDescribedby: 'modal-description',
	closeButtonLabel: 'Fermer la fenêtre',
	backdropLabel: "Fermer en cliquant à l'extérieur",
} as const;

// ============================================================================
// PORTAL
// ============================================================================

export const MODAL_PORTAL = {
	id: 'modal-root',
	className: 'modal-portal',
} as const;
