import { Request, Response } from 'express';
import { Collaboration } from '../models/Collaboration';
import { Property } from '../models/Property';
import { SearchAd } from '../models/SearchAd';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { notificationService } from '../services/notificationService';
import { collabTexts } from '../utils/notificationTexts';

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
		const {
			propertyId,
			searchAdId,
			commissionPercentage,
			message,
			compensationType,
			compensationAmount,
		} = req.body;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		// Determine post type and ID
		const postType = propertyId ? 'Property' : 'SearchAd';
		const postId = propertyId || searchAdId;

		if (!postId) {
			res.status(400).json({
				success: false,
				message: 'Either propertyId or searchAdId must be provided',
			});
			return;
		}

		let postOwnerId: Types.ObjectId;

		// Fetch the post (property or searchAd)
		if (postType === 'Property') {
			const property = await Property.findById(postId);
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

			postOwnerId = property.owner as Types.ObjectId;
		} else {
			// searchAd
			const searchAd = await SearchAd.findById(postId);
			if (!searchAd) {
				res.status(404).json({
					success: false,
					message: 'Search ad not found',
				});
				return;
			}

			// Check that the user is not proposing collaboration on their own search ad
			if (searchAd.authorId.toString() === userId) {
				res.status(400).json({
					success: false,
					message: 'Cannot collaborate on your own search ad',
				});
				return;
			}

			postOwnerId = searchAd.authorId as Types.ObjectId;
		}

		// Check for existing collaboration
		const existingCollaboration = await Collaboration.findOne({
			postId,
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

		// Block if the post already has an active/pending/accepted collaboration with someone else
		const collabWithAnother = await Collaboration.findOne({
			postId,
			collaboratorId: { $ne: userId },
			status: { $in: ['pending', 'accepted', 'active'] },
		});

		if (collabWithAnother) {
			res.status(409).json({
				success: false,
				message: `${postType === 'Property' ? 'Property' : 'Search ad'} already under collaboration`,
			});
			return;
		}

		// Check if post owner is apporteur and apply special validation
		const postOwner = await User.findById(postOwnerId).select('userType');
		const isApporteurPost = postOwner?.userType === 'apporteur';

		// Validate compensation for apporteur posts
		if (isApporteurPost) {
			if (compensationType === 'percentage' || !compensationType) {
				if (commissionPercentage && commissionPercentage >= 50) {
					res.status(400).json({
						success: false,
						message:
							'Commission percentage must be less than 50% for apporteur posts',
					});
					return;
				}
			} else if (
				compensationType === 'fixed_amount' ||
				compensationType === 'gift_vouchers'
			) {
				if (!compensationAmount || compensationAmount <= 0) {
					res.status(400).json({
						success: false,
						message: 'Compensation amount must be greater than 0',
					});
					return;
				}
			}
		}

		// Determine activity message based on compensation type
		let activityMessage = '';
		if (isApporteurPost && compensationType !== 'percentage') {
			if (compensationType === 'fixed_amount') {
				activityMessage = `Collaboration proposée avec ${compensationAmount}€ de compensation`;
			} else if (compensationType === 'gift_vouchers') {
				activityMessage = `Collaboration proposée avec ${compensationAmount} chèques cadeaux`;
			}
		} else {
			activityMessage = `Collaboration proposée avec ${commissionPercentage || 0}% de commission`;
		}

		const collaboration = new Collaboration({
			postId,
			postType,
			postOwnerId, // Post owner receives the collaboration request
			collaboratorId: userId, // Current authenticated user becomes the collaborator
			proposedCommission: commissionPercentage || 0,
			proposalMessage: message,
			...(isApporteurPost && {
				compensationType,
				compensationAmount,
			}),
			status: 'pending',
			currentStep: 'proposal',
			activities: [
				{
					type: 'proposal',
					message: activityMessage,
					createdBy: new Types.ObjectId(userId),
					createdAt: new Date(),
				},
			],
			ownerSigned: false,
			collaboratorSigned: false,
		});

		await collaboration.save();

		// Notify post owner about new proposal
		const actor = await User.findById(userId).select(
			'firstName lastName email profileImage',
		);
		const actorName = actor
			? actor.firstName
				? `${actor.firstName} ${actor.lastName}`
				: actor.firstName || actor.email
			: 'Someone';
		await notificationService.create({
			recipientId: postOwnerId,
			actorId: userId,
			type: 'collab:proposal_received',
			entity: { type: 'collaboration', id: collaboration._id },
			title: collabTexts.proposalReceivedTitle,
			message: collabTexts.proposalReceivedBody({
				actorName,
				commission: commissionPercentage,
			}),
			data: {
				postId: postId.toString(),
				postType,
				commissionPercentage,
				actorName,
				actorAvatar: actor?.profileImage || undefined,
			},
		});

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
			$or: [{ postOwnerId: userId }, { collaboratorId: userId }],
		})
			.populate('postId')
			.populate('postOwnerId', 'firstName lastName profileImage')
			.populate('collaboratorId', 'firstName lastName profileImage')
			.populate(
				'progressSteps.notes.createdBy',
				'firstName lastName profileImage',
			)
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

		if (collaboration.postOwnerId.toString() !== userId) {
			res.status(403).json({
				success: false,
				message: 'Only post owner can respond',
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

		// Notify collaborator about decision
		const actor = await User.findById(userId).select(
			'firstName lastName email profileImage',
		);
		const actorName = actor
			? actor.firstName
				? `${actor.firstName} ${actor.lastName}`
				: actor.firstName || actor.email
			: 'Someone';
		await notificationService.create({
			recipientId: collaboration.collaboratorId,
			actorId: userId,
			type:
				response === 'accepted'
					? 'collab:proposal_accepted'
					: 'collab:proposal_rejected',
			entity: { type: 'collaboration', id: collaboration._id },
			title:
				response === 'accepted'
					? collabTexts.proposalAcceptedTitle({ actorName })
					: collabTexts.proposalRejectedTitle({ actorName }),
			message:
				response === 'accepted'
					? collabTexts.proposalAcceptedBody({ actorName })
					: collabTexts.proposalRejectedBody({ actorName }),
			data: {
				actorName,
				actorAvatar: actor?.profileImage || undefined,
			},
		});

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

		const isOwner = collaboration.postOwnerId.toString() === userId;
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

		// Notify the other party about the note
		const noteRecipientId = isOwner
			? collaboration.collaboratorId
			: collaboration.postOwnerId;
		// Enrich with actor details for better UX in notifications
		const actor = await User.findById(userId).select(
			'firstName lastName email profileImage',
		);
		const actorName = actor
			? actor.firstName
				? `${actor.firstName} ${actor.lastName || ''}`.trim()
				: actor.firstName || actor.email
			: 'Someone';
		if (process.env.NODE_ENV !== 'test') {
			await notificationService.create({
				recipientId: noteRecipientId,
				actorId: userId,
				type: 'collab:note_added',
				entity: { type: 'collaboration', id: collaboration._id },
				title: `New note from ${actorName}`,
				message: content,
				data: {
					content,
					actorName,
					actorAvatar: actor?.profileImage || undefined,
				},
			});
		}
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

		const collaborations = await Collaboration.find({
			postId: propertyId,
			postType: 'Property',
		})
			.populate('postOwnerId', 'firstName lastName profileImage')
			.populate('collaboratorId', 'firstName lastName profileImage')
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
			.populate('postOwnerId', 'firstName lastName email profileImage')
			.populate(
				'collaboratorId',
				'firstName lastName email profileImage',
			);

		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		// Check if user is involved in this collaboration
		const isOwner = collaboration.postOwnerId._id.toString() === userId;
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

		// Notify the other party about cancellation
		const cancelRecipientId = isOwner
			? collaboration.collaboratorId
			: collaboration.postOwnerId;
		const actor = await User.findById(userId).select(
			'firstName lastName email profileImage',
		);
		const actorName = actor
			? actor.firstName
				? `${actor.firstName} ${actor.lastName || ''}`.trim()
				: actor.firstName || actor.email
			: 'Someone';
		await notificationService.create({
			recipientId: cancelRecipientId,
			actorId: userId,
			type: 'collab:cancelled',
			entity: { type: 'collaboration', id: collaboration._id },
			title: collabTexts.cancelledTitle,
			message: collabTexts.cancelledBody,
			data: {
				actorName,
				actorAvatar: actor?.profileImage || undefined,
			},
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
		const { targetStep, notes, validatedBy } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		// Validate targetStep
		const validSteps = [
			'accord_collaboration',
			'premier_contact',
			'visite_programmee',
			'visite_realisee',
			'retour_client',
			'offre_en_cours',
			'negociation_en_cours',
			'compromis_signe',
			'signature_notaire',
			'affaire_conclue',
		];
		if (!validSteps.includes(targetStep)) {
			res.status(400).json({
				success: false,
				message: 'Invalid target step',
			});
			return;
		}

		// Validate validatedBy
		if (
			!validatedBy ||
			(validatedBy !== 'owner' && validatedBy !== 'collaborator')
		) {
			res.status(400).json({
				success: false,
				message: 'validatedBy must be either "owner" or "collaborator"',
			});
			return;
		}

		// Find the collaboration
		const collaboration = await Collaboration.findById(id)
			.populate('postOwnerId', 'firstName lastName email profileImage')
			.populate('collaboratorId', 'firstName lastName email profileImage')
			.populate({
				path: 'progressSteps.notes.createdBy',
				select: 'firstName lastName profileImage',
			});

		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		// Check authorization
		const isOwner = collaboration.postOwnerId._id.toString() === userId;
		const isCollaborator =
			collaboration.collaboratorId._id.toString() === userId;

		if (!isOwner && !isCollaborator) {
			res.status(403).json({
				success: false,
				message: 'Not authorized to update this collaboration',
			});
			return;
		}

		// Only allow progress updates when collaboration is active or accepted
		if (
			collaboration.status !== 'active' &&
			collaboration.status !== 'accepted'
		) {
			res.status(400).json({
				success: false,
				message:
					'Can only update progress for active or accepted collaborations',
			});
			return;
		}

		// Update progress status using the model method
		await collaboration.updateProgressStatus(
			targetStep,
			notes || undefined,
			new Types.ObjectId(userId),
			validatedBy,
		);

		res.status(200).json({
			success: true,
			message: 'Progress status updated successfully',
			collaboration,
		});

		// Notify the other party about progress update
		const progressRecipientId = isOwner
			? collaboration.collaboratorId
			: collaboration.postOwnerId;
		const actor = await User.findById(userId).select(
			'firstName lastName email profileImage',
		);
		const actorName = actor
			? actor.firstName
				? `${actor.firstName} ${actor.lastName || ''}`.trim()
				: actor.firstName || actor.email
			: 'Someone';

		const stepTitles: Record<string, string> = {
			accord_collaboration: 'Accord de collaboration',
			premier_contact: 'Premier contact client',
			visite_programmee: 'Visite programmée',
			visite_realisee: 'Visite réalisée',
			retour_client: 'Retour client',
			offre_en_cours: 'Offre en cours',
			negociation_en_cours: 'Négociation en cours',
			compromis_signe: 'Compromis signé',
			signature_notaire: 'Signature notaire',
			affaire_conclue: 'Affaire conclue',
		};

		await notificationService.create({
			recipientId: progressRecipientId,
			actorId: userId,
			type: 'collab:progress_updated',
			entity: { type: 'collaboration', id: collaboration._id },
			title: collabTexts.progressUpdatedTitle,
			message: collabTexts.progressUpdatedBody({
				step: stepTitles[targetStep] || targetStep,
			}),
			data: {
				targetStep,
				notes: notes || '',
				actorName,
				actorAvatar: actor?.profileImage || undefined,
				validatedBy,
			},
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
			.populate('postOwnerId', 'firstName lastName email profileImage')
			.populate(
				'collaboratorId',
				'firstName lastName email profileImage',
			);

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

		// Notify the other party about signing
		const isOwner = collaboration.postOwnerId._id
			? collaboration.postOwnerId._id.toString() === userId
			: collaboration.postOwnerId.toString() === userId;
		const signRecipientId = isOwner
			? collaboration.collaboratorId
			: collaboration.postOwnerId;
		const actor = await User.findById(userId).select(
			'firstName lastName email profileImage',
		);
		const actorName = actor
			? actor.firstName
				? `${actor.firstName} ${actor.lastName || ''}`.trim()
				: actor.firstName || actor.email
			: 'Someone';
		await notificationService.create({
			recipientId: signRecipientId,
			actorId: userId,
			type: 'contract:signed',
			entity: { type: 'collaboration', id: collaboration._id },
			title: 'Contract signed',
			message: 'The contract has been signed.',
			data: {
				actorName,
				actorAvatar: actor?.profileImage || undefined,
			},
		});

		// If both have signed and it became active, notify activation
		if (collaboration.ownerSigned && collaboration.collaboratorSigned) {
			await notificationService.create({
				recipientId: signRecipientId, // both sides will be notified separately on their own action
				actorId: userId,
				type: 'collab:activated',
				entity: { type: 'collaboration', id: collaboration._id },
				title: 'Collaboration activated',
				message: 'Collaboration is now active.',
				data: {
					actorName,
					actorAvatar: actor?.profileImage || undefined,
				},
			});
		}
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
			.populate('postOwnerId', 'firstName lastName email profileImage')
			.populate(
				'collaboratorId',
				'firstName lastName email profileImage',
			);

		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration not found',
			});
			return;
		}

		// Check authorization
		const isOwner = collaboration.postOwnerId._id.toString() === userId;
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

		// Update status to completed
		collaboration.status = 'completed';
		collaboration.currentStep = 'completed';
		collaboration.completedAt = new Date();

		// Mark all progress steps as completed
		collaboration.progressSteps.forEach((step) => {
			if (!step.completed) {
				step.completed = true;
				step.ownerValidated = true;
				step.collaboratorValidated = true;
			}
		});

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

		// Notify the other party about completion
		const completeRecipientId = isOwner
			? collaboration.collaboratorId
			: collaboration.postOwnerId;
		const actor = await User.findById(userId).select(
			'firstName lastName email profileImage',
		);
		const actorName = actor
			? actor.firstName
				? `${actor.firstName} ${actor.lastName || ''}`.trim()
				: actor.firstName || actor.email
			: 'Someone';
		await notificationService.create({
			recipientId: completeRecipientId,
			actorId: userId,
			type: 'collab:completed',
			entity: { type: 'collaboration', id: collaboration._id },
			title: collabTexts.completedTitle,
			message: collabTexts.completedBody,
			data: {
				actorName,
				actorAvatar: actor?.profileImage || undefined,
			},
		});
	} catch (error) {
		console.error('Error completing collaboration:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const getCollaborationsBySearchAd = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { searchAdId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		const collaborations = await Collaboration.find({
			postId: searchAdId,
			postType: 'SearchAd',
		})
			.populate('postOwnerId', 'firstName lastName profileImage')
			.populate('collaboratorId', 'firstName lastName profileImage')
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			collaborations,
		});
	} catch (error) {
		console.error('Error getting search ad collaborations:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};
