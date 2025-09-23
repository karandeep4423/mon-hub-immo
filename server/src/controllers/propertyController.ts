import { Request, Response } from 'express';
import { Property } from '../models/Property';
import { s3Service } from '../services/s3Service';
import mongoose from 'mongoose';

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		userType: 'agent' | 'apporteur';
	};
}

// Simple validation function for combined upload
const validatePropertyData = (data: Record<string, unknown>) => {
	const errors: string[] = [];

	if (
		!data.title ||
		(typeof data.title === 'string' && data.title.length < 10)
	) {
		errors.push('Le titre doit contenir au moins 10 caractères');
	}
	if (
		!data.description ||
		(typeof data.description === 'string' && data.description.length < 50)
	) {
		errors.push('La description doit contenir au moins 50 caractères');
	}
	if (!data.price || (typeof data.price === 'number' && data.price < 1000)) {
		errors.push('Le prix doit être supérieur à 1000€');
	}
	if (
		!data.surface ||
		(typeof data.surface === 'number' && data.surface < 1)
	) {
		errors.push('La surface doit être supérieure à 1 m²');
	}
	if (!data.city || (typeof data.city === 'string' && data.city.length < 2)) {
		errors.push('La ville est requise');
	}

	return {
		success: errors.length === 0,
		errors: errors.length > 0 ? errors.join(', ') : undefined,
		data,
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
			limit = 12,
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
			filter.propertyType = propertyType;
		}

		if (city) {
			filter.city = new RegExp(city as string, 'i');
		}

		if (postalCode) {
			filter.postalCode = postalCode;
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
			filter.$text = { $search: search as string };
		}

		// Build sort object
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const sort: any = {};
		sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

		// Calculate pagination
		const skip = (Number(page) - 1) * Number(limit);

		// Execute query
		const [properties, total] = await Promise.all([
			Property.find(filter)
				.populate(
					'owner',
					'firstName lastName email profileImage userType',
				)
				.sort(sort)
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			Property.countDocuments(filter),
		]);

		// Calculate pagination info
		const totalPages = Math.ceil(total / Number(limit));
		const hasNextPage = Number(page) < totalPages;
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
		console.error('Error fetching properties:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des biens',
		});
	}
};

// Get a single property by ID
export const getPropertyById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;

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
		console.error('Error fetching property:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération du bien',
		});
	}
};

// Create property with images
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
		const propertyData = {
			...validationResult.data,
			mainImage: mainImageData,
			galleryImages: galleryImagesData,
			owner: req.user.id,
		};

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
		console.error('Property creation error:', error);

		res.status(500).json({
			success: false,
			message: 'Erreur lors de la création de la propriété',
		});
	}
};

// Update property with images
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
				console.log(
					`Deleted ${imagesToDelete.length} images from S3 for property ${id}`,
				);
			} catch (error) {
				console.error('Error deleting images from S3:', error);
				// Continue with property update even if S3 cleanup fails
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

		// Update property with new data and images
		const propertyData = {
			...req.body,
			mainImage: mainImageData,
			galleryImages: galleryImagesData,
		};

		// Remove stringified image data from property update
		delete propertyData.existingMainImage;
		delete propertyData.existingGalleryImages;

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
		console.error('Error updating property with images:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la mise à jour du bien',
		});
	}
};

// Delete a property (only owner can delete)
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
				console.log(
					`Deleted ${imagesToDelete.length} images from S3 for property ${id}`,
				);
			} catch (error) {
				console.error('Error deleting images from S3:', error);
				// Continue with property deletion even if S3 cleanup fails
			}
		}

		await Property.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: 'Bien supprimé avec succès',
		});
	} catch (error) {
		console.error('Error deleting property:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la suppression du bien',
		});
	}
};

// Get properties by owner (for dashboard)
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
		console.error('Error fetching user properties:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération de vos biens',
		});
	}
};

// Update property status
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
		console.error('Error updating property status:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la mise à jour du statut',
		});
	}
};

// Get property statistics (for dashboard)
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

		res.status(200).json({
			success: true,
			data: {
				totalProperties,
				totalViews: totalViews[0]?.total || 0,
				byStatus: stats,
			},
		});
	} catch (error) {
		console.error('Error fetching property stats:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des statistiques',
		});
	}
};
