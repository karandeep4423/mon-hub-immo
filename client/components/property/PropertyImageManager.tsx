import React, { useState } from 'react';
import { ImageUploader } from '../ui/ImageUploader';
import Image from 'next/image';
import { Components } from '@/lib/constants';

interface ImageFile {
	file: File;
	preview: string;
	id: string;
}

interface PropertyImageManagerProps {
	onMainImageChange?: (images: ImageFile[]) => void;
	onGalleryImagesChange?: (images: ImageFile[]) => void;
	existingMainImage?: { url: string; key: string } | null;
	existingGalleryImages?: Array<{ url: string; key: string }>;
	onExistingMainImageRemove?: () => void;
	onExistingGalleryImageRemove?: (imageKey: string) => void;
	className?: string;
	disabled?: boolean;
}

export const PropertyImageManager: React.FC<PropertyImageManagerProps> = ({
	onMainImageChange,
	onGalleryImagesChange,
	existingMainImage,
	existingGalleryImages = [],
	onExistingMainImageRemove,
	onExistingGalleryImageRemove,
	className = '',
	disabled = false,
}) => {
	const [mainImage, setMainImage] = useState<ImageFile[]>([]);
	const [galleryImages, setGalleryImages] = useState<ImageFile[]>([]);

	const handleMainImageChange = (images: ImageFile[]) => {
		setMainImage(images);
		onMainImageChange?.(images);
	};

	const handleGalleryImagesChange = (images: ImageFile[]) => {
		setGalleryImages(images);
		onGalleryImagesChange?.(images);
	};

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Main Image Section */}
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-3">
					Image principale *
				</h3>

				{/* Existing Main Image */}
				{existingMainImage && (
					<div className="mb-4">
						<h4 className="text-sm font-medium text-gray-700 mb-2">
							Image actuelle:
						</h4>
						<div className="relative inline-block w-32 h-32">
							<Image
								src={existingMainImage.url}
								alt={
									Components.UI.IMAGE_ALT_TEXT
										.mainPropertyImage
								}
								width={128}
								height={128}
								className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
							/>
							<button
								type="button"
								onClick={onExistingMainImageRemove}
								className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
								disabled={disabled}
							>
								×
							</button>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							Cliquez sur le × pour supprimer et remplacer par une
							nouvelle image
						</p>
					</div>
				)}

				{/* New Main Image Upload */}
				{(!existingMainImage || mainImage.length > 0) && (
					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-2">
							{existingMainImage
								? 'Remplacer par:'
								: 'Ajouter une image:'}
						</h4>
						<ImageUploader
							onImagesChange={handleMainImageChange}
							maxImages={1}
							className="border-brand-600 border-2"
							disabled={disabled}
						/>
					</div>
				)}

				{mainImage.length === 0 && !existingMainImage && (
					<p className="text-sm text-gray-500 mt-2">
						Cette image sera affichée en premier sur votre annonce
					</p>
				)}
			</div>

			{/* Gallery Images Section */}
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-3">
					Images supplémentaires
					<span className="text-sm font-normal text-gray-500 ml-2">
						(optionnel)
					</span>
				</h3>

				{/* Existing Gallery Images */}
				{existingGalleryImages && existingGalleryImages.length > 0 && (
					<div className="mb-4">
						<h4 className="text-sm font-medium text-gray-700 mb-2">
							Images actuelles:
						</h4>
						<div className=" h-full object-cover   grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4  w-full">
							{existingGalleryImages.map((image, index) => (
								<div
									key={image.key || index}
									className="relative inline-block w-32 h-32"
								>
									<Image
										src={image.url}
										alt={`Image galerie ${index + 1}`}
										width={200}
										height={200}
										className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
									/>
									<button
										type="button"
										onClick={() =>
											onExistingGalleryImageRemove?.(
												image.key,
											)
										}
										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
										disabled={disabled}
									>
										×
									</button>
								</div>
							))}
						</div>
						<p className="text-xs text-gray-500 mt-2">
							Cliquez sur × pour supprimer une image de la galerie
						</p>
					</div>
				)}

				{/* New Gallery Images Upload */}
				<div>
					<h4 className="text-sm font-medium text-gray-700 mb-2">
						{existingGalleryImages &&
						existingGalleryImages.length > 0
							? "Ajouter plus d'images:"
							: 'Ajouter des images:'}
					</h4>
					<ImageUploader
						onImagesChange={handleGalleryImagesChange}
						maxImages={9}
						disabled={disabled}
					/>
				</div>

				{galleryImages.length === 0 &&
					(!existingGalleryImages ||
						existingGalleryImages.length === 0) && (
						<p className="text-sm text-gray-500 mt-2">
							Ajoutez jusqu&apos;à 9 images supplémentaires pour
							votre galerie
						</p>
					)}
			</div>

			{/* Progress Info */}
			{(mainImage.length > 0 ||
				galleryImages.length > 0 ||
				existingMainImage ||
				(existingGalleryImages &&
					existingGalleryImages.length > 0)) && (
				<div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
					<p>
						📸{' '}
						{existingMainImage
							? '1 image principale (actuelle)'
							: `${mainImage.length} image principale`}
						{existingGalleryImages &&
							existingGalleryImages.length > 0 &&
							` • ${existingGalleryImages.length} images actuelles`}
						{galleryImages.length > 0 &&
							` • ${galleryImages.length} nouvelles images`}
					</p>
					<p className="text-xs text-gray-500 mt-1">
						{mainImage.length > 0 || galleryImages.length > 0
							? 'Les nouvelles images seront uploadées lors de la sauvegarde'
							: 'Gérez vos images existantes ou ajoutez-en de nouvelles'}
					</p>
				</div>
			)}
		</div>
	);
};
