import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import crypto from 'crypto';

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
			// Single optimized image (1200px max width, good quality)
			variants.optimized = await sharp(buffer)
				.resize(1200, null, { withoutEnlargement: true })
				.jpeg({ quality: 85, progressive: true })
				.toBuffer();

			return variants;
		} catch (error) {
			console.error('Error creating image variants:', error);
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
				console.error(`Error uploading image:`, error);
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
			console.error('Error deleting image:', error);
			throw new Error('Failed to delete image');
		}
	}

	async deleteMultipleImages(keys: string[]): Promise<void> {
		const deletePromises = keys.map((key) => this.deleteImage(key));
		await Promise.all(deletePromises);
	}

	async generatePresignedUploadUrl(
		userId: string,
		fileName: string,
	): Promise<{ url: string; key: string }> {
		const key = this.generateKey(
			'temp',
			userId,
			this.generateFileName(fileName),
		);

		try {
			const command = new PutObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key,
				ContentType: 'image/jpeg',
			});

			const url = await getSignedUrl(s3Client, command, {
				expiresIn: 900,
			}); // 15 minutes

			return { url, key };
		} catch (error) {
			console.error('Error generating presigned URL:', error);
			throw new Error('Failed to generate upload URL');
		}
	}
}

export const s3Service = new S3Service();
