export const htmlTextLength = (html: string | undefined | null): number => {
	if (!html || typeof html !== 'string') return 0;
	// Decode entities and extract plain text using the browser DOM
	const div = document.createElement('div');
	div.innerHTML = html;
	const text = (div.textContent || div.innerText || '')
		// remove zero-width and BOM characters that editors may inject
		.replace(/[\u200B-\u200D\uFEFF]/g, '')
		// collapse whitespace
		.replace(/\s+/g, ' ')
		.trim();
	return text.length;
};

export const htmlToPlainText = (html: string | undefined | null): string => {
	if (!html || typeof html !== 'string') return '';
	const div = document.createElement('div');
	div.innerHTML = html;
	return (div.textContent || div.innerText || '')
		.replace(/[\u200B-\u200D\uFEFF]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
};
