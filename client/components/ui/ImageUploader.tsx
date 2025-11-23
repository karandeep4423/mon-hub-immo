import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Components } from '@/lib/constants';

interface ImageFile {
	file: File;
	preview: string;
	id: string;
}

interface ImageUploaderProps {
	onImagesChange: (images: ImageFile[]) => void;
	maxImages?: number;
	maxSize?: number;
	accept?: string[];
	className?: string;
	disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
	onImagesChange,
	maxImages = 10,
	maxSize = 5 * 1024 * 1024, // 5MB
	accept = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
	className = '',
	disabled = false,
}) => {
	const [images, setImages] = useState<ImageFile[]>([]);
	const [uploadError, setUploadError] = useState<string>('');

	const onDrop = useCallback(
		(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
			setUploadError('');

			if (rejectedFiles.length > 0) {
				const error = rejectedFiles[0].errors[0];
				if (error.code === 'file-too-large') {
					setUploadError(
						Components.UI.IMAGE_UPLOADER_MESSAGES
							.fileTooLargeWithSize,
					);
				} else if (error.code === 'file-invalid-type') {
					setUploadError(
						Components.UI.IMAGE_UPLOADER_MESSAGES
							.fileTypeNotSupported,
					);
				} else {
					setUploadError(
						Components.UI.IMAGE_UPLOADER_MESSAGES
							.uploadGenericError,
					);
				}
				return;
			}

			if (images.length + acceptedFiles.length > maxImages) {
				setUploadError(
					Components.UI.IMAGE_UPLOADER_MESSAGES.maxImagesReached(
						maxImages,
					),
				);
				return;
			}

			const newImages = acceptedFiles.map((file) => ({
				file,
				preview: URL.createObjectURL(file),
				id: Math.random().toString(36).substr(2, 9),
			}));

			const updatedImages = [...images, ...newImages];
			setImages(updatedImages);
			onImagesChange(updatedImages);
		},
		[images, maxImages, onImagesChange],
	);

	const removeImage = (id: string) => {
		const updatedImages = images.filter((img) => img.id !== id);
		setImages(updatedImages);
		onImagesChange(updatedImages);
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: accept.reduce((acc, mime) => ({ ...acc, [mime]: [] }), {}),
		maxSize,
		disabled,
	});

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Drop Zone */}
			<div
				{...getRootProps()}
				className={`
					border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
					${
						isDragActive
							? 'border-brand-600 bg-brand-50'
							: 'border-gray-300 hover:border-brand-600'
					}
					${disabled ? 'opacity-50 cursor-not-allowed' : ''}
				`}
			>
				<input {...getInputProps()} />
				<div className="flex flex-col items-center space-y-2">
					<svg
						className="w-12 h-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
					<div>
						<p className="text-lg font-medium text-gray-700">
							{isDragActive
								? 'Déposez les images ici...'
								: 'Glissez vos images ici'}
						</p>
						<p className="text-sm text-gray-500">
							ou cliquez pour sélectionner
						</p>
						<p className="text-xs text-gray-400 mt-1">
							JPG, PNG, WebP (max{' '}
							{Math.round(maxSize / 1024 / 1024)}MB)
						</p>
					</div>
				</div>
			</div>

			{/* Error Message */}
			{uploadError && (
				<div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
					{uploadError}
				</div>
			)}

			{/* Image Previews */}
			{images.length > 0 && (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{images.map((image) => (
						<div key={image.id} className="relative group">
							<div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
								<Image
									src={image.preview}
									alt={Components.UI.IMAGE_ALT_TEXT.preview}
									fill
									className="object-cover"
									unoptimized
								/>
							</div>
							<button
								type="button"
								onClick={() => removeImage(image.id)}
								className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}

			{/* Image Count */}
			{images.length > 0 && (
				<p className="text-sm text-gray-500">
					{images.length}/{maxImages} images sélectionnées
				</p>
			)}
		</div>
	);
};
