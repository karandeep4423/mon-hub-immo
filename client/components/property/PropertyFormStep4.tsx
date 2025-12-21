'use client';

import React from 'react';
import { PropertyImageManager } from './PropertyImageManager';
import BadgeSelector from './BadgeSelector';
import { PropertyFormData } from '@/lib/api/propertyApi';
import { ImageIcon, Award, FileCheck } from 'lucide-react';
import { Select } from '@/components/ui/CustomSelect';

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
	handleExistingGalleryImagesReorder?: (images: ExistingImage[]) => void;
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
	handleExistingGalleryImagesReorder,
	isUploading,
}) => {
	return (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
				<ImageIcon className="w-5 h-5 text-violet-600" />
				Images et finalisation
			</h3>
			<PropertyImageManager
				onMainImageChange={setMainImageFiles}
				onGalleryImagesChange={setGalleryImageFiles}
				existingMainImage={existingMainImage}
				existingGalleryImages={existingGalleryImages}
				onExistingMainImageRemove={handleExistingMainImageRemove}
				onExistingGalleryImageRemove={handleExistingGalleryImageRemove}
				onExistingGalleryImagesReorder={
					handleExistingGalleryImagesReorder
				}
				disabled={isUploading}
			/>
			{errors.mainImage && (
				<p className="text-red-500 text-sm">{errors.mainImage}</p>
			)}
			<div className="flex items-start gap-2">
				<Award className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
				<div className="flex-1">
					<BadgeSelector
						selectedBadges={formData.badges || []}
						onChange={(badges) =>
							handleInputChange('badges', badges)
						}
						disabled={isUploading}
					/>
				</div>
			</div>
			<div>
				<label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
					<FileCheck className="w-4 h-4 text-teal-600" />
					Statut de publication
				</label>
				<Select
					value={formData.status}
					onChange={(value) =>
						handleInputChange(
							'status',
							value as PropertyFormData['status'],
						)
					}
					options={[
						{ value: 'draft', label: 'Brouillon' },
						{ value: 'active', label: 'Publier immédiatement' },
						{ value: 'sold', label: 'Vendu' },
						{ value: 'rented', label: 'Loué' },
						{ value: 'archived', label: 'Archivé' },
					]}
					disabled={isUploading}
				/>
			</div>{' '}
			{errors.submit && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					{errors.submit}
				</div>
			)}
		</div>
	);
};
