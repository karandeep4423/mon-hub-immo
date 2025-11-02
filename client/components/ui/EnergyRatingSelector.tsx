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
				{options.map((option) => {
					const isSelected = value === option.value;
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => onChange(option.value)}
							className={`relative px-3 py-2 rounded-md font-medium transition-smooth ${
								option.color
							} ${
								isSelected
									? 'ring-4 ring-brand-600 ring-opacity-50 shadow-lg text-white border-2 border-white'
									: 'text-white opacity-70 hover:opacity-100 hover:shadow-md'
							}`}
						>
							{option.value === 'Non soumis au DPE'
								? 'Non soumis'
								: option.value}
							{isSelected && (
								<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
									<svg
										className="h-3 w-3 text-brand-600"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</span>
							)}
						</button>
					);
				})}
			</div>
			{value && (
				<p className="mt-2 text-sm text-gray-600">
					Sélectionné:{' '}
					<span className="font-semibold text-gray-900">
						{value === 'Non soumis au DPE'
							? 'Non soumis au DPE'
							: value}
					</span>
				</p>
			)}
			<input type="hidden" name={name} value={value || ''} />
		</div>
	);
};
