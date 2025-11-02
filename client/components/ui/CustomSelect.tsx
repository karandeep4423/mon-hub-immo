'use client';

import { useState, useRef, useEffect } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface SelectProps {
	label?: string;
	value?: string;
	onChange: (value: string) => void;
	name?: string;
	options: SelectOption[];
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	icon?: React.ReactNode;
	className?: string;
	error?: string;
}

export const Select = ({
	label,
	value,
	onChange,
	name,
	options,
	placeholder = 'Choisissez...',
	required = false,
	disabled = false,
	icon,
	className = '',
	error,
}: SelectProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useClickOutside([containerRef], () => setIsOpen(false));

	// Handle open/close animations
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			setIsAnimating(false);
			const timer = setTimeout(() => setShouldRender(false), 200);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	const selectedOption = options.find((opt) => opt.value === value);
	const displayText = selectedOption?.label || placeholder;

	const handleSelect = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return;

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			setIsOpen(!isOpen);
		} else if (e.key === 'Escape') {
			setIsOpen(false);
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			if (!isOpen) {
				setIsOpen(true);
			} else {
				const currentIndex = options.findIndex(
					(opt) => opt.value === value,
				);
				const nextIndex =
					e.key === 'ArrowDown'
						? Math.min(currentIndex + 1, options.length - 1)
						: Math.max(currentIndex - 1, 0);
				const nextOption = options[nextIndex];
				if (nextOption && !nextOption.disabled) {
					onChange(nextOption.value);
				}
			}
		}
	};

	return (
		<div className={className}>
			{label && (
				<label
					htmlFor={name}
					className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
				>
					{icon}
					{label}{' '}
					{required && <span className="text-red-500">*</span>}
				</label>
			)}

			<div ref={containerRef} className="relative">
				{/* Select trigger */}
				<button
					type="button"
					id={name}
					onClick={() => !disabled && setIsOpen(!isOpen)}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					style={{ outline: 'none', boxShadow: 'none' }}
					className={`
					w-full text-left px-4 py-2.5 
					rounded-lg !outline-none
					transition-all duration-150
					${
						disabled
							? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 border border-gray-300'
							: 'bg-white text-gray-900 cursor-pointer hover:bg-gray-50'
					}
					${error ? 'border-2 border-red-500' : !isOpen ? 'border border-gray-300' : ''}
					${isOpen ? 'border-2 border-brand' : ''}
					focus:!outline-none focus:border-2 focus:border-brand
				`}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
				>
					<div className="flex items-center justify-between">
						<span
							className={
								!value ? 'text-gray-400' : 'text-gray-900'
							}
						>
							{displayText}
						</span>
						<svg
							className={`w-5 h-5 transition-transform-smooth ${
								isOpen ? 'rotate-180' : ''
							} ${disabled ? 'text-gray-400' : 'text-brand'}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</button>

				{/* Dropdown menu */}
				{shouldRender && !disabled && (
					<div
						className={`absolute z-[9999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-auto transition-all duration-200 ${
							isAnimating
								? 'opacity-100 translate-y-0'
								: 'opacity-0 -translate-y-2'
						}`}
						role="listbox"
						style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}
					>
						{options.map((option) => (
							<button
								key={option.value}
								type="button"
								onClick={() =>
									!option.disabled &&
									handleSelect(option.value)
								}
								disabled={option.disabled}
								className={`
									w-full text-left px-4 py-2.5
									transition-colors-smooth
									${
										option.value === value
											? 'bg-brand text-white font-semibold'
											: option.disabled
												? 'text-gray-400 cursor-not-allowed'
												: 'text-gray-900 hover:bg-brand-50 hover:text-brand-800'
									}
									${option.disabled ? 'opacity-50' : ''}
								`}
								role="option"
								aria-selected={option.value === value}
							>
								{option.label}
							</button>
						))}
					</div>
				)}
			</div>

			{error && (
				<p className="mt-1 text-sm text-red-600" role="alert">
					{error}
				</p>
			)}
		</div>
	);
};
