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
	Link as LinkIcon,
	Palette,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';

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
	const emojiPickerRef = useRef<HTMLDivElement>(null);
	const savedSelectionRef = useRef<Range | null>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [showAllTools, setShowAllTools] = useState(false);
	const [charCount, setCharCount] = useState(0);
	const [isFocused, setIsFocused] = useState(false);
	const [showLinkModal, setShowLinkModal] = useState(false);
	const [linkUrl, setLinkUrl] = useState('');
	const [linkText, setLinkText] = useState('');
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [selectedColor, setSelectedColor] = useState('#000000');
	const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

	// Font sizes
	const fontSizes = [
		{ label: 'Petit', value: '1' },
		{ label: 'Normal', value: '3' },
		{ label: 'Grand', value: '5' },
		{ label: 'Très grand', value: '7' },
	];

	// Common colors palette
	const colors = [
		'#000000',
		'#434343',
		'#666666',
		'#999999',
		'#B7B7B7',
		'#CCCCCC',
		'#D9D9D9',
		'#EFEFEF',
		'#F3F3F3',
		'#FFFFFF',
		'#980000',
		'#FF0000',
		'#FF9900',
		'#FFFF00',
		'#00FF00',
		'#00FFFF',
		'#4A86E8',
		'#0000FF',
		'#9900FF',
		'#FF00FF',
	];

	// Initialize content from prop only when the editor DOM is still empty.
	// This avoids resetting the caret/selection after the first user keystroke
	// (which previously caused the first character to end up at the end like "elloh").
	useEffect(() => {
		if (!editorRef.current) return;

		const hasDomContent = (editorRef.current.textContent?.length || 0) > 0;
		if (!hasDomContent && value) {
			const decodeHTML = (html: string): string => {
				const txt = document.createElement('textarea');
				txt.innerHTML = html;
				return txt.value;
			};
			editorRef.current.innerHTML = decodeHTML(value);
		}

		// Keep character count in sync
		const text = editorRef.current.innerText || '';
		setCharCount(text.length);
	}, [value]);

	// Close emoji picker when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				emojiPickerRef.current &&
				!emojiPickerRef.current.contains(event.target as Node)
			) {
				setShowEmojiPicker(false);
			}
		};

		if (showEmojiPicker) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showEmojiPicker]);

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

	const saveSelection = () => {
		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
		}
	};

	const restoreSelection = () => {
		if (savedSelectionRef.current && editorRef.current) {
			editorRef.current.focus();
			const selection = window.getSelection();
			if (selection) {
				selection.removeAllRanges();
				selection.addRange(savedSelectionRef.current);
			}
		}
	};

	const execCommand = (command: string, value?: string) => {
		document.execCommand(command, false, value);
		editorRef.current?.focus();
		handleInput();
	};

	const toggleFormat = (command: string) => {
		execCommand(command);
		setActiveFormats((prev) => {
			const newFormats = new Set(prev);
			if (newFormats.has(command)) {
				newFormats.delete(command);
			} else {
				newFormats.add(command);
			}
			return newFormats;
		});
	};

	const isFormatActive = (command: string) => {
		return activeFormats.has(command);
	};

	const insertLink = () => {
		if (linkUrl) {
			const url = linkUrl.startsWith('http')
				? linkUrl
				: `https://${linkUrl}`;
			const text = linkText || url;
			const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${text}</a>&nbsp;`;

			restoreSelection();

			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				range.deleteContents();
				const fragment = range.createContextualFragment(html);
				range.insertNode(fragment);

				// Move cursor after the inserted link
				if (fragment.lastChild) {
					range.setStartAfter(fragment.lastChild);
					range.collapse(true);
					selection.removeAllRanges();
					selection.addRange(range);
				}

				handleInput();
			}

			setShowLinkModal(false);
			setLinkUrl('');
			setLinkText('');
		}
	};

	const applyColor = (color: string) => {
		execCommand('foreColor', color);
		setSelectedColor(color);
		setShowColorPicker(false);
	};

	const applyFontSize = (size: string) => {
		execCommand('fontSize', size);
	};

	const insertEmoji = (emojiData: { emoji: string }) => {
		restoreSelection();

		const selection = window.getSelection();
		if (selection && selection.rangeCount > 0) {
			const range = selection.getRangeAt(0);
			range.deleteContents();
			const textNode = document.createTextNode(emojiData.emoji);
			range.insertNode(textNode);

			// Move cursor after the emoji
			range.setStartAfter(textNode);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);

			handleInput();
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
			action: () => toggleFormat('bold'),
			command: 'bold',
			label: 'Gras (Ctrl+B)',
		},
		{
			icon: Italic,
			action: () => toggleFormat('italic'),
			command: 'italic',
			label: 'Italique (Ctrl+I)',
		},
		{
			icon: Underline,
			action: () => toggleFormat('underline'),
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
			icon: LinkIcon,
			action: () => {
				saveSelection();
				setShowLinkModal(true);
			},
			label: 'Insérer un lien',
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
					{/* Primary buttons - always visible */}
					{allButtons.map((button, index) => {
						const isActive =
							button.command && isFormatActive(button.command);
						return (
							<button
								key={index}
								type="button"
								onClick={(e) => {
									e.preventDefault();
									button.action();
								}}
								className={`p-2 rounded-lg transition-colors ${
									isActive
										? 'bg-cyan-500 text-white hover:bg-cyan-600'
										: 'hover:bg-gray-200 text-gray-700'
								}`}
								title={button.label}
							>
								<button.icon className="w-4 h-4" />
							</button>
						);
					})}

					{/* Font Size Dropdown - visible on desktop, in More on mobile */}
					<div
						className={`relative ${showAllTools ? 'block' : 'hidden md:block'}`}
					>
						<select
							onChange={(e) => applyFontSize(e.target.value)}
							className="px-2 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-200 text-gray-700 cursor-pointer"
							title="Taille de police"
							defaultValue="3"
						>
							{fontSizes.map((size) => (
								<option key={size.value} value={size.value}>
									{size.label}
								</option>
							))}
						</select>
					</div>

					{/* Color Picker - visible on desktop, in More on mobile */}
					<div
						className={`relative ${showAllTools ? 'block' : 'hidden md:block'}`}
					>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								setShowColorPicker(!showColorPicker);
								setShowEmojiPicker(false);
							}}
							className="p-2 rounded-lg hover:bg-gray-200 text-gray-700 flex items-center gap-1"
							title="Couleur du texte"
						>
							<Palette className="w-4 h-4" />
							<div
								className="w-4 h-4 rounded border border-gray-300"
								style={{ backgroundColor: selectedColor }}
							/>
						</button>

						{showColorPicker && (
							<div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
								<div className="grid grid-cols-5 gap-1 w-48">
									{colors.map((color) => (
										<button
											key={color}
											type="button"
											onClick={(e) => {
												e.preventDefault();
												applyColor(color);
											}}
											className="w-8 h-8 rounded border-2 border-gray-300 hover:border-cyan-500 transition-colors"
											style={{ backgroundColor: color }}
											title={color}
										/>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Emoji Picker Button */}
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							saveSelection();
							setShowEmojiPicker(!showEmojiPicker);
							setShowColorPicker(false);
						}}
						className="p-2 rounded-lg hover:bg-gray-200 text-gray-700"
						title="Ajouter un emoji"
					>
						<Smile className="w-4 h-4" />
					</button>

					{showEmojiPicker && (
						<div
							ref={emojiPickerRef}
							className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
							onClick={(e) => {
								if (e.target === e.currentTarget) {
									setShowEmojiPicker(false);
								}
							}}
						>
							<div className="bg-white rounded-2xl shadow-2xl max-w-[95vw] w-full sm:max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
								<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
									<h3 className="text-sm font-semibold text-gray-900">
										Choisir un emoji
									</h3>
									<button
										type="button"
										onClick={() =>
											setShowEmojiPicker(false)
										}
										className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
										title="Fermer"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
								<div className="max-h-[70vh] overflow-auto">
									<EmojiPicker
										onEmojiClick={insertEmoji}
										width="100%"
										height="450px"
									/>
								</div>
							</div>
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

					{/* Desktop: show secondary tools */}
					<div className="hidden md:flex items-center gap-1">
						{secondaryButtons.map((button, index) => {
							const isActive =
								button.command &&
								isFormatActive(button.command);
							return (
								<button
									key={`desktop-${index}`}
									type="button"
									onClick={(e) => {
										e.preventDefault();
										button.action();
									}}
									className={`p-2 rounded-lg transition-colors ${
										isActive
											? 'bg-cyan-500 text-white hover:bg-cyan-600'
											: 'hover:bg-gray-200 text-gray-700'
									}`}
									title={button.label}
								>
									<button.icon className="w-4 h-4" />
								</button>
							);
						})}
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

			{/* Link Modal */}
			<Modal
				isOpen={showLinkModal}
				onClose={() => {
					setShowLinkModal(false);
					setLinkUrl('');
					setLinkText('');
				}}
				title="Insérer un lien"
			>
				<div className="space-y-4">
					<Input
						label="URL du lien"
						value={linkUrl}
						onChange={(e) => setLinkUrl(e.target.value)}
						placeholder="https://exemple.com"
						type="url"
					/>
					<Input
						label="Texte à afficher (optionnel)"
						value={linkText}
						onChange={(e) => setLinkText(e.target.value)}
						placeholder="Cliquez ici"
					/>
					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={() => {
								setShowLinkModal(false);
								setLinkUrl('');
								setLinkText('');
							}}
						>
							Annuler
						</Button>
						<Button onClick={insertLink} disabled={!linkUrl}>
							Insérer
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};
