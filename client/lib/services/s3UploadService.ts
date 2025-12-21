/**
 * S3 Direct Upload Service
 * Handles direct-to-S3 image uploads using presigned URLs
 */

import { api } from '../api';
import { logger } from '../utils/logger';
import { handleApiError } from '../utils/errorHandler';

// Types for presigned URL response
interface PresignedUrlData {
	uploadUrl: string;
	key: string;
	publicUrl: string;
}

interface PropertyUploadUrlsResponse {
	success: boolean;
	data: {
		propertyId: string;
		mainImage?: PresignedUrlData;
		galleryImages: PresignedUrlData[];
	};
}

// Type for uploaded image result
export interface UploadedImageData {
	key: string;
	url: string;
}

// Progress callback type
type ProgressCallback = (progress: number) => void;

/**
 * Get presigned URLs for property image uploads
 */
export async function getPropertyUploadUrls(params: {
	propertyId?: string;
	mainImage: boolean;
	galleryCount: number;
}): Promise<{
	propertyId: string;
	mainImage?: PresignedUrlData;
	galleryImages: PresignedUrlData[];
}> {
	try {
		const response = await api.post<PropertyUploadUrlsResponse>(
			'/upload/presigned-urls/property',
			params,
		);
		return response.data.data;
	} catch (error) {
		throw handleApiError(
			error,
			'S3UploadService.getPropertyUploadUrls',
			'Erreur lors de la préparation du téléchargement',
		);
	}
}

/**
 * Upload a single file directly to S3 using presigned URL
 */
export async function uploadToS3(
	file: Blob,
	presignedUrl: string,
	onProgress?: ProgressCallback,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener('progress', (event) => {
			if (event.lengthComputable && onProgress) {
				const progress = Math.round((event.loaded / event.total) * 100);
				onProgress(progress);
			}
		});

		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve();
			} else {
				reject(new Error(`Upload failed with status ${xhr.status}`));
			}
		});

		xhr.addEventListener('error', () => {
			reject(new Error('Network error during upload'));
		});

		xhr.addEventListener('abort', () => {
			reject(new Error('Upload aborted'));
		});

		xhr.open('PUT', presignedUrl);
		xhr.setRequestHeader('Content-Type', 'image/jpeg');
		xhr.send(file);
	});
}

/**
 * Upload multiple images to S3 with progress tracking
 * All images upload in parallel for maximum speed
 */
export async function uploadPropertyImages(params: {
	mainImageFile?: File;
	galleryImageFiles?: File[];
	propertyId?: string;
	onProgress?: (current: number, total: number, fileName: string) => void;
}): Promise<{
	propertyId: string;
	mainImage?: UploadedImageData;
	galleryImages: UploadedImageData[];
}> {
	const {
		mainImageFile,
		galleryImageFiles = [],
		propertyId,
		onProgress,
	} = params;

	const hasMain = !!mainImageFile;
	const galleryCount = galleryImageFiles.length;

	if (!hasMain && galleryCount === 0) {
		throw new Error('At least one image is required');
	}

	// Get presigned URLs
	const urls = await getPropertyUploadUrls({
		propertyId,
		mainImage: hasMain,
		galleryCount,
	});

	// Track completed uploads for progress
	let completedCount = 0;
	const totalFiles = (hasMain ? 1 : 0) + galleryCount;

	const reportProgress = (fileName: string) => {
		completedCount++;
		onProgress?.(completedCount, totalFiles, fileName);
	};

	// Build all upload promises (main + gallery in parallel)
	const uploadPromises: Promise<void>[] = [];
	let mainImageResult: UploadedImageData | undefined;
	const galleryResults: UploadedImageData[] = [];

	// Main image upload promise
	if (hasMain && urls.mainImage && mainImageFile) {
		const mainUrl = urls.mainImage;
		uploadPromises.push(
			uploadToS3(mainImageFile, mainUrl.uploadUrl)
				.then(() => {
					mainImageResult = {
						key: mainUrl.key,
						url: mainUrl.publicUrl,
					};
					reportProgress('Image principale');
				})
				.catch((error) => {
					logger.error(
						'[S3Upload] Failed to upload main image',
						error,
					);
					throw new Error(
						"Échec du téléchargement de l'image principale",
					);
				}),
		);
	}

	// Gallery upload promises (all in parallel)
	galleryImageFiles.forEach((file, index) => {
		const urlData = urls.galleryImages[index];
		if (!urlData) return;

		uploadPromises.push(
			uploadToS3(file, urlData.uploadUrl)
				.then(() => {
					galleryResults[index] = {
						key: urlData.key,
						url: urlData.publicUrl,
					};
					reportProgress(`Image ${index + 1}`);
				})
				.catch((error) => {
					logger.error(
						`[S3Upload] Failed to upload gallery image ${index}`,
						error,
					);
					throw new Error(
						`Échec du téléchargement de l'image ${index + 1}`,
					);
				}),
		);
	});

	// Execute all uploads in parallel
	await Promise.all(uploadPromises);

	// Filter out any undefined entries (shouldn't happen, but safety)
	const validGalleryResults = galleryResults.filter(Boolean);

	logger.info(
		`[S3Upload] Uploaded ${mainImageResult ? 1 : 0} main + ${validGalleryResults.length} gallery images for property ${urls.propertyId}`,
	);

	return {
		propertyId: urls.propertyId,
		mainImage: mainImageResult,
		galleryImages: validGalleryResults,
	};
}
