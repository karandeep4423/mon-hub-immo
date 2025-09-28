'use client';

interface PropertyTypeOption {
	value: string;
	label: string;
	icon: string;
}

interface PropertyTypeSelectorProps {
	value?: string;
	onChange: (value: string) => void;
	name: string;
}

export const PropertyTypeSelector = ({
	value,
	onChange,
	name,
}: PropertyTypeSelectorProps) => {
	const propertyTypes: PropertyTypeOption[] = [
		{ value: 'Maison', label: 'Maison', icon: '🏠' },
		{ value: 'Appartement', label: 'Appartement', icon: '🏢' },
		{ value: 'Terrain', label: 'Terrain', icon: '🌿' },
		{ value: 'Local commercial', label: 'Parking', icon: '🅿️' },
		{ value: 'Bureaux', label: 'Autre', icon: '🏢' },
	];

	return (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-3">
				Choisissez votre type de bien *
			</label>
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
				{propertyTypes.map((type) => (
					<button
						key={type.value}
						type="button"
						onClick={() => onChange(type.value)}
						className={`p-4 border-2 rounded-lg text-center transition-all duration-200 hover:shadow-md ${
							value === type.value
								? 'border-brand-600 bg-brand-50 ring-2 ring-brand-200'
								: 'border-gray-200 hover:border-gray-300'
						}`}
					>
						<div className="text-2xl mb-2">{type.icon}</div>
						<div className="text-sm font-medium text-gray-900">
							{type.label}
						</div>
						{value === type.value && (
							<div className="mt-2">
								<div className="inline-block w-2 h-2 bg-brand-600 rounded-full"></div>
							</div>
						)}
					</button>
				))}
			</div>
			<input type="hidden" name={name} value={value || ''} />
		</div>
	);
};
