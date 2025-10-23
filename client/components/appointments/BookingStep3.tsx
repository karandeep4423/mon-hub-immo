import React from 'react';

interface ContactDetails {
	name: string;
	email: string;
	phone: string;
}

interface PropertyDetails {
	address?: string;
	[key: string]: unknown;
}

interface BookingStep3Props {
	contactDetails: ContactDetails;
	propertyDetails: PropertyDetails;
	notes: string;
	onContactChange: (field: keyof ContactDetails, value: string) => void;
	onPropertyAddressChange: (address: string) => void;
	onNotesChange: (notes: string) => void;
}

export const BookingStep3: React.FC<BookingStep3Props> = ({
	contactDetails,
	propertyDetails,
	notes,
	onContactChange,
	onPropertyAddressChange,
	onNotesChange,
}) => {
	return (
		<div className="space-y-5 animate-fadeIn">
			<div>
				<label className="block text-sm font-semibold text-gray-800 mb-2.5">
					<div className="flex items-center">
						<svg
							className="w-4 h-4 mr-1.5 text-brand"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
						Vos coordonnées
					</div>
				</label>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1.5">
						Nom complet *
					</label>
					<input
						type="text"
						required
						value={contactDetails.name}
						onChange={(e) =>
							onContactChange('name', e.target.value)
						}
						className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
					/>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1.5">
						Téléphone *
					</label>
					<input
						type="tel"
						required
						value={contactDetails.phone}
						onChange={(e) =>
							onContactChange('phone', e.target.value)
						}
						className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
					/>
				</div>
			</div>

			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1.5">
					Email *
				</label>
				<input
					type="email"
					required
					value={contactDetails.email}
					onChange={(e) => onContactChange('email', e.target.value)}
					className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
				/>
			</div>

			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1.5">
					Adresse du bien (optionnel)
				</label>
				<input
					type="text"
					value={propertyDetails?.address || ''}
					onChange={(e) => onPropertyAddressChange(e.target.value)}
					placeholder="Ex: 123 rue de la Paix, Paris"
					className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
				/>
			</div>

			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1.5">
					Message (optionnel)
				</label>
				<textarea
					value={notes || ''}
					onChange={(e) => onNotesChange(e.target.value)}
					rows={3}
					placeholder="Décrivez votre projet ou vos questions..."
					className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm resize-none"
				/>
			</div>
		</div>
	);
};
