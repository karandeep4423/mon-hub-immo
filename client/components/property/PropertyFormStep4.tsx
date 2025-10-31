'use client';

import React from 'react';
import { PropertyImageManager } from './PropertyImageManager';
import BadgeSelector from './BadgeSelector';
import { PropertyFormData } from '@/lib/api/propertyApi';

interface ImageFile {
	file: File;
	preview: string;
	id: string;
}

interface ExistingImage {
	url: string;
	key: string;
}

interface PropertyFormStep4Props {
	formData: PropertyFormData;
	errors: Record<string, string>;
	handleInputChange: (
		field: keyof PropertyFormData,
		value: string | string[],
	) => void;
	mainImageFiles: ImageFile[];
	setMainImageFiles: (files: ImageFile[]) => void;
	galleryImageFiles: ImageFile[];
	setGalleryImageFiles: (files: ImageFile[]) => void;
	existingMainImage: ExistingImage | null;
	existingGalleryImages: ExistingImage[];
	handleExistingMainImageRemove: () => void;
	handleExistingGalleryImageRemove: (imageKey: string) => void;
	isUploading: boolean;
}

export const PropertyFormStep4: React.FC<PropertyFormStep4Props> = ({
	formData,
	errors,
	handleInputChange,
	setMainImageFiles,
	setGalleryImageFiles,
	existingMainImage,
	existingGalleryImages,
	handleExistingMainImageRemove,
	handleExistingGalleryImageRemove,
	isUploading,
}) => {
	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4">
				Images et finalisation
			</h3>

			<PropertyImageManager
				onMainImageChange={setMainImageFiles}
				onGalleryImagesChange={setGalleryImageFiles}
				existingMainImage={existingMainImage}
				existingGalleryImages={existingGalleryImages}
				onExistingMainImageRemove={handleExistingMainImageRemove}
				onExistingGalleryImageRemove={handleExistingGalleryImageRemove}
				disabled={isUploading}
			/>

			{errors.mainImage && (
				<p className="text-red-500 text-sm">{errors.mainImage}</p>
			)}

			<BadgeSelector
				selectedBadges={formData.badges || []}
				onChange={(badges) => handleInputChange('badges', badges)}
				disabled={isUploading}
			/>

			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Statut de publication
				</label>
				<select
					value={formData.status}
					onChange={(e) =>
						handleInputChange(
							'status',
							e.target.value as PropertyFormData['status'],
						)
					}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
					disabled={isUploading}
				>
					<option value="draft">Brouillon</option>
					<option value="active">Publier immédiatement</option>
					<option value="sold">Vendu</option>
					<option value="rented">Loué</option>
					<option value="archived">Archivé</option>
				</select>
			</div>

			{errors.submit && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{errors.submit}
				</div>
			)}
		</div>
	);
};
