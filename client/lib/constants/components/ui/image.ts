/**
 * Image Uploader Component Constants
 * Profile and general image upload components
 */

// ============================================================================
// UPLOADER SIZES
// ============================================================================

export const IMAGE_UPLOADER_SIZES = {
	small: 'small',
	medium: 'medium',
	large: 'large',
} as const;

export type ImageUploaderSize =
	(typeof IMAGE_UPLOADER_SIZES)[keyof typeof IMAGE_UPLOADER_SIZES];

// ============================================================================
// UPLOADER SIZE CLASSES
// ============================================================================

export const IMAGE_UPLOADER_SIZE_CLASSES = {
	small: 'w-16 h-16',
	medium: 'w-20 h-20',
	large: 'w-32 h-32',
} as const;

// ============================================================================
// UPLOADER MESSAGES
// ============================================================================

export const IMAGE_UPLOADER_MESSAGES = {
	uploadSuccess: 'Image téléchargée avec succès',
	uploadError: "Échec du téléchargement de l'image",
	deleteSuccess: 'Image supprimée avec succès',
	deleteError: "Échec de la suppression de l'image",
	invalidFormat: 'Format de fichier non valide',
	fileTooLarge: 'Le fichier est trop volumineux',
	fileTooLargeWithSize: 'Le fichier est trop volumineux (max 5MB)',
	fileTypeNotSupported: 'Type de fichier non supporté',
	maxImagesReached: (max: number) => `Maximum ${max} images autorisées`,
	uploadGenericError: 'Erreur lors du téléchargement',
} as const;

// ============================================================================
// ALT TEXT
// ============================================================================

export const IMAGE_ALT_TEXT = {
	preview: 'Aperçu',
	searchAdImage: 'Recherche de bien',
	profileImage: 'Profil actuel',
	mainPropertyImage: 'Image principale actuelle',
	appointmentIllustration: 'Illustration de prise de rendez-vous',
	estimateHouse: 'Estimer ma maison',
	sellProperty: 'Mettre en vente',
	searchProperty: 'Chercher un bien',
} as const;
