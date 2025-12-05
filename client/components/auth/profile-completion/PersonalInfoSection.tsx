import React from 'react';
import { Input, ProfileImageUploader } from '@/components/ui';
import { Features } from '@/lib/constants';
import { ProfileCompletionFormData } from './types';

interface PersonalInfoSectionProps {
	values: ProfileCompletionFormData;
	errors: Record<string, string>;
	isSubmitting: boolean;
	handleChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onImageUploaded: (imageUrl: string) => void;
	onImageRemove: () => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
	values,
	errors,
	isSubmitting,
	handleChange,
	onImageUploaded,
	onImageRemove,
}) => {
	return (
		<div>
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Informations personnelles
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<Input
					label="Prénom *"
					name="firstName"
					value={values.firstName}
					onChange={handleChange}
					error={errors.firstName}
				/>

				<div className="md:col-start-2 flex items-center justify-center">
					<ProfileImageUploader
						currentImageUrl={values.profileImage}
						onImageUploaded={onImageUploaded}
						onRemove={onImageRemove}
						disabled={isSubmitting}
						size="medium"
						uploadingText="Uploading profile image..."
					/>
				</div>

				<Input
					label="Nom *"
					name="lastName"
					value={values.lastName}
					onChange={handleChange}
					error={errors.lastName}
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label="Email *"
					name="email"
					value={values.email}
					onChange={handleChange}
					error={errors.email}
					disabled
				/>

				<Input
					label="Téléphone pro *"
					name="phone"
					value={values.phone}
					onChange={handleChange}
					error={errors.phone}
					placeholder={Features.Auth.AUTH_PLACEHOLDERS.PHONE}
				/>
			</div>
		</div>
	);
};
