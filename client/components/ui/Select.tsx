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
}

export const Select = ({
	label,
	value,
	onChange,
	name,
	options,
	placeholder = 'Choisissez...',
	required = false,
}: SelectProps) => {
	return (
		<div>
			<label
				htmlFor={name}
				className="block text-sm font-medium text-gray-700 mb-1"
			>
				{label} {required && <span className="text-red-500">*</span>}
			</label>
			<select
				id={name}
				name={name}
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 bg-white"
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
