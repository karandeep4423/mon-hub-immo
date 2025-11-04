import React, { useId } from 'react';
import { useFormContext } from '@/context/FormContext';

interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	helperText?: string;
	icon?: React.ReactNode;
	showCharCount?: boolean;
	maxCharCount?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
	label,
	error,
	helperText,
	className = '',
	id,
	icon,
	disabled,
	showCharCount = false,
	maxCharCount,
	value,
	...props
}) => {
	const generatedId = useId();
	const textareaId = id || generatedId;
	const { isSubmitting } = useFormContext();
	const isDisabled = disabled || isSubmitting;

	const charCount =
		typeof value === 'string'
			? value.length
			: value?.toString().length || 0;

	return (
		<div className="w-full">
			{label && (
				<label
					htmlFor={textareaId}
					className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
				>
					{icon}
					{label}
				</label>
			)}
			<textarea
				id={textareaId}
				disabled={isDisabled}
				value={value}
				className={`
          block w-full px-4 py-3 sm:py-2.5 text-base
          border-2 rounded-xl
          transition-smooth
          outline-none
          resize-vertical
          ${isDisabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}
          ${
				error
					? 'border-error text-error placeholder-red-400 focus:border-error focus:ring-4 focus:ring-red-100'
					: 'border-gray-300 hover:border-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/10'
			}
          ${className}
        `}
				{...props}
			/>
			{error && (
				<p className="mt-2 text-sm text-error font-medium flex items-center">
					<svg
						className="w-4 h-4 mr-1"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
					{error}
				</p>
			)}
			{showCharCount && maxCharCount && (
				<div className="text-xs text-gray-500 mt-1">
					{charCount}/{maxCharCount} caractères
				</div>
			)}
			{helperText && !error && !showCharCount && (
				<p className="mt-2 text-sm text-gray-500">{helperText}</p>
			)}
		</div>
	);
};
