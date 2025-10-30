import { Request, Response } from 'express';
import { Property } from '../models/Property';
import { s3Service } from '../services/s3Service';
import mongoose from 'mongoose';
import {
	sanitizeInput,
	createSafeRegex,
	isValidObjectId,
} from '../utils/sanitize';
import { logger } from '../utils/logger';

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		userType: 'agent' | 'apporteur';
	};
}

// Simple validation function for combined upload with type conversion
const validatePropertyData = (data: Record<string, unknown>) => {
	const errors: string[] = [];

	// Convert string numbers to actual numbers for form data
	const convertedData = { ...data };

	// Handle array fields that come as key[0], key[1] format from FormData
	const arrayFields = ['exterior'];
	arrayFields.forEach((field) => {
		const arrayItems: string[] = [];
		Object.keys(data).forEach((key) => {
			const match = key.match(new RegExp(`^${field}\\[(\\d+)\\]$`));
			if (match) {
				const index = parseInt(match[1], 10);
				arrayItems[index] = data[key] as string;
			}
		});
		if (arrayItems.length > 0) {
			convertedData[field] = arrayItems.filter(
				(item) => item !== undefined,
			);
			// Remove the individual array items
			Object.keys(convertedData).forEach((key) => {
				if (key.startsWith(`${field}[`)) {
					delete convertedData[key];
				}
			});
		}
	});

	// Convert numeric fields from strings
	if (typeof data.price === 'string') {
		convertedData.price = parseFloat(data.price);
	}
	if (typeof data.surface === 'string') {
		convertedData.surface = parseFloat(data.surface);
	}
	if (typeof data.rooms === 'string') {
		convertedData.rooms = parseInt(data.rooms, 10) || undefined;
	}
	if (typeof data.bedrooms === 'string') {
		convertedData.bedrooms = parseInt(data.bedrooms, 10) || undefined;
	}
	if (typeof data.bathrooms === 'string') {
		convertedData.bathrooms = parseInt(data.bathrooms, 10) || undefined;
	}
	if (typeof data.levels === 'string') {
		convertedData.levels = parseInt(data.levels, 10) || undefined;
	}
	if (typeof data.parkingSpaces === 'string') {
		convertedData.parkingSpaces =
			parseInt(data.parkingSpaces, 10) || undefined;
	}
	if (typeof data.annualCondoFees === 'string') {
		convertedData.annualCondoFees =
			parseFloat(data.annualCondoFees) || undefined;
	}
	if (typeof data.yearBuilt === 'string') {
		convertedData.yearBuilt = parseInt(data.yearBuilt, 10) || undefined;
	}
	if (typeof data.landArea === 'string') {
		convertedData.landArea = parseFloat(data.landArea) || undefined;
	}

	// Convert boolean fields from strings
	const booleanFields = [
		'hasParking',
		'hasGarden',
		'hasElevator',
		'hasBalcony',
		'hasTerrace',
		'hasGarage',
		'isFeatured',
	];
	booleanFields.forEach((field) => {
		if (typeof data[field] === 'string') {
			convertedData[field] = data[field] === 'true';
		}
	});

	// Validation logic
	if (
		!convertedData.title ||
		(typeof convertedData.title === 'string' &&
			convertedData.title.length < 10)
	) {
		errors.push('Le titre doit contenir au moins 10 caractères');
	}
	if (
		!convertedData.description ||
		(typeof convertedData.description === 'string' &&
			convertedData.description.length < 50)
	) {
		errors.push('La description doit contenir au moins 50 caractères');
	}
	if (
		!convertedData.price ||
		(typeof convertedData.price === 'number' && convertedData.price < 1000)
	) {
		errors.push('Le prix doit être supérieur à 1000€');
	}
	if (
		!convertedData.surface ||
		(typeof convertedData.surface === 'number' && convertedData.surface < 1)
	) {
		errors.push('La surface doit être supérieure à 1 m²');
	}
	if (
		!convertedData.city ||
		(typeof convertedData.city === 'string' &&
			convertedData.city.length < 2)
	) {
		errors.push('La ville est requise');
	}

	return {
		success: errors.length === 0,
		errors: errors.length > 0 ? errors.join(', ') : undefined,
		data: convertedData,
	};
};

