'use client';

import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextDisplayProps {
	content: string;
	className?: string;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
	content,
	className = '',
}) => {
	if (!content) return null;

	// Decode HTML entities if they exist (e.g., &lt; to <, &gt; to >)
	const decodeHTML = (html: string): string => {
		const txt = document.createElement('textarea');
		txt.innerHTML = html;
		return txt.value;
	};

	const decodedContent = decodeHTML(content);

	// Sanitize HTML to prevent XSS attacks while preserving styling
	const sanitizedContent = DOMPurify.sanitize(decodedContent, {
		ALLOWED_TAGS: [
			'p',
			'br',
			'strong',
			'b',
			'em',
			'i',
			'u',
			'ul',
			'ol',
			'li',
			'a',
			'span',
			'div',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'font',
			'sub',
			'sup',
			'strike',
			's',
		],
		ALLOWED_ATTR: [
			'href',
			'target',
			'rel',
			'class',
			'style',
			'color',
			'size',
		],
	});

	return (
		<div
			className={`rich-text-display ${className}`}
			style={{
				lineHeight: '1.6',
			}}
			dangerouslySetInnerHTML={{ __html: sanitizedContent }}
		/>
	);
};
