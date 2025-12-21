import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { useDropzone, FileRejection } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Components } from '@/lib/constants';
import { GripVertical } from 'lucide-react';

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

// Compression options - convert to JPEG and compress for direct S3 upload
const COMPRESSION_OPTIONS: Parameters<typeof imageCompression>[1] = {
	maxSizeMB: 0.2, // 200KB max (presigned URL allows 5MB)
	maxWidthOrHeight: 1920, // Full HD resolution
	useWebWorker: true, // Use web worker for better performance
	initialQuality: 0.25, // 25% quality - good balance
	fileType: 'image/webp', // Always convert to JPEG for S3
	preserveExif: false, // Strip metadata for smaller files
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
	onImagesChange,
	maxImages = 10,
	maxSize = 25 * 1024 * 1024, // 25MB - client compression will reduce to ~1MB
	accept = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
	className = '',
	disabled = false,
}) => {
	const [images, setImages] = useState<ImageFile[]>([]);
	const [uploadError, setUploadError] = useState<string>('');
	const [isCompressing, setIsCompressing] = useState(false);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	// Drag and drop reordering handlers
	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', index.toString());
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		if (draggedIndex !== index) {
			setDragOverIndex(index);
		}
	};

	const handleDragLeave = () => {
		setDragOverIndex(null);
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === dropIndex) {
			setDraggedIndex(null);
			setDragOverIndex(null);
			return;
		}

		const newImages = [...images];
		const [draggedImage] = newImages.splice(draggedIndex, 1);
		newImages.splice(dropIndex, 0, draggedImage);

		setImages(newImages);
		onImagesChange(newImages);
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const onDrop = useCallback(
		async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
			setUploadError('');

			if (rejectedFiles.length > 0) {
				const error = rejectedFiles[0].errors[0];
				if (error.code === 'file-too-large') {
					setUploadError(
						Components.UI.IMAGE_UPLOADER_MESSAGES.fileTooLargeWithSize(
							Math.round(maxSize / 1024 / 1024),
						),
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

			// Compress and convert images to JPEG for S3 upload
			setIsCompressing(true);
			try {
				const compressedImages = await Promise.all(
					acceptedFiles.map(async (file) => {
						const compressedFile = await imageCompression(
							file,
							COMPRESSION_OPTIONS,
						);

						// Rename file to .jpg extension
						const jpegFileName = file.name.replace(
							/\.[^.]+$/,
							'.jpg',
						);
						const jpegFile = new File(
							[compressedFile],
							jpegFileName,
							{
								type: 'image/jpeg',
							},
						);

						return {
							file: jpegFile,
							preview: URL.createObjectURL(jpegFile),
							id: Math.random().toString(36).substr(2, 9),
						};
					}),
				);

				const updatedImages = [...images, ...compressedImages];
				setImages(updatedImages);
				onImagesChange(updatedImages);
			} catch {
				setUploadError('Erreur lors de la compression des images');
			} finally {
				setIsCompressing(false);
			}
		},
		[images, maxImages, maxSize, onImagesChange],
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
		disabled: disabled || isCompressing,
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
					${disabled || isCompressing ? 'opacity-50 cursor-not-allowed' : ''}
				`}
			>
				<input {...getInputProps()} />
				<div className="flex flex-col items-center space-y-2">
					{isCompressing ? (
						<>
							<svg
								className="w-12 h-12 text-brand-600 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							<p className="text-lg font-medium text-gray-700">
								Téléchargement en cours...
							</p>
						</>
					) : (
						<>
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
						</>
					)}
				</div>
			</div>

			{/* Error Message */}
			{uploadError && (
				<div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
					{uploadError}
				</div>
			)}

			{/* Image Previews - Drag to reorder */}
			{images.length > 0 && (
				<>
					<p className="text-xs text-gray-500 flex items-center gap-1">
						<GripVertical className="w-3 h-3" />
						Glissez les images pour les réorganiser. La première
						image sera l&apos;image principale.
					</p>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{images.map((image, index) => (
							<div
								key={image.id}
								draggable
								onDragStart={(e) => handleDragStart(e, index)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDragLeave={handleDragLeave}
								onDrop={(e) => handleDrop(e, index)}
								onDragEnd={handleDragEnd}
								className={`relative group cursor-grab active:cursor-grabbing transition-all duration-200 ${
									draggedIndex === index
										? 'opacity-50 scale-95'
										: ''
								} ${
									dragOverIndex === index
										? 'ring-2 ring-brand-500 ring-offset-2'
										: ''
								}`}
							>
								<div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
									<Image
										src={image.preview}
										alt={
											Components.UI.IMAGE_ALT_TEXT.preview
										}
										fill
										className="object-cover pointer-events-none"
										unoptimized
									/>
									{/* Main image badge */}
									{index === 0 && (
										<div className="absolute top-1 left-1 bg-brand-600 text-white text-xs px-2 py-0.5 rounded">
											Principale
										</div>
									)}
									{/* Drag handle */}
									<div className="absolute top-1 right-8 bg-white/80 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
										<GripVertical className="w-4 h-4 text-gray-600" />
									</div>
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
				</>
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
