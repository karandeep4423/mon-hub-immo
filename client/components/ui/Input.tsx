import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
	icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
	label,
	error,
	helperText,
	className = '',
	id,
	icon,
	...props
}) => {
	const generatedId = useId();
	const inputId = id || generatedId;

	return (
		<div className="w-full">
			{label && (
				<label
					htmlFor={inputId}
					className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
				>
					{icon}
					{label}
				</label>
			)}
			<input
				id={inputId}
				className={`
          block w-full px-4 py-3 sm:py-2.5 text-base
          border-2 rounded-xl
          transition-smooth
          outline-none
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
			{helperText && !error && (
				<p className="mt-2 text-sm text-gray-500">{helperText}</p>
			)}
		</div>
	);
};
