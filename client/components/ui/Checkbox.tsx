import React from 'react';

interface CheckboxProps {
	label: string;
	name: string;
	checked: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	value?: string;
	className?: string;
	labelClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
	label,
	name,
	checked,
	onChange,
	value,
	className = '',
	labelClassName = 'text-sm text-gray-700',
}) => {
	return (
		<label className={`flex items-center ${className}`}>
			<input
				type="checkbox"
				name={name}
				value={value}
				checked={checked}
				onChange={onChange}
				className="rounded border-gray-300 text-brand shadow-sm focus:border-brand focus:ring focus:ring-offset-0 focus:ring-brand/20 focus:ring-opacity-50"
			/>
			<span className={`ml-2 ${labelClassName}`}>{label}</span>
		</label>
	);
};
