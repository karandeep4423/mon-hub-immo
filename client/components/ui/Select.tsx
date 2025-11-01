'use client';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	label: string;
	value?: string;
	onChange: (value: string) => void;
	name: string;
	options: SelectOption[];
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	icon?: React.ReactNode;
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
}: SelectProps) => {
	return (
		<div>
			<label
				htmlFor={name}
				className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
			>
				{icon}
				{label} {required && <span className="text-red-500">*</span>}
			</label>
			<select
				id={name}
				name={name}
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				className="block w-full"
			>
				<option value="">{placeholder}</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
};
