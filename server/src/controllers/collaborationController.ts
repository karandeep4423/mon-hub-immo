import { Request, Response } from 'express';
import { Collaboration } from '../models/Collaboration';
import { Property } from '../models/Property';
import { Types } from 'mongoose';

interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		userType: string;
	};
}

export const proposeCollaboration = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { propertyId, commissionPercentage, message } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		// Check if property exists
		const property = await Property.findById(propertyId);
		if (!property) {
			res.status(404).json({
				success: false,
				message: 'Property not found',
			});
			return;
		}

		// Check that the user is not proposing collaboration on their own property
		if (property.owner.toString() === userId) {
			res.status(400).json({
				success: false,
				message: 'Cannot collaborate on your own property',
			});
			return;
		}

		// Check for existing collaboration
		const existingCollaboration = await Collaboration.findOne({
			propertyId,
			collaboratorId: userId, // Current user is the collaborator
			status: { $in: ['pending', 'accepted', 'active'] },
		});

		if (existingCollaboration) {
			res.status(400).json({
				success: false,
				message: 'Collaboration already exists',
			});
			return;
		}

		// Block if the property already has an active/pending/accepted collaboration with someone else
		const collabWithAnother = await Collaboration.findOne({
			propertyId,
			collaboratorId: { $ne: userId },
			status: { $in: ['pending', 'accepted', 'active'] },
		});

		if (collabWithAnother) {
			res.status(409).json({
				success: false,
				message: 'Property already under collaboration',
			});
			return;
		}

		const collaboration = new Collaboration({
			propertyId,
			propertyOwnerId: property.owner, // Property owner receives the collaboration request
			collaboratorId: userId, // Current authenticated user becomes the collaborator
			proposedCommission: commissionPercentage,
			proposalMessage: message,
			status: 'pending',
			currentStep: 'proposal',
			activities: [
				{
					type: 'proposal',
					message: `Collaboration proposée avec ${commissionPercentage}% de commission`,
					createdBy: new Types.ObjectId(userId),
					createdAt: new Date(),
				},
			],
			ownerSigned: false,
			collaboratorSigned: false,
		});

		await collaboration.save();

		res.status(201).json({
			success: true,
			message: 'Collaboration proposed successfully',
			collaboration,
		});
	} catch (error) {
		console.error('Error proposing collaboration:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const getUserCollaborations = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		const collaborations = await Collaboration.find({
			$or: [{ propertyOwnerId: userId }, { collaboratorId: userId }],
		})
			.populate('propertyId', 'title address price')
			.populate('propertyOwnerId', 'firstName lastName')
			.populate('collaboratorId', 'firstName lastName')
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			collaborations,
		});
	} catch (error) {
		console.error('Error getting collaborations:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const respondToCollaboration = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { response } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		const collaboration = await Collaboration.findById(id);
		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		if (collaboration.propertyOwnerId.toString() !== userId) {
			res.status(403).json({
				success: false,
				message: 'Only property owner can respond',
			});
			return;
		}

		if (collaboration.status !== 'pending') {
			res.status(400).json({
				success: false,
				message: 'Can only respond to pending proposals',
			});
			return;
		}

		collaboration.status =
			response === 'accepted' ? 'accepted' : 'rejected';
		await collaboration.save();

		res.status(200).json({
			success: true,
			message: `Collaboration ${response}`,
			collaboration,
		});
	} catch (error) {
		console.error('Error responding to collaboration:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const addCollaborationNote = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { content } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		const collaboration = await Collaboration.findById(id);
		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		const isOwner = collaboration.propertyOwnerId.toString() === userId;
		const isCollaborator =
			collaboration.collaboratorId.toString() === userId;

		if (!isOwner && !isCollaborator) {
			res.status(403).json({ success: false, message: 'Not authorized' });
			return;
		}

		// Enforce that free-form activities (notes) are only allowed when active
		if (collaboration.status !== 'active') {
			res.status(400).json({
				success: false,
				message: 'Cannot add activities until collaboration is active',
			});
			return;
		}

		collaboration.activities.push({
			type: 'note',
			message: content,
			createdBy: new Types.ObjectId(userId),
			createdAt: new Date(),
		});

		await collaboration.save();

		res.status(200).json({
			success: true,
			message: 'Note added successfully',
			collaboration,
		});
	} catch (error) {
		console.error('Error adding note:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const getCollaborationsByProperty = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { propertyId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		const collaborations = await Collaboration.find({ propertyId })
			.populate('propertyOwnerId', 'firstName lastName')
			.populate('collaboratorId', 'firstName lastName')
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			collaborations,
		});
	} catch (error) {
		console.error('Error getting property collaborations:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const cancelCollaboration = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		// Find the collaboration
		const collaboration = await Collaboration.findById(id)
			.populate('propertyOwnerId', 'firstName lastName email')
			.populate('collaboratorId', 'firstName lastName email');

		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		// Check if user is involved in this collaboration
		const isOwner = collaboration.propertyOwnerId._id.toString() === userId;
		const isCollaborator =
			collaboration.collaboratorId._id.toString() === userId;

		if (!isOwner && !isCollaborator) {
			res.status(403).json({
				success: false,
				message: 'Not authorized to cancel this collaboration',
			});
			return;
		}

		// Check if collaboration can be cancelled (not already completed)
		if (collaboration.status === 'completed') {
			res.status(400).json({
				success: false,
				message: 'Cannot cancel a completed collaboration',
			});
			return;
		}

		// Update collaboration status to cancelled
		collaboration.status = 'cancelled';
		collaboration.updatedAt = new Date();

		await collaboration.save();

		res.status(200).json({
			success: true,
			message: 'Collaboration cancelled successfully',
			collaboration,
		});
	} catch (error) {
		console.error('Error cancelling collaboration:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const updateProgressStatus = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { targetStep, notes } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		// Validate targetStep
		const validSteps = [
			'proposal',
			'accepted',
			'visit_planned',
			'visit_completed',
			'negotiation',
			'offer_made',
			'compromise_signed',
			'final_act',
		];
		if (!validSteps.includes(targetStep)) {
			res.status(400).json({
				success: false,
				message: 'Invalid target step',
			});
			return;
		}

		// Find the collaboration
		const collaboration = await Collaboration.findById(id)
			.populate('propertyOwnerId', 'firstName lastName email')
			.populate('collaboratorId', 'firstName lastName email');

		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		// Check authorization
		const isOwner = collaboration.propertyOwnerId._id.toString() === userId;
		const isCollaborator =
			collaboration.collaboratorId._id.toString() === userId;

		if (!isOwner && !isCollaborator) {
			res.status(403).json({
				success: false,
				message: 'Not authorized to update this collaboration',
			});
			return;
		}

		// Only allow progress updates when collaboration is active
		if (collaboration.status !== 'active') {
			res.status(400).json({
				success: false,
				message: 'Can only update progress for active collaborations',
			});
			return;
		}

		// Update progress status using the model method
		await collaboration.updateProgressStatus(
			targetStep,
			notes || '',
			new Types.ObjectId(userId),
		);

		res.status(200).json({
			success: true,
			message: 'Progress status updated successfully',
			collaboration,
		});
	} catch (error) {
		console.error('Error updating progress status:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const signCollaboration = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		// Find the collaboration
		const collaboration = await Collaboration.findById(id)
			.populate('propertyOwnerId', 'firstName lastName email')
			.populate('collaboratorId', 'firstName lastName email');

		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		// Check authorization and sign using the model method
		await collaboration.signContract(new Types.ObjectId(userId));

		res.status(200).json({
			success: true,
			message: 'Contract signed successfully',
			collaboration,
		});
	} catch (error) {
		console.error('Error signing collaboration:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const completeCollaboration = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		const collaboration = await Collaboration.findById(id)
			.populate('propertyOwnerId', 'firstName lastName email')
			.populate('collaboratorId', 'firstName lastName email');

		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		// Check authorization
		const isOwner = collaboration.propertyOwnerId._id.toString() === userId;
		const isCollaborator =
			collaboration.collaboratorId._id.toString() === userId;

		if (!isOwner && !isCollaborator) {
			res.status(403).json({
				success: false,
				message: 'Not authorized to complete this collaboration',
			});
			return;
		}

		// Can only complete if collaboration is active
		if (collaboration.status !== 'active') {
			res.status(400).json({
				success: false,
				message: 'Can only complete active collaborations',
			});
			return;
		}

		// Update final progress step BEFORE flipping to completed to pass guards
		await collaboration.updateProgressStatus(
			'final_act',
			'Collaboration terminée avec succès',
			new Types.ObjectId(userId),
		);

		// Update status to completed
		collaboration.status = 'completed';
		collaboration.currentStep = 'completed';
		collaboration.completedAt = new Date();

		// Add activity log
		collaboration.activities.push({
			type: 'status_update',
			message: `Collaboration completed by ${isOwner ? 'property owner' : 'collaborator'}`,
			createdBy: new Types.ObjectId(userId),
			createdAt: new Date(),
		});

		res.status(200).json({
			success: true,
			message: 'Collaboration completed successfully',
			collaboration,
		});
	} catch (error) {
		console.error('Error completing collaboration:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};
