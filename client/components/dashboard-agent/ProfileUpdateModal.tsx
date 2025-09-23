'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ProfileImageUploader } from '../ui/ProfileImageUploader';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authApi';
import { User } from '@/types/auth';

interface ProfileUpdateModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: User;
}

export const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
	isOpen,
	onClose,
	user,
}) => {
	const { updateUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		firstName: user.firstName,
		lastName: user.lastName,
		phone: user.phone || '',
		profileImage: user.profileImage || '',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: '',
			}));
		}
	};

	const handleImageUploaded = (imageUrl: string) => {
		setFormData((prev) => ({
			...prev,
			profileImage: imageUrl,
		}));
		// Clear error when image is uploaded
		if (errors.profileImage) {
			setErrors((prev) => ({
				...prev,
				profileImage: '',
			}));
		}
	};

	const handleImageRemove = () => {
		setFormData((prev) => ({
			...prev,
			profileImage: '',
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		// Basic validation
		const newErrors: Record<string, string> = {};

		if (!formData.firstName.trim()) {
			newErrors.firstName = 'First name is required';
		} else if (formData.firstName.trim().length < 2) {
			newErrors.firstName = 'First name must be at least 2 characters';
		}

		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Last name is required';
		} else if (formData.lastName.trim().length < 2) {
			newErrors.lastName = 'Last name must be at least 2 characters';
		}

		if (formData.profileImage && !isValidUrl(formData.profileImage)) {
			newErrors.profileImage = 'Please enter a valid image URL';
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			setLoading(true);

			// Only send changed fields
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const changedFields: any = {};
			if (formData.firstName !== user.firstName)
				changedFields.firstName = formData.firstName.trim();
			if (formData.lastName !== user.lastName)
				changedFields.lastName = formData.lastName.trim();
			if (formData.phone !== (user.phone || ''))
				changedFields.phone = formData.phone.trim();
			if (formData.profileImage !== (user.profileImage || ''))
				changedFields.profileImage = formData.profileImage.trim();

			if (Object.keys(changedFields).length === 0) {
				toast.info('No changes detected');
				onClose();
				return;
			}

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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.response?.data?.errors) {
				const validationErrors: Record<string, string> = {};
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				error.response.data.errors.forEach((err: any) => {
					validationErrors[err.path || err.param] =
						err.msg || err.message;
				});
				setErrors(validationErrors);
			} else {
				toast.error(
					error.response?.data?.message || 'Something went wrong',
				);
			}
		} finally {
			setLoading(false);
		}
	};

	const isValidUrl = (string: string) => {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	};

	const handleClose = () => {
		if (!loading) {
			setFormData({
				firstName: user.firstName,
				lastName: user.lastName,
				phone: user.phone || '',
				profileImage: user.profileImage || '',
			});
			setErrors({});
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
						disabled={loading}
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
							onChange={handleChange}
							error={errors.firstName}
							placeholder="John"
							required
							disabled={loading}
						/>
						<Input
							label="Last Name"
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
							error={errors.lastName}
							placeholder="Doe"
							required
							disabled={loading}
						/>
					</div>

					<Input
						label="Phone Number"
						type="tel"
						name="phone"
						value={formData.phone}
						onChange={handleChange}
						error={errors.phone}
						placeholder="+1234567890"
						disabled={loading}
					/>

					<ProfileImageUploader
						currentImageUrl={formData.profileImage}
						onImageUploaded={handleImageUploaded}
						onRemove={handleImageRemove}
						disabled={loading}
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
							disabled={loading}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							loading={loading}
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
