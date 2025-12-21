import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	CopyObjectCommand,
	HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import crypto from 'crypto';
import { logger } from '../utils/logger';

// Constants for presigned URL configuration
const PRESIGNED_URL_EXPIRY = 900; // 15 minutes
const ALLOWED_CONTENT_TYPE = 'image/jpeg';

// Limit Sharp memory usage for low-memory environments (Render Basic: 512MB)
sharp.cache({ memory: 50, files: 20, items: 100 });
sharp.concurrency(4); // Process 4 images in parallel - balanced for 512MB RAM

interface UploadOptions {
	buffer: Buffer;
	originalName: string;
	userId: string;
	folder: 'properties' | 'users';
	propertyId?: string;
	isMainImage?: boolean;
}

interface ImageVariant {
	key: string;
	url: string;
	size: 'optimized';
}

const s3Client = new S3Client({
	region: process.env.AWS_REGION || 'us-east-1',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	},
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'monhubimmo';

export class S3Service {
	private generateKey(
		folder: string,
		userId: string,
		fileName: string,
		propertyId?: string,
		isMainImage?: boolean,
	): string {
		if (folder === 'properties' && propertyId) {
			const subFolder = isMainImage ? 'main' : 'gallery';
			return `properties/${propertyId}/${subFolder}/${fileName}`;
		}
		if (folder === 'users') {
			return `users/profiles/${userId}/${fileName}`;
		}
		if (folder === 'chat') {
			return `chat/${userId}/${fileName}`;
		}
		return `temp/${userId}/${fileName}`;
	}

	private getFileExtension(originalName: string): string {
		return originalName.split('.').pop()?.toLowerCase() || 'jpg';
	}

	async uploadObject(params: {
		buffer: Buffer;
		originalName: string;
		userId: string;
		folder?: 'chat' | 'users' | 'properties' | 'temp';
		contentType?: string;
	}): Promise<{ key: string; url: string }> {
		const fileName = this.generateFileName(params.originalName);
		const key = this.generateKey(
			params.folder ?? 'chat',
			params.userId,
			fileName,
		);

		await s3Client.send(
			new PutObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key,
				Body: params.buffer,
				ContentType: params.contentType ?? 'application/octet-stream',
				CacheControl: 'max-age=31536000',
			}),
		);

		const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
		return { key, url };
	}

	/**
	 * Upload chat file with automatic image optimization
	 * Images are optimized with Sharp, documents are uploaded as-is
	 */
	async uploadChatFile(params: {
		buffer: Buffer;
		originalName: string;
		userId: string;
		contentType: string;
	}): Promise<{ key: string; url: string }> {
		const isImage = params.contentType.startsWith('image/');

		if (isImage) {
			// Optimize images for chat (smaller than property images)
			try {
				const optimizedBuffer = await sharp(params.buffer, {
					limitInputPixels: 268402689,
					sequentialRead: true,
				})
					.rotate() // Auto-rotate based on EXIF
					.resize(1200, null, {
						withoutEnlargement: true,
						fastShrinkOnLoad: true,
					})
					.withMetadata({ orientation: undefined })
					.jpeg({
						quality: 50,
						progressive: true,
						mozjpeg: true,
						chromaSubsampling: '4:2:0',
						optimiseCoding: true,
					})
					.toBuffer();

				const fileName = this.generateFileName(
					params.originalName.replace(/\.[^.]+$/, '.jpg'),
				);
				const key = this.generateKey('chat', params.userId, fileName);

				await s3Client.send(
					new PutObjectCommand({
						Bucket: BUCKET_NAME,
						Key: key,
						Body: optimizedBuffer,
						ContentType: 'image/jpeg',
						CacheControl: 'max-age=31536000',
					}),
				);

				const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
				return { key, url };
			} catch (error) {
				logger.error(
					'[S3Service] Chat image optimization failed, uploading original',
					error,
				);
				// Fall through to upload original if optimization fails
			}
		}

		// For documents (PDF, Word, etc.) or if image optimization failed
		return this.uploadObject({
			buffer: params.buffer,
			originalName: params.originalName,
			userId: params.userId,
			folder: 'chat',
			contentType: params.contentType,
		});
	}

	private generateFileName(originalName: string): string {
		const ext = this.getFileExtension(originalName);
		const timestamp = Date.now();
		const random = crypto.randomBytes(8).toString('hex');
		return `${timestamp}-${random}.${ext}`;
	}

	private async createImageVariants(
		buffer: Buffer,
	): Promise<{ [key: string]: Buffer }> {
		const variants: { [key: string]: Buffer } = {};

		try {
			// High-quality image processing for real estate
			// Optimized for smallest file size WITHOUT losing visual quality
			variants.optimized = await sharp(buffer, {
				limitInputPixels: 268402689, // ~16k x 16k max input
				sequentialRead: true, // Reduce memory usage on low-RAM servers
			})
				// Auto-rotate based on EXIF, then strip all metadata
				.rotate() // Auto-rotate based on EXIF orientation
				.resize(1920, null, {
					withoutEnlargement: true,
					fastShrinkOnLoad: true,
				})
				// Remove all metadata (EXIF, GPS, camera info) - saves 50-200KB per image
				.withMetadata({
					orientation: undefined, // Already applied by .rotate()
				})
				.jpeg({
					quality: 50, // Excellent visual quality
					progressive: true, // Faster perceived loading
					mozjpeg: true, // 10-15% smaller than standard JPEG
					chromaSubsampling: '4:2:0', // Standard web subsampling
					optimiseCoding: true, // Optimize Huffman tables
					trellisQuantisation: true, // Better compression
					overshootDeringing: true, // Reduce artifacts
					optimiseScans: true, // Progressive scan optimization
				})
				.toBuffer();

			return variants;
		} catch (error) {
			logger.error('[S3Service] Error creating image variants', error);
			throw new Error('Failed to process image');
		}
	}

	async uploadImage(options: UploadOptions): Promise<ImageVariant[]> {
		const {
			buffer,
			originalName,
			userId,
			folder,
			propertyId,
			isMainImage,
		} = options;
		const fileName = this.generateFileName(originalName);
		const variants = await this.createImageVariants(buffer);
		const uploadedVariants: ImageVariant[] = [];

		for (const [, imageBuffer] of Object.entries(variants)) {
			const key = this.generateKey(
				folder,
				userId,
				fileName,
				propertyId,
				isMainImage,
			);

			try {
				await s3Client.send(
					new PutObjectCommand({
						Bucket: BUCKET_NAME,
						Key: key,
						Body: imageBuffer,
						ContentType: 'image/jpeg',
						CacheControl: 'max-age=31536000',
					}),
				);

				const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

				uploadedVariants.push({
					key,
					url,
					size: 'optimized',
				});
			} catch (error) {
				logger.error('[S3Service] Error uploading image', error);
				throw new Error(`Failed to upload image`);
			}
		}

		return uploadedVariants;
	}
	async deleteImage(key: string): Promise<void> {
		try {
			await s3Client.send(
				new DeleteObjectCommand({
					Bucket: BUCKET_NAME,
					Key: key,
				}),
			);
		} catch (error) {
			logger.error('[S3Service] Error deleting image', error);
			throw new Error('Failed to delete image');
		}
	}

	async deleteMultipleImages(keys: string[]): Promise<void> {
		const deletePromises = keys.map((key) => this.deleteImage(key));
		await Promise.all(deletePromises);
	}

	async copyObject(
		sourceKey: string,
		destinationKey: string,
	): Promise<{ key: string; url: string }> {
		try {
			await s3Client.send(
				new CopyObjectCommand({
					Bucket: BUCKET_NAME,
					CopySource: `${BUCKET_NAME}/${sourceKey}`,
					Key: destinationKey,
					CacheControl: 'max-age=31536000',
				}),
			);

			const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${destinationKey}`;
			return { key: destinationKey, url };
		} catch (error) {
			logger.error('[S3Service] Error copying object', error);
			throw new Error('Failed to copy object');
		}
	}

	/**
	 * Generate presigned URLs for property image uploads (direct client upload)
	 * @param propertyId - Property ID (generated on client for new properties)
	 * @param mainImage - Whether to generate URL for main image
	 * @param galleryCount - Number of gallery images to upload
	 */
	async generatePropertyUploadUrls(
		propertyId: string,
		mainImage: boolean,
		galleryCount: number,
	): Promise<{
		mainImage?: { uploadUrl: string; key: string; publicUrl: string };
		galleryImages: Array<{
			uploadUrl: string;
			key: string;
			publicUrl: string;
		}>;
	}> {
		const result: {
			mainImage?: { uploadUrl: string; key: string; publicUrl: string };
			galleryImages: Array<{
				uploadUrl: string;
				key: string;
				publicUrl: string;
			}>;
		} = {
			galleryImages: [],
		};

		try {
			// Generate main image URL
			if (mainImage) {
				const fileName = this.generateFileName('main.jpg');
				const key = `properties/${propertyId}/main/${fileName}`;

				const command = new PutObjectCommand({
					Bucket: BUCKET_NAME,
					Key: key,
					ContentType: ALLOWED_CONTENT_TYPE,
					CacheControl: 'max-age=31536000',
				});

				const uploadUrl = await getSignedUrl(s3Client, command, {
					expiresIn: PRESIGNED_URL_EXPIRY,
				});

				result.mainImage = {
					uploadUrl,
					key,
					publicUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
				};
			}

			// Generate gallery image URLs
			for (let i = 0; i < galleryCount; i++) {
				const fileName = this.generateFileName(`gallery-${i}.jpg`);
				const key = `properties/${propertyId}/gallery/${fileName}`;

				const command = new PutObjectCommand({
					Bucket: BUCKET_NAME,
					Key: key,
					ContentType: ALLOWED_CONTENT_TYPE,
					CacheControl: 'max-age=31536000',
				});

				const uploadUrl = await getSignedUrl(s3Client, command, {
					expiresIn: PRESIGNED_URL_EXPIRY,
				});

				result.galleryImages.push({
					uploadUrl,
					key,
					publicUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
				});
			}

			logger.debug(
				`[S3Service] Generated ${mainImage ? 1 : 0} main + ${galleryCount} gallery presigned URLs for property ${propertyId}`,
			);

			return result;
		} catch (error) {
			logger.error(
				'[S3Service] Error generating property upload URLs',
				error,
			);
			throw new Error('Failed to generate upload URLs');
		}
	}

	/**
	 * Verify that an image was successfully uploaded to S3
	 * @param key - The S3 key to verify
	 */
	async verifyImageExists(key: string): Promise<boolean> {
		try {
			await s3Client.send(
				new HeadObjectCommand({
					Bucket: BUCKET_NAME,
					Key: key,
				}),
			);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Verify multiple images exist in S3
	 * @param keys - Array of S3 keys to verify
	 */
	async verifyImagesExist(
		keys: string[],
	): Promise<{ valid: boolean; missing: string[] }> {
		const results = await Promise.all(
			keys.map(async (key) => ({
				key,
				exists: await this.verifyImageExists(key),
			})),
		);

		const missing = results.filter((r) => !r.exists).map((r) => r.key);
		return {
			valid: missing.length === 0,
			missing,
		};
	}
}

export const s3Service = new S3Service();