// Get all active properties with filtering and pagination
export const getProperties = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const {
			page = 1,
			limit,
			propertyType,
			city,
			postalCode,
			minPrice,
			maxPrice,
			minSurface,
			maxSurface,
			rooms,
			search,
			sortBy = 'createdAt',
			sortOrder = 'desc',
		} = req.query;

		// Build filter object
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const filter: any = { status: 'active' };

		if (propertyType) {
			// Sanitize to prevent injection
			filter.propertyType = sanitizeInput(propertyType);
		}

		if (city) {
			// Use safe regex to prevent ReDoS attacks
			filter.city = createSafeRegex(city as string);
		}

		if (postalCode) {
			// Support both single postal code and comma-separated list
			const postalCodes = (postalCode as string)
				.split(',')
				.map((pc) => sanitizeInput(pc.trim()));
			if (postalCodes.length === 1) {
				filter.postalCode = postalCodes[0];
			} else {
				filter.postalCode = { $in: postalCodes };
			}
		}

		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}

		if (minSurface || maxSurface) {
			filter.surface = {};
			if (minSurface) filter.surface.$gte = Number(minSurface);
			if (maxSurface) filter.surface.$lte = Number(maxSurface);
		}

		if (rooms) {
			filter.rooms = Number(rooms);
		}

		if (search) {
			// Sanitize search input
			filter.$text = { $search: sanitizeInput(search) as string };
		}

		// Build sort object
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const sort: any = {};
		sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

		// Calculate pagination only if limit is provided
		const skip = limit ? (Number(page) - 1) * Number(limit) : 0;

		// Execute query
		let query = Property.find(filter)
			.populate('owner', 'firstName lastName email profileImage userType')
			.sort(sort)
			.skip(skip);

		// Only apply limit if provided
		if (limit) {
			query = query.limit(Number(limit));
		}

		const [properties, total] = await Promise.all([
			query.lean().exec(),
			Property.countDocuments(filter),
		]);

		// Calculate pagination info
		const totalPages = limit ? Math.ceil(total / Number(limit)) : 1;
		const hasNextPage = limit ? Number(page) < totalPages : false;
		const hasPrevPage = Number(page) > 1;

		res.status(200).json({
			success: true,
			data: {
				properties,
				pagination: {
					currentPage: Number(page),
					totalPages,
					totalItems: total,
					itemsPerPage: Number(limit),
					hasNextPage,
					hasPrevPage,
				},
			},
		});
	} catch (error) {
		logger.error('[PropertyController] Error fetching properties', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des biens',
		});
	}
}; // Get a single property by ID
export const getPropertyById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;

		// Validate ObjectId format
		if (!isValidObjectId(id)) {
			res.status(400).json({
				success: false,
				message: 'Invalid property ID format',
			});
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({
				success: false,
				message: 'ID de bien invalide',
			});
			return;
		}

		const property = await Property.findById(id)
			.populate(
				'owner',
				'firstName lastName email profileImage userType phone',
			)
			.lean();

		if (!property) {
			res.status(404).json({
				success: false,
				message: 'Bien non trouvé',
			});
			return;
		}

		// Increment view count (async, don't wait)
		Property.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();

		res.status(200).json({
			success: true,
			data: property,
		});
	} catch (error) {
		logger.error('[PropertyController] Error fetching property', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération du bien',
		});
	}
}; // Create property with images
export const createProperty = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		// Validate property data
		const validationResult = validatePropertyData(req.body);
		if (!validationResult.success) {
			res.status(400).json({
				success: false,
				message: 'Données invalides',
				errors: validationResult.errors,
			});
			return;
		}

		const files = req.files as
			| { [fieldname: string]: Express.Multer.File[] }
			| Express.Multer.File[]
			| undefined;

		// Upload images first
		let mainImageData: { url: string; key: string } | undefined;
		const galleryImagesData: Array<{ url: string; key: string }> = [];

		if (files && !Array.isArray(files)) {
			// Upload main image
			if (files.mainImage && files.mainImage[0]) {
				const mainImageVariants = await s3Service.uploadImage({
					buffer: files.mainImage[0].buffer,
					originalName: files.mainImage[0].originalname,
					userId: req.user.id,
					folder: 'properties',
					isMainImage: true,
				});
				mainImageData = {
					url: mainImageVariants[0]?.url,
					key: mainImageVariants[0]?.key,
				};
			}

			// Upload gallery images
			if (files.galleryImages) {
				for (const file of files.galleryImages) {
					const galleryImageVariants = await s3Service.uploadImage({
						buffer: file.buffer,
						originalName: file.originalname,
						userId: req.user.id,
						folder: 'properties',
						isMainImage: false,
					});
					galleryImagesData.push({
						url: galleryImageVariants[0]?.url,
						key: galleryImageVariants[0]?.key,
					});
				}
			}
		}

		// Ensure main image is provided
		if (!mainImageData) {
			res.status(400).json({
				success: false,
				message: "L'image principale est requise",
			});
			return;
		}

		// Create property with uploaded images
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const propertyData: any = {
			...validationResult.data,
			mainImage: mainImageData,
			galleryImages: galleryImagesData,
			owner: req.user.id,
		};

		// Parse clientInfo if it's a JSON string
		if (
			propertyData.clientInfo &&
			typeof propertyData.clientInfo === 'string'
		) {
			try {
				propertyData.clientInfo = JSON.parse(propertyData.clientInfo);
			} catch (e) {
				logger.error(
					'[PropertyController] Failed to parse clientInfo',
					e,
				);
			}
		}

		// Map availableFrom to availableFromDate if present and format it properly
		if (propertyData.availableFrom && !propertyData.availableFromDate) {
			let dateValue = propertyData.availableFrom as string;

			// Only process non-empty strings
			if (dateValue && typeof dateValue === 'string') {
				dateValue = dateValue.trim();

				// If the date is in MMYYYY format (like "102025"), convert to MM/YYYY format
				if (/^\d{6}$/.test(dateValue)) {
					dateValue =
						dateValue.substring(0, 2) +
						'/' +
						dateValue.substring(2);
				}
				// If it's in MMYY format (like "1025"), convert to MM/20YY format
				else if (/^\d{4}$/.test(dateValue)) {
					dateValue =
						dateValue.substring(0, 2) +
						'/20' +
						dateValue.substring(2);
				}
				// If it's already in MM/YYYY format, keep it as is
				// If it doesn't match any expected format, let validation handle the error

				propertyData.availableFromDate = dateValue;
			}
			delete propertyData.availableFrom;
		}

		const property = new Property(propertyData);
		await property.save();

		// Populate owner information
		await property.populate('owner', 'firstName lastName email');

		res.status(201).json({
			success: true,
			message: 'Propriété créée avec succès',
			data: property,
		});
	} catch (error) {
		logger.error('[PropertyController] Property creation error', error);

		// Include more error details in development
		const errorDetails =
			error instanceof Error
				? {
						message: error.message,
						stack: error.stack,
					}
				: error;

		logger.error('[PropertyController] Detailed error', errorDetails);

		res.status(500).json({
			success: false,
			message: 'Erreur lors de la création de la propriété',
			...(process.env.NODE_ENV === 'development' && {
				error: errorDetails,
			}),
		});
	}
}; // Update property with images
export const updateProperty = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({
				success: false,
				message: 'ID de bien invalide',
			});
			return;
		}

		// Get existing property
		const existingProperty = await Property.findById(id);
		if (!existingProperty) {
			res.status(404).json({
				success: false,
				message: 'Bien non trouvé',
			});
			return;
		}

		// Check ownership
		if (existingProperty.owner.toString() !== req.user.id) {
			res.status(403).json({
				success: false,
				message: "Vous n'êtes pas autorisé à modifier ce bien",
			});
			return;
		}

		// Validate property data
		const validationResult = validatePropertyData(req.body);
		if (!validationResult.success) {
			res.status(400).json({
				success: false,
				message: 'Données invalides',
				errors: validationResult.errors,
			});
			return;
		}

		const files = req.files as
			| { [fieldname: string]: Express.Multer.File[] }
			| Express.Multer.File[]
			| undefined;

		// Parse existing images to keep (sent as JSON in body)
		const existingMainImage = req.body.existingMainImage
			? JSON.parse(req.body.existingMainImage)
			: null;
		const existingGalleryImages = req.body.existingGalleryImages
			? JSON.parse(req.body.existingGalleryImages)
			: [];

		// Collect images to delete from S3
		const imagesToDelete: string[] = [];

		// Handle main image updates
		let mainImageData: { url: string; key: string } | undefined;

		if (
			files &&
			!Array.isArray(files) &&
			files.mainImage &&
			files.mainImage[0]
		) {
			// New main image uploaded, delete old one
			if (existingProperty.mainImage?.key) {
				imagesToDelete.push(existingProperty.mainImage.key);
			}

			// Upload new main image
			const mainImageVariants = await s3Service.uploadImage({
				buffer: files.mainImage[0].buffer,
				originalName: files.mainImage[0].originalname,
				userId: req.user.id,
				folder: 'properties',
				propertyId: id,
				isMainImage: true,
			});
			mainImageData = {
				url: mainImageVariants[0]?.url,
				key: mainImageVariants[0]?.key,
			};
		} else if (existingMainImage) {
			// Keep existing main image
			mainImageData = existingMainImage;
		}

		// Handle gallery images updates
		const galleryImagesData: Array<{ url: string; key: string }> = [];

		// Add existing gallery images that should be kept
		if (existingGalleryImages && Array.isArray(existingGalleryImages)) {
			galleryImagesData.push(...existingGalleryImages);
		}

		// Find gallery images to delete (existed before but not in the kept list)
		if (existingProperty.galleryImages) {
			for (const oldImage of existingProperty.galleryImages) {
				if (oldImage.key) {
					const isKept = existingGalleryImages.some(
						(kept: { key: string; url: string }) =>
							kept.key === oldImage.key,
					);
					if (!isKept) {
						imagesToDelete.push(oldImage.key);
					}
				}
			}
		}

		// Upload new gallery images
		if (files && !Array.isArray(files) && files.galleryImages) {
			for (const file of files.galleryImages) {
				const galleryImageVariants = await s3Service.uploadImage({
					buffer: file.buffer,
					originalName: file.originalname,
					userId: req.user.id,
					folder: 'properties',
					propertyId: id,
					isMainImage: false,
				});
				galleryImagesData.push({
					url: galleryImageVariants[0]?.url,
					key: galleryImageVariants[0]?.key,
				});
			}
		}

		// Delete removed images from S3
		if (imagesToDelete.length > 0) {
			try {
				await s3Service.deleteMultipleImages(imagesToDelete);
				logger.debug(
					`[PropertyController] Deleted ${imagesToDelete.length} images from S3 for property ${id}`,
				);
			} catch (error) {
				logger.error(
					'[PropertyController] Error deleting images from S3',
					error,
				);
				// Continue with property update even if S3 cleanup fails
			}
		} // Ensure main image is provided
		if (!mainImageData) {
			res.status(400).json({
				success: false,
				message: "L'image principale est requise",
			});
			return;
		}

		// Update property with new data and images
		const propertyData = {
			...req.body,
			mainImage: mainImageData,
			galleryImages: galleryImagesData,
		};

		// Parse clientInfo if it's a JSON string
		if (
			propertyData.clientInfo &&
			typeof propertyData.clientInfo === 'string'
		) {
			try {
				propertyData.clientInfo = JSON.parse(propertyData.clientInfo);
			} catch (e) {
				logger.error(
					'[PropertyController] Failed to parse clientInfo',
					e,
				);
			}
		}

		// Clean up clientInfo by removing Mongoose-generated fields
		if (
			propertyData.clientInfo &&
			typeof propertyData.clientInfo === 'object'
		) {
			const cleanClientInfo = (obj: Record<string, unknown>) => {
				if (obj && typeof obj === 'object') {
					delete obj._id;
					delete obj.id;
					Object.keys(obj).forEach((key) => {
						if (typeof obj[key] === 'object' && obj[key] !== null) {
							cleanClientInfo(
								obj[key] as Record<string, unknown>,
							);
						}
					});
				}
			};
			cleanClientInfo(propertyData.clientInfo);
		}

		// Remove fields that shouldn't be updated
		delete propertyData.existingMainImage;
		delete propertyData.existingGalleryImages;
		delete propertyData.owner; // Don't update owner field
		delete propertyData._id; // Don't update _id
		delete propertyData.id; // Don't update id
		delete propertyData.__v; // Don't update version key
		delete propertyData.createdAt; // Don't update createdAt
		delete propertyData.viewCount; // Don't update viewCount directly
		delete propertyData.favoriteCount; // Don't update favoriteCount directly

		Object.assign(existingProperty, propertyData);
		await existingProperty.save();

		// Populate owner info for response
		await existingProperty.populate(
			'owner',
			'firstName lastName email profileImage userType',
		);

		res.status(200).json({
			success: true,
			message: 'Bien mis à jour avec succès',
			data: existingProperty,
		});
	} catch (error) {
		logger.error(
			'[PropertyController] Error updating property with images',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la mise à jour du bien',
		});
	}
}; // Delete a property (only owner can delete)
export const deleteProperty = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;

		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({
				success: false,
				message: 'ID de bien invalide',
			});
			return;
		}

		const property = await Property.findById(id);

		if (!property) {
			res.status(404).json({
				success: false,
				message: 'Bien non trouvé',
			});
			return;
		}

		// Check if user is the owner
		if (property.owner.toString() !== req.user.id) {
			res.status(403).json({
				success: false,
				message: "Vous n'êtes pas autorisé à supprimer ce bien",
			});
			return;
		}

		// Clean up S3 images before deleting the property
		const imagesToDelete: string[] = [];

		// Add main image key if exists
		if (property.mainImage?.key) {
			imagesToDelete.push(property.mainImage.key);
		}

		// Add gallery images keys if exist
		if (property.galleryImages && property.galleryImages.length > 0) {
			property.galleryImages.forEach((image) => {
				if (image.key) {
					imagesToDelete.push(image.key);
				}
			});
		}

		// Delete images from S3
		if (imagesToDelete.length > 0) {
			try {
				await s3Service.deleteMultipleImages(imagesToDelete);
				logger.debug(
					`[PropertyController] Deleted ${imagesToDelete.length} images from S3 for property ${id}`,
				);
			} catch (error) {
				logger.error(
					'[PropertyController] Error deleting images from S3',
					error,
				);
				// Continue with property deletion even if S3 cleanup fails
			}
		}

		await Property.findByIdAndDelete(id);
		res.status(200).json({
			success: true,
			message: 'Bien supprimé avec succès',
		});
	} catch (error) {
		logger.error('[PropertyController] Error deleting property', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la suppression du bien',
		});
	}
}; // Get properties by owner (for dashboard)
export const getMyProperties = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		const {
			page = 1,
			limit = 10,
			status,
			sortBy = 'createdAt',
			sortOrder = 'desc',
		} = req.query;

		// Build filter
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const filter: any = { owner: req.user.id };

		if (status) {
			filter.status = status;
		}

		// Build sort
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const sort: any = {};
		sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

		// Calculate pagination
		const skip = (Number(page) - 1) * Number(limit);

		// Execute query
		const [properties, total] = await Promise.all([
			Property.find(filter)
				.sort(sort)
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			Property.countDocuments(filter),
		]);

		// Calculate pagination info
		const totalPages = Math.ceil(total / Number(limit));

		res.status(200).json({
			success: true,
			data: {
				properties,
				pagination: {
					currentPage: Number(page),
					totalPages,
					totalItems: total,
					itemsPerPage: Number(limit),
				},
			},
		});
	} catch (error) {
		logger.error(
			'[PropertyController] Error fetching user properties',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération de vos biens',
		});
	}
}; // Update property status
export const updatePropertyStatus = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			res.status(400).json({
				success: false,
				message: 'ID de bien invalide',
			});
			return;
		}

		if (
			!['active', 'sold', 'rented', 'draft', 'archived'].includes(status)
		) {
			res.status(400).json({
				success: false,
				message: 'Statut invalide',
			});
			return;
		}

		const property = await Property.findById(id);

		if (!property) {
			res.status(404).json({
				success: false,
				message: 'Bien non trouvé',
			});
			return;
		}

		// Check if user is the owner
		if (property.owner.toString() !== req.user.id) {
			res.status(403).json({
				success: false,
				message: "Vous n'êtes pas autorisé à modifier ce bien",
			});
			return;
		}

		property.status = status;
		await property.save();

		res.status(200).json({
			success: true,
			message: 'Statut mis à jour avec succès',
			data: property,
		});
	} catch (error) {
		logger.error(
			'[PropertyController] Error updating property status',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la mise à jour du statut',
		});
	}
}; // Get property statistics (for dashboard)
export const getPropertyStats = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Authentification requise',
			});
			return;
		}

		const stats = await Property.aggregate([
			{ $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
					totalViews: { $sum: '$viewCount' },
					avgPrice: { $avg: '$price' },
				},
			},
		]);

		const totalProperties = await Property.countDocuments({
			owner: req.user.id,
		});
		const totalViews = await Property.aggregate([
			{ $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
			{ $group: { _id: null, total: { $sum: '$viewCount' } } },
		]);

		const totalValueAgg = await Property.aggregate([
			{ $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
			{ $group: { _id: null, total: { $sum: '$price' } } },
		]);

		res.status(200).json({
			success: true,
			data: {
				totalProperties,
				totalViews: totalViews[0]?.total || 0,
				totalValue: totalValueAgg[0]?.total || 0,
				byStatus: stats,
			},
		});
	} catch (error) {
		logger.error(
			'[PropertyController] Error fetching property stats',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des statistiques',
		});
	}
};
