'use client';

import React from 'react';

interface RadioOption {
	value: string;
	label: string;
}

interface RadioGroupProps {
	label: string;
	name: string;
	value: boolean | null | undefined;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	className?: string;
	inline?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
	label,
	name,
	value,
	onChange,
	disabled = false,
	className = '',
	inline = true,
}) => {
	const options: RadioOption[] = [
		{ value: 'yes', label: 'Oui' },
		{ value: 'no', label: 'Non' },
	];

	const handleChange = (optionValue: string) => {
		onChange(optionValue === 'yes');
	};

	const currentValue =
		value === true ? 'yes' : value === false ? 'no' : undefined;

	return (
		<div className={className}>
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
			</label>
			<div
				className={`flex ${inline ? 'flex-row gap-6' : 'flex-col gap-2'}`}
			>
				{options.map((option) => (
					<label
						key={option.value}
						className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
					>
						<input
							type="radio"
							name={name}
							value={option.value}
							checked={currentValue === option.value}
							onChange={() => handleChange(option.value)}
							disabled={disabled}
							className="h-4 w-4 text-brand border-gray-300 focus:ring-brand/20 focus:ring-2"
						/>
						<span className="ml-2 text-sm text-gray-700">
							{option.label}
						</span>
					</label>
				))}
			</div>
		</div>
	);
};
