import React from 'react';
import { RichTextEditor, Checkbox } from '@/components/ui';
import { Features } from '@/lib/constants';
import { ProfileCompletionFormData } from './types';
import { authToastError } from '@/lib/utils/authToast';

interface PreferencesAndTermsSectionProps {
	values: ProfileCompletionFormData;
	errors: Record<string, string>;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	setFieldValue: (name: string, value: unknown) => void;
}

export const PreferencesAndTermsSection: React.FC<
	PreferencesAndTermsSectionProps
> = ({ values, errors, handleChange, setFieldValue }) => {
	const handlePitchChange = (value: string) => {
		const textContent = value.replace(/<[^>]*>/g, '').trim();
		if (textContent.length > 1000) {
			setFieldValue('personalPitch', value);
			authToastError('La bio ne peut pas dépasser 1000 caractères');
			return;
		}
		handleChange({
			target: { name: 'personalPitch', value },
		} as React.ChangeEvent<HTMLInputElement>);
	};

	return (
		<>
			{/* Personal Pitch */}
			<RichTextEditor
				label="Petite bio (pitch personnel)"
				value={values.personalPitch}
				onChange={handlePitchChange}
				placeholder={Features.Auth.AUTH_PLACEHOLDERS.BIO}
				minHeight="120px"
				showCharCount
				maxLength={1000}
			/>

			{/* Collaboration preferences */}
			<div className="mt-4 space-y-3">
				<Checkbox
					label="Je souhaite collaborer avec d'autres agents"
					name="collaborateWithAgents"
					checked={values.collaborateWithAgents}
					onChange={handleChange}
				/>

				<Checkbox
					label="Je suis ouvert à partager ma commission"
					name="shareCommission"
					checked={values.shareCommission}
					onChange={handleChange}
				/>
			</div>

			{/* Alerts */}
			<div>
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-gray-900">
						Alertes : nouveaux biens, clients apports
					</h3>
				</div>

				<div className="mt-4 space-y-3">
					<Checkbox
						label="Je certifie être un agent immobilier indépendant ou mandataire non sédentaire"
						name="independentAgent"
						checked={values.independentAgent}
						onChange={handleChange}
					/>

					<Checkbox
						label="J'accepte les conditions d'utilisation"
						name="acceptTerms"
						checked={values.acceptTerms}
						onChange={handleChange}
						labelClassName="text-sm text-brand"
					/>
					{errors.acceptTerms && (
						<p className="text-sm text-red-600">
							{errors.acceptTerms}
						</p>
					)}
				</div>
			</div>
		</>
	);
};
