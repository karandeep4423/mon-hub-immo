'use client';

interface EnergyRatingProps {
	label: string;
	value?: string;
	onChange: (value: string) => void;
	name: string;
}

export const EnergyRatingSelector = ({
	label,
	value,
	onChange,
	name,
}: EnergyRatingProps) => {
	const options = [
		{ value: 'A', color: 'bg-green-500' },
		{ value: 'B', color: 'bg-green-400' },
		{ value: 'C', color: 'bg-yellow-500' },
		{ value: 'D', color: 'bg-yellow-600' },
		{ value: 'E', color: 'bg-orange-500' },
		{ value: 'F', color: 'bg-red-500' },
		{ value: 'G', color: 'bg-red-600' },
		{ value: 'Non soumis au DPE', color: 'bg-gray-400' },
	];

	return (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
			</label>
			<div className="flex flex-wrap gap-2">
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => onChange(option.value)}
						className={`px-3 py-2 rounded-md text-white font-medium transition-all duration-200 ${
							option.color
						} ${
							value === option.value
								? 'ring-2 ring-offset-2 ring-brand-600 transform scale-105'
								: 'hover:opacity-80'
						}`}
					>
						{option.value === 'Non soumis au DPE'
							? 'Non soumis'
							: option.value}
					</button>
				))}
			</div>
			<input type="hidden" name={name} value={value || ''} />
		</div>
	);
};
