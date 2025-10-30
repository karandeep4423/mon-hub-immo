'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
	Bold,
	Italic,
	Underline,
	List,
	ListOrdered,
	Smile,
	MoreHorizontal,
	Undo,
	Redo,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
	ssr: false,
});

interface RichTextEditorProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: string;
	minHeight?: string;
	showCharCount?: boolean;
	label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
	value = '',
	onChange,
	placeholder = 'Commencez à écrire...',
	error,
	minHeight = '120px',
	showCharCount = false,
	label,
}) => {
	const editorRef = useRef<HTMLDivElement>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [showAllTools, setShowAllTools] = useState(false);
	const [charCount, setCharCount] = useState(0);
	const [isFocused, setIsFocused] = useState(false);

	// Initialize content
	useEffect(() => {
		if (editorRef.current && value && !editorRef.current.innerHTML) {
			editorRef.current.innerHTML = value;
		}
	}, [value]);

	// Update character count
	useEffect(() => {
		if (editorRef.current) {
			const text = editorRef.current.innerText || '';
			setCharCount(text.length);
		}
	}, [value]);

	const handleInput = () => {
		if (editorRef.current) {
			const html = editorRef.current.innerHTML;
			onChange(html);
			const text = editorRef.current.innerText || '';
			setCharCount(text.length);
		}
	};

	const execCommand = (command: string, value?: string) => {
		document.execCommand(command, false, value);
		editorRef.current?.focus();
	};

	const insertEmoji = (emojiData: { emoji: string }) => {
		if (editorRef.current) {
			editorRef.current.focus();
			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				range.deleteContents();
				const textNode = document.createTextNode(emojiData.emoji);
				range.insertNode(textNode);
				range.setStartAfter(textNode);
				range.collapse(true);
				selection.removeAllRanges();
				selection.addRange(range);
				handleInput();
			}
		}
		setShowEmojiPicker(false);
	};

	type ToolbarButton = {
		icon: React.ComponentType<{ className?: string }>;
		action: () => void;
		command?: string;
		label: string;
	};

	const primaryButtons: ToolbarButton[] = [
		{
			icon: Bold,
			action: () => execCommand('bold'),
			command: 'bold',
			label: 'Gras (Ctrl+B)',
		},
		{
			icon: Italic,
			action: () => execCommand('italic'),
			command: 'italic',
			label: 'Italique (Ctrl+I)',
		},
		{
			icon: Underline,
			action: () => execCommand('underline'),
			command: 'underline',
			label: 'Souligné (Ctrl+U)',
		},
		{
			icon: List,
			action: () => execCommand('insertUnorderedList'),
			label: 'Liste à puces',
		},
	];

	const secondaryButtons: ToolbarButton[] = [
		{
			icon: ListOrdered,
			action: () => execCommand('insertOrderedList'),
			label: 'Liste numérotée',
		},
		{
			icon: Undo,
			action: () => execCommand('undo'),
			label: 'Annuler',
		},
		{
			icon: Redo,
			action: () => execCommand('redo'),
			label: 'Refaire',
		},
	];

	const allButtons = showAllTools
		? [...primaryButtons, ...secondaryButtons]
		: primaryButtons;

	return (
		<div className="w-full">
			{label && (
				<label className="block text-sm font-semibold text-gray-700 mb-2">
					{label}
				</label>
			)}

			<div
				className={`
					border-2 rounded-xl overflow-hidden transition-all duration-200
					${error ? 'border-red-300' : isFocused ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-gray-200 hover:border-gray-300'}
				`}
			>
				{/* Toolbar */}
				<div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 flex-wrap relative">
					{allButtons.map((button, index) => (
						<button
							key={index}
							type="button"
							onClick={(e) => {
								e.preventDefault();
								button.action();
							}}
							className="p-2 rounded-lg transition-colors hover:bg-gray-200 text-gray-700"
							title={button.label}
						>
							<button.icon className="w-4 h-4" />
						</button>
					))}

					{/* Emoji Picker Button */}
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							setShowEmojiPicker(!showEmojiPicker);
						}}
						className="p-2 rounded-lg hover:bg-gray-200 text-gray-700"
						title="Ajouter un emoji"
					>
						<Smile className="w-4 h-4" />
					</button>

					{showEmojiPicker && (
						<div className="absolute top-full left-0 mt-1 z-50">
							<EmojiPicker onEmojiClick={insertEmoji} />
						</div>
					)}

					{/* More button - mobile */}
					{!showAllTools && (
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								setShowAllTools(true);
							}}
							className="p-2 rounded-lg hover:bg-gray-200 text-gray-700 md:hidden"
							title="Plus d'options"
						>
							<MoreHorizontal className="w-4 h-4" />
						</button>
					)}

					{showAllTools && (
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								setShowAllTools(false);
							}}
							className="p-2 rounded-lg hover:bg-gray-200 text-gray-700 text-xs md:hidden ml-auto"
						>
							Réduire
						</button>
					)}

					{/* Desktop: show all tools */}
					<div className="hidden md:flex items-center gap-1">
						{secondaryButtons.map((button, index) => (
							<button
								key={`desktop-${index}`}
								type="button"
								onClick={(e) => {
									e.preventDefault();
									button.action();
								}}
								className="p-2 rounded-lg transition-colors hover:bg-gray-200 text-gray-700"
								title={button.label}
							>
								<button.icon className="w-4 h-4" />
							</button>
						))}
					</div>
				</div>

				{/* Editor Content */}
				<div
					ref={editorRef}
					contentEditable
					onInput={handleInput}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					className={`
						px-4 py-3 outline-none
						${error ? 'text-red-900' : 'text-gray-900'}
						prose prose-sm max-w-none
					`}
					style={{ minHeight }}
					data-placeholder={placeholder}
					suppressContentEditableWarning
				/>

				{/* Character count & error */}
				<div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs">
					{showCharCount && (
						<span className="text-gray-500">
							{charCount} caractères
						</span>
					)}
					{error && (
						<span className="text-red-600 font-medium ml-auto">
							{error}
						</span>
					)}
				</div>
			</div>
		</div>
	);
};
