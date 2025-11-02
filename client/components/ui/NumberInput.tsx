'use client';

interface NumberInputProps {
	label: string;
	value?: number;
	onChange: (value: number | undefined) => void;
	name: string;
	unit?: string;
	placeholder?: string;
	min?: number;
	max?: number;
	required?: boolean;
	icon?: React.ReactNode;
}

export const NumberInput = ({
	label,
	value,
	onChange,
	name,
	unit,
	placeholder,
	min,
	max,
	required = false,
	icon,
}: NumberInputProps) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		if (val === '') {
			onChange(undefined);
		} else {
			const numVal = parseFloat(val);
			if (!isNaN(numVal)) {
				onChange(numVal);
			}
		}
	};

	return (
		<div>
			<label
				htmlFor={name}
				className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"
			>
				{icon}
				{label} {required && <span className="text-red-500">*</span>}
			</label>
			<div className="relative">
				<input
					id={name}
					name={name}
					type="number"
					min={min}
					max={max}
					value={value?.toString() || ''}
					onChange={handleChange}
					placeholder={placeholder}
					className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 pr-12"
				/>
				{unit && (
					<span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 pointer-events-none">
						{unit}
					</span>
				)}
			</div>
		</div>
	);
};
