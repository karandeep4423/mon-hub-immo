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

	return (
		<div
			className={`prose prose-sm max-w-none ${className}`}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
};
