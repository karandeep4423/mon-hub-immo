'use client';

import React from 'react';

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

	return (
		<div
			className={`prose prose-sm max-w-none ${className}`}
			dangerouslySetInnerHTML={{ __html: decodedContent }}
		/>
	);
};
