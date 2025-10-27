/**
 * Dialog Component Constants
 * Confirmation dialogs and modals
 */

// ============================================================================
// DIALOG VARIANTS
// ============================================================================

export const DIALOG_VARIANTS = {
	danger: 'danger',
	primary: 'primary',
	warning: 'warning',
	info: 'info',
} as const;

export type DialogVariant =
	(typeof DIALOG_VARIANTS)[keyof typeof DIALOG_VARIANTS];

// ============================================================================
// DIALOG VARIANT CLASSES (for confirm buttons)
// ============================================================================

export const DIALOG_VARIANT_CLASSES = {
	danger: 'bg-red-600 hover:bg-red-700 text-white',
	primary: 'bg-brand-600 hover:bg-brand-700 text-white',
	warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
	info: 'bg-blue-600 hover:bg-blue-700 text-white',
} as const;

// ============================================================================
// DIALOG TEXT DEFAULTS
// ============================================================================

export const DIALOG_TEXT = {
	confirm: 'Confirmer',
	cancel: 'Annuler',
	ok: 'OK',
	close: 'Fermer',
	yes: 'Oui',
	no: 'Non',
} as const;
