import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '@/lib/api/adminApi';
import { UserProfile, ProfessionalInfo } from '../types';

interface UseUserProfileFormReturn {
	form: UserProfile;
	setForm: React.Dispatch<React.SetStateAction<UserProfile>>;
	hasChanges: boolean;
	isSaving: boolean;
	handleChange: (field: keyof UserProfile, value: string | boolean) => void;
	handleProfessionalChange: (
		field: keyof ProfessionalInfo,
		value: string,
	) => void;
	handleSave: () => Promise<void>;
}

export function useUserProfileForm(
	user: UserProfile,
	onUpdate: (updatedUser: UserProfile) => void,
): UseUserProfileFormReturn {
	const [form, setForm] = useState<UserProfile>({
		...user,
		professionalInfo: user.professionalInfo || {},
	});
	const [hasChanges, setHasChanges] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const handleChange = useCallback(
		(field: keyof UserProfile, value: string | boolean) => {
			setForm((prev) => ({ ...prev, [field]: value }));
			setHasChanges(true);
		},
		[],
	);

	const handleProfessionalChange = useCallback(
		(field: keyof ProfessionalInfo, value: string) => {
			let processedValue: string | number | boolean | string[] = value;

			// Handle special field types
			if (field === 'yearsExperience' || field === 'interventionRadius') {
				processedValue = value === '' ? 0 : Number(value);
			} else if (
				field === 'collaborateWithAgents' ||
				field === 'shareCommission' ||
				field === 'independentAgent' ||
				field === 'alertsEnabled'
			) {
				processedValue = value === 'true';
			} else if (field === 'mandateTypes') {
				processedValue = value
					? (value.split(',').filter(Boolean) as (
							| 'simple'
							| 'exclusif'
							| 'co-mandat'
						)[])
					: [];
			} else if (field === 'coveredCities') {
				processedValue = value
					? value
							.split(',')
							.map((c) => c.trim())
							.filter(Boolean)
					: [];
			}

			setForm((prev) => ({
				...prev,
				professionalInfo: {
					...(prev.professionalInfo || {}),
					[field]: processedValue,
				},
			}));
			setHasChanges(true);
		},
		[],
	);

	const handleSave = useCallback(async () => {
		setIsSaving(true);
		try {
			const payload = {
				firstName: form.firstName,
				lastName: form.lastName,
				email: form.email,
				phone: form.phone || undefined,
				userType: form.type || form.userType,
				type: form.type || form.userType,
				professionalInfo: form.professionalInfo || undefined,
			};

			await adminService.updateUser(user._id, payload);
			toast.success('Profil mis à jour avec succès');
			setHasChanges(false);
			onUpdate({ ...user, ...form });
		} catch (err) {
			console.error(err);
			toast.error('Erreur lors de la mise à jour du profil');
		} finally {
			setIsSaving(false);
		}
	}, [form, user, onUpdate]);

	return {
		form,
		setForm,
		hasChanges,
		isSaving,
		handleChange,
		handleProfessionalChange,
		handleSave,
	};
}
