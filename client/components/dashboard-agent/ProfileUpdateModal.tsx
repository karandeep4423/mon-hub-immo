'use client';

import React from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProfileImageUploader } from '../ui/ProfileImageUploader';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authApi';
import { User } from '@/types/auth';
import { useForm } from '@/hooks/useForm';
import { handleFormSubmitError } from '@/lib/utils/formErrors';

interface ProfileUpdateModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: User;
}

interface ProfileFormData extends Record<string, unknown> {
	firstName: string;
	lastName: string;
	phone: string;
	profileImage: string;
}

export const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
	isOpen,
	onClose,
	user,
}) => {
	const { updateUser } = useAuth();

	const {
		values: formData,
		errors,
		isSubmitting,
		setFieldValue,
		setErrors,
		resetForm,
		handleSubmit,
	} = useForm<ProfileFormData>({
		initialValues: {
			firstName: user.firstName,
			lastName: user.lastName,
			phone: user.phone || '',
			profileImage: user.profileImage || '',
		},
		onSubmit: async (values) => {
			// Validation
			const newErrors: Record<string, string> = {};

			if (!values.firstName.trim()) {
				newErrors.firstName = 'First name is required';
			} else if (values.firstName.trim().length < 2) {
				newErrors.firstName =
					'First name must be at least 2 characters';
			}

			if (!values.lastName.trim()) {
				newErrors.lastName = 'Last name is required';
			} else if (values.lastName.trim().length < 2) {
				newErrors.lastName = 'Last name must be at least 2 characters';
			}

			if (values.profileImage && !isValidUrl(values.profileImage)) {
				newErrors.profileImage = 'Please enter a valid image URL';
			}

			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors);
				return;
			}

			// Only send changed fields
			const changedFields: Partial<ProfileFormData> = {};
			if (values.firstName !== user.firstName)
				changedFields.firstName = values.firstName.trim();
			if (values.lastName !== user.lastName)
				changedFields.lastName = values.lastName.trim();
			if (values.phone !== (user.phone || ''))
				changedFields.phone = values.phone.trim();
			if (values.profileImage !== (user.profileImage || ''))
				changedFields.profileImage = values.profileImage.trim();

			if (Object.keys(changedFields).length === 0) {
				toast.info('No changes detected');
				onClose();
				return;
			}

			try {
				const response = await authService.updateProfile(changedFields);

				if (response.success && response.user) {
					updateUser(response.user);
					toast.success(
						response.message || 'Profile updated successfully',
					);
					onClose();
				} else {
					toast.error(response.message || 'Failed to update profile');
				}
			} catch (error) {
				handleFormSubmitError(error, setErrors, 'ProfileUpdateModal');
				throw error;
			}
		},
	});

	const handleImageUploaded = (imageUrl: string) => {
		setFieldValue('profileImage', imageUrl);
	};

	const handleImageRemove = () => {
		setFieldValue('profileImage', '');
	};

	const isValidUrl = (string: string) => {
		try {
			new URL(string);
			return true;
		} catch {
			return false;
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			resetForm();
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b">
					<h2 className="text-xl font-semibold text-gray-900">
						Update Profile
					</h2>
					<button
						onClick={handleClose}
						disabled={isSubmitting}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<Input
							label="First Name"
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={(e) =>
								setFieldValue('firstName', e.target.value)
							}
							error={errors.firstName}
							placeholder="John"
							required
							disabled={isSubmitting}
						/>
						<Input
							label="Last Name"
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={(e) =>
								setFieldValue('lastName', e.target.value)
							}
							error={errors.lastName}
							placeholder="Doe"
							required
							disabled={isSubmitting}
						/>
					</div>

					<Input
						label="Phone Number"
						type="tel"
						name="phone"
						value={formData.phone}
						onChange={(e) => setFieldValue('phone', e.target.value)}
						error={errors.phone}
						placeholder="+1234567890"
						disabled={isSubmitting}
					/>

					<ProfileImageUploader
						currentImageUrl={formData.profileImage}
						onImageUploaded={handleImageUploaded}
						onRemove={handleImageRemove}
						disabled={isSubmitting}
						size="medium"
						uploadingText="Uploading profile image..."
					/>

					{/* Show error if any */}
					{errors.profileImage && (
						<p className="text-sm text-red-600 mt-1">
							{errors.profileImage}
						</p>
					)}

					{/* Read-only fields */}
					<div className="bg-gray-50 rounded-lg p-4 space-y-3">
						<h4 className="text-sm font-medium text-gray-700">
							Account Information (Read Only)
						</h4>
						<div className="grid grid-cols-1 gap-3 text-sm">
							<div>
								<span className="font-medium text-gray-600">
									Email:
								</span>
								<span className="ml-2 text-gray-900">
									{user.email}
								</span>
							</div>
							<div>
								<span className="font-medium text-gray-600">
									Account Type:
								</span>
								<span className="ml-2 text-gray-900 capitalize">
									{user.userType}
								</span>
							</div>
							<div>
								<span className="font-medium text-gray-600">
									Email Status:
								</span>
								<span
									className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
										user.isEmailVerified
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
									}`}
								>
									{user.isEmailVerified
										? 'Verified'
										: 'Not Verified'}
								</span>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex space-x-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							loading={isSubmitting}
							className="flex-1"
						>
							Save Changes
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};
