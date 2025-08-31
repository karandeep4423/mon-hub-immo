import { Request, Response } from 'express';
import { Property, IProperty } from '../models/Property';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		userType: 'agent' | 'apporteur';
	};
}

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

// Create a new property (for agents and apporteurs)
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

		// Allow both agents and apporteurs to create properties
		if (!['agent', 'apporteur'].includes(req.user.userType)) {
			res.status(403).json({
				success: false,
				message:
					'Seuls les agents et apporteurs peuvent créer des annonces',
			});
			return;
		}

		const propertyData = {
			...req.body,
			owner: req.user.id,
		};

		const property = new Property(propertyData);
		await property.save();

		// Populate owner info for response
		await property.populate(
			'owner',
			'firstName lastName email profileImage userType',
		);

		res.status(201).json({
			success: true,
			message: 'Bien créé avec succès',
			data: property,
		});
	} catch (error) {
		console.error('Error creating property:', error);

		if (error instanceof Error && error.name === 'ValidationError') {
			res.status(400).json({
				success: false,
				message: 'Données invalides',
				errors: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			message: 'Erreur lors de la création du bien',
		});
	}
};

// Update a property (only owner can update)
export const updateProperty = async (
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
				message: "Vous n'êtes pas autorisé à modifier ce bien",
			});
			return;
		}

		// Update property
		Object.assign(property, req.body);
		await property.save();

		// Populate owner info for response
		await property.populate(
			'owner',
			'firstName lastName email profileImage userType',
		);

		res.status(200).json({
			success: true,
			message: 'Bien mis à jour avec succès',
			data: property,
		});
	} catch (error) {
		console.error('Error updating property:', error);

		if (error instanceof Error && error.name === 'ValidationError') {
			res.status(400).json({
				success: false,
				message: 'Données invalides',
				errors: error.message,
			});
			return;
		}

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
		const filter: any = { owner: req.user.id };

		if (status) {
			filter.status = status;
		}

		// Build sort
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
