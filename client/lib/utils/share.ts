import { toast } from 'react-toastify';
import { logger } from './logger';

/**
 * Share content using Web Share API or fallback to clipboard
 */
export interface ShareContentOptions {
	title: string;
	text?: string;
	url?: string;
	successMessage?: string;
	errorMessage?: string;
}

/**
 * Share content via native share or copy to clipboard
 * Uses Web Share API if available, otherwise copies URL to clipboard
 */
export const shareContent = async (
	options: ShareContentOptions,
): Promise<void> => {
	const {
		title,
		text,
		url = window.location.href,
		successMessage = 'Lien copié dans le presse-papiers',
		errorMessage = 'Erreur lors du partage',
	} = options;

	try {
		// Check if Web Share API is available
		if (navigator.share) {
			await navigator.share({
				title,
				text,
				url,
			});
			logger.debug('[Share] Content shared via Web Share API');
		} else {
			// Fallback to clipboard
			await navigator.clipboard.writeText(url);
			toast.success(successMessage);
			logger.debug('[Share] URL copied to clipboard');
		}
	} catch (error) {
		// User cancelled share or clipboard failed
		if (error instanceof Error && error.name === 'AbortError') {
			logger.debug('[Share] User cancelled share');
			return;
		}
		logger.error('[Share] Share failed:', error);
		toast.error(errorMessage);
	}
};
