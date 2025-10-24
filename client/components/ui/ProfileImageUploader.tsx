import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { LoadingSpinner } from './LoadingSpinner';
import Image from 'next/image';
import { api } from '@/lib/api';
import { logger } from '@/lib/utils/logger';
import { useMutation } from '@/hooks/useMutation';

interface ImageFile {
	file: File;
	preview: string;
	id: string;
}

interface ProfileImageUploaderProps {
	currentImageUrl?: string;
	onImageUploaded: (imageUrl: string) => void;
	className?: string;
	disabled?: boolean;
	size?: 'small' | 'medium' | 'large';
	showRemove?: boolean;
	onRemove?: () => void;
	uploadingText?: string;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
	currentImageUrl,
	onImageUploaded,
	className = '',
	disabled = false,
	size = 'medium',
	showRemove = true,
	onRemove,
	uploadingText = 'Uploading...',
}) => {
	const [uploadError, setUploadError] = useState<string>('');

	// Upload mutation
	const { mutate: uploadImage, loading: isUploading } = useMutation<
		string,
		File
	>(
		async (file: File) => {
			// First, delete the old image if it exists
			if (currentImageUrl) {
				logger.debug(
					'[ProfileImageUploader] Deleting old image',
					currentImageUrl,
				);
				const oldImageKey = extractS3KeyFromUrl(currentImageUrl);
				logger.debug(
					'[ProfileImageUploader] Extracted S3 key for deletion',
					oldImageKey,
				);

				if (oldImageKey) {
					try {
						logger.debug(
							'[ProfileImageUploader] Attempting S3 deletion',
							oldImageKey,
						);
						const deleteResponse = await api.delete(
							'/upload/delete',
							{
								data: { keys: [oldImageKey] },
							},
						);
						logger.debug(
							'[ProfileImageUploader] S3 deletion success',
							deleteResponse.data,
						);
					} catch (deleteError) {
						logger.error(
							'[ProfileImageUploader] Failed to delete old image',
							deleteError,
						);
						// Continue with upload even if delete fails
					}
				} else {
					logger.warn(
						'Could not extract S3 key from URL:',
						currentImageUrl,
					);
				}
			}

			// Upload the new image
			const formData = new FormData();
			formData.append('image', file);

			const response = await api.post('/upload/single', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (response.data.success && response.data.data) {
				return response.data.data.url;
			} else {
				throw new Error(response.data.message || 'Upload failed');
			}
		},
		{
			onSuccess: (imageUrl) => {
				onImageUploaded(imageUrl);
				setUploadError('');
			},
			onError: (error) => {
				setUploadError(error.message);
			},
			successMessage: 'Image téléchargée avec succès',
			errorMessage: "Échec du téléchargement de l'image",
			context: 'ProfileImageUploader',
		},
	);

	// Extract S3 key from URL
	const extractS3KeyFromUrl = (url: string): string | null => {
		try {
			const urlObj = new URL(url);
			let pathname = urlObj.pathname;

			// Remove leading slash
			if (pathname.startsWith('/')) {
				pathname = pathname.substring(1);
			}

			// Handle different S3 URL formats:
			// 1. s3.amazonaws.com/bucket/key
			// 2. bucket.s3.amazonaws.com/key
			// 3. CloudFront URLs with key in path

			logger.debug('[ProfileImageUploader] Extracting S3 key', {
				url,
				pathname,
			});

			return pathname || null;
		} catch (error) {
			logger.error('[ProfileImageUploader] Failed to extract S3 key', {
				url,
				error,
			});
			return null;
		}
	};

	const sizeClasses = {
		small: 'w-16 h-16',
		medium: 'w-20 h-20',
		large: 'w-32 h-32',
	};

	const handleImageSelection = (images: ImageFile[]) => {
		setUploadError('');

		if (images.length > 0) {
			uploadImage(images[0].file);
		}
	};

	const handleRemoveImage = () => {
		if (onRemove) {
			onRemove();
		}
	};

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Current Image Display */}
			{currentImageUrl && (
				<div className="flex flex-col items-center space-y-2">
					<div className="text-center">
						<p className="text-sm font-medium text-gray-700 mb-2">
							Current Profile Image:
						</p>
						<div
							className={`${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden relative mx-auto`}
						>
							<Image
								src={currentImageUrl}
								alt="Current profile"
								width={
									size === 'small'
										? 64
										: size === 'medium'
											? 80
											: 128
								}
								height={
									size === 'small'
										? 64
										: size === 'medium'
											? 80
											: 128
								}
								className="w-full h-full object-cover"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
								}}
							/>
							{showRemove && (
								<button
									type="button"
									onClick={handleRemoveImage}
									disabled={disabled || isUploading}
									className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
								>
									×
								</button>
							)}
						</div>
					</div>
				</div>
			)}
			{/* Upload Status */}
			{isUploading && (
				<div className="text-center">
					<LoadingSpinner size="sm" message={uploadingText} />
				</div>
			)}
			{/* Upload Error */}
			{uploadError && (
				<div className="text-center">
					<p className="text-sm text-red-600">{uploadError}</p>
				</div>
			)}
			{/* Image Uploader */}
			{!isUploading && (
				<div>
					<p className="text-sm font-medium text-gray-700 mb-2">
						{currentImageUrl
							? 'Upload New Image:'
							: 'Upload Profile Image:'}
					</p>
					<ImageUploader
						onImagesChange={handleImageSelection}
						maxImages={1}
						className="border-cyan-600 border-2"
						disabled={disabled || isUploading}
					/>
				</div>
			)}{' '}
			{/* Help Text */}
			<div className="text-xs text-gray-500 text-center">
				<p>Supported formats: JPG, PNG, WebP</p>
				<p>Maximum size: 5MB</p>
			</div>
		</div>
	);
};
