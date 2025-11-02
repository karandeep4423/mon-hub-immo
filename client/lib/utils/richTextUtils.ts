/**
 * Utility functions for handling RichText content (Tiptap JSON format ONLY)
 */

export function extractPlainText(content: string): string {
	if (!content) return '';

	try {
		const json = JSON.parse(content);
		return extractTextFromNode(json);
	} catch {
		// Strict mode - if not valid JSON, return empty
		console.warn('Invalid rich text format - expected Tiptap JSON');
		return '';
	}
}

function extractTextFromNode(node: unknown): string {
	if (!node || typeof node !== 'object') return '';

	const nodeObj = node as Record<string, unknown>;

	// If it's a text node, return the text
	if (nodeObj.type === 'text') {
		return String(nodeObj.text || '');
	}

	// If it has content array, recursively extract text
	if (nodeObj.content && Array.isArray(nodeObj.content)) {
		return nodeObj.content.map(extractTextFromNode).join('');
	}

	return '';
}

export function truncateRichText(content: string, maxLength: number): string {
	const plainText = extractPlainText(content);
	if (plainText.length <= maxLength) return plainText;
	return plainText.substring(0, maxLength) + '...';
}

export function isRichTextEmpty(content: string): boolean {
	if (!content) return true;
	const plainText = extractPlainText(content);
	return plainText.trim().length === 0;
}
