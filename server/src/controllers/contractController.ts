import { Request, Response } from 'express';
import { Collaboration } from '../models/Collaboration';
import { notificationService } from '../services/notificationService';
import { Types } from 'mongoose';
import { User } from '../models/User';

interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		userType: string;
	};
}

interface PopulatedUser {
	_id: Types.ObjectId;
	firstName: string;
	lastName: string;
	email: string;
	profileImage?: string | null;
}

export const signContract = async (
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
			.populate(
				'postOwnerId',
				'firstName lastName email profileImage',
			)
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

		if (collaboration.status !== 'accepted') {
			res.status(400).json({
				success: false,
				message: 'Collaboration must be accepted first',
			});
			return;
		}

		const isOwner = collaboration.postOwnerId._id.toString() === userId;
		const isCollaborator =
			collaboration.collaboratorId._id.toString() === userId;

		if (!isOwner && !isCollaborator) {
			res.status(403).json({
				success: false,
				message: 'Not authorized to sign this contract',
			});
			return;
		}

		// Sign the contract
		const signedAt = new Date();
		if (isOwner) {
			collaboration.ownerSigned = true;
			collaboration.ownerSignedAt = signedAt;
		}
		if (isCollaborator) {
			collaboration.collaboratorSigned = true;
			collaboration.collaboratorSignedAt = signedAt;
		}

		// Add activity log
		collaboration.activities.push({
			type: 'signing',
			message: `Contract signed by ${isOwner ? 'property owner' : 'collaborator'}`,
			createdBy: new Types.ObjectId(userId),
			createdAt: signedAt,
		});

		// If both parties have signed, activate the collaboration
		if (collaboration.ownerSigned && collaboration.collaboratorSigned) {
			collaboration.status = 'active';
			collaboration.currentStep = 'active';

			collaboration.activities.push({
				type: 'status_update',
				message:
					'Collaboration activated - both parties have signed the contract',
				createdBy: new Types.ObjectId(userId),
				createdAt: signedAt,
			});
		}

		await collaboration.save();

		// Return the contract data structure
		const contractData = {
			id: collaboration._id,
			contractText: collaboration.contractText,
			additionalTerms: collaboration.additionalTerms,
			contractModified: collaboration.contractModified,
			ownerSigned: collaboration.ownerSigned,
			ownerSignedAt: collaboration.ownerSignedAt,
			collaboratorSigned: collaboration.collaboratorSigned,
			collaboratorSignedAt: collaboration.collaboratorSignedAt,
			status: collaboration.status,
			currentStep: collaboration.currentStep,
			propertyOwner: {
				id: collaboration.postOwnerId._id,
				name: `${(collaboration.postOwnerId as unknown as PopulatedUser).firstName} ${(collaboration.postOwnerId as unknown as PopulatedUser).lastName}`,
				email: (
					collaboration.postOwnerId as unknown as PopulatedUser
				).email,
				profileImage:
					(collaboration.postOwnerId as unknown as PopulatedUser)
						.profileImage || null,
			},
			collaborator: {
				id: collaboration.collaboratorId._id,
				name: `${(collaboration.collaboratorId as unknown as PopulatedUser).firstName} ${(collaboration.collaboratorId as unknown as PopulatedUser).lastName}`,
				email: (
					collaboration.collaboratorId as unknown as PopulatedUser
				).email,
				profileImage:
					(collaboration.collaboratorId as unknown as PopulatedUser)
						.profileImage || null,
			},
			canEdit: isOwner || isCollaborator,
			canSign:
				(isOwner && !collaboration.ownerSigned) ||
				(isCollaborator && !collaboration.collaboratorSigned),
			requiresBothSignatures:
				collaboration.ownerSigned !== collaboration.collaboratorSigned,
		};

		res.status(200).json({
			success: true,
			message: 'Contract signed successfully',
			contract: contractData,
		});

		// Notify the other party about signing
		const signRecipientId = isOwner
			? collaboration.collaboratorId._id
			: collaboration.postOwnerId._id;
		const signer = await User.findById(userId).select(
			'firstName lastName email profileImage',
		);
		const signerName = signer
			? signer.firstName
				? `${signer.firstName} ${signer.lastName}`
				: signer.firstName || signer.email
			: 'Someone';
		await notificationService.create({
			recipientId: signRecipientId,
			actorId: userId,
			type: 'contract:signed',
			entity: { type: 'collaboration', id: collaboration._id },
			title: 'Contract signed',
			message: `${signerName} signed the contract.`,
			data: {
				actorName: signerName,
				actorAvatar: signer?.profileImage || undefined,
			},
		});

		// If both have signed and it became active, notify activation
		if (collaboration.ownerSigned && collaboration.collaboratorSigned) {
			const otherPartyId = isOwner
				? collaboration.postOwnerId._id
				: collaboration.collaboratorId._id;
			await notificationService.create({
				recipientId: otherPartyId,
				actorId: userId,
				type: 'collab:activated',
				entity: { type: 'collaboration', id: collaboration._id },
				title: 'Collaboration activated',
				message: `Collaboration is now active. Activated by ${signerName}.`,
				data: {
					actorName: signerName,
					actorAvatar: signer?.profileImage || undefined,
				},
			});
		}
	} catch (error) {
		console.error('Error signing contract:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const updateContract = async (
	req: AuthenticatedRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { contractText, additionalTerms } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			res.status(401).json({ success: false, message: 'Unauthorized' });
			return;
		}

		const collaboration = await Collaboration.findById(id)
			.populate(
				'postOwnerId',
				'firstName lastName email profileImage',
			)
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

		if (collaboration.status !== 'accepted') {
			res.status(400).json({
				success: false,
				message:
					'Contract can only be edited for accepted collaborations',
			});
			return;
		}

		// Check if user is part of this collaboration
		const isOwner = collaboration.postOwnerId._id.toString() === userId;
		const isCollaborator =
			collaboration.collaboratorId._id.toString() === userId;

		if (!isOwner && !isCollaborator) {
			res.status(403).json({
				success: false,
				message: 'You are not authorized to update this contract',
			});
			return;
		}

		// Check if content actually changed
		const contractChanged =
			collaboration.contractText !== contractText ||
			collaboration.additionalTerms !== additionalTerms;

		if (contractChanged) {
			// Reset ALL signatures when contract is modified by ANYONE
			const wasOwnerSigned = collaboration.ownerSigned;
			const wasCollaboratorSigned = collaboration.collaboratorSigned;

			collaboration.ownerSigned = false;
			collaboration.collaboratorSigned = false;
			collaboration.ownerSignedAt = undefined;
			collaboration.collaboratorSignedAt = undefined;
			collaboration.contractModified = true;
			collaboration.contractLastModifiedBy = new Types.ObjectId(userId);
			collaboration.contractLastModifiedAt = new Date();

			// Add activity log for contract modification
			collaboration.activities.push({
				type: 'note',
				message: `Contract modified by ${isOwner ? 'property owner' : 'collaborator'}${wasOwnerSigned || wasCollaboratorSigned ? ' - signatures reset, both parties must sign again' : ''}`,
				createdBy: new Types.ObjectId(userId),
				createdAt: new Date(),
			});
		}

		collaboration.contractText = contractText;
		collaboration.additionalTerms = additionalTerms;

		await collaboration.save();

		// Return the contract data structure
		const contractData = {
			id: collaboration._id,
			contractText: collaboration.contractText,
			additionalTerms: collaboration.additionalTerms,
			contractModified: collaboration.contractModified,
			ownerSigned: collaboration.ownerSigned,
			ownerSignedAt: collaboration.ownerSignedAt,
			collaboratorSigned: collaboration.collaboratorSigned,
			collaboratorSignedAt: collaboration.collaboratorSignedAt,
			status: collaboration.status,
			currentStep: collaboration.currentStep,
			propertyOwner: {
				id: collaboration.postOwnerId._id,
				name: `${(collaboration.postOwnerId as unknown as PopulatedUser).firstName} ${(collaboration.postOwnerId as unknown as PopulatedUser).lastName}`,
				email: (
					collaboration.postOwnerId as unknown as PopulatedUser
				).email,
				profileImage:
					(collaboration.postOwnerId as unknown as PopulatedUser)
						.profileImage || null,
			},
			collaborator: {
				id: collaboration.collaboratorId._id,
				name: `${(collaboration.collaboratorId as unknown as PopulatedUser).firstName} ${(collaboration.collaboratorId as unknown as PopulatedUser).lastName}`,
				email: (
					collaboration.collaboratorId as unknown as PopulatedUser
				).email,
				profileImage:
					(collaboration.collaboratorId as unknown as PopulatedUser)
						.profileImage || null,
			},
			canEdit: isOwner || isCollaborator,
			canSign:
				(isOwner && !collaboration.ownerSigned) ||
				(isCollaborator && !collaboration.collaboratorSigned),
			requiresBothSignatures:
				collaboration.ownerSigned !== collaboration.collaboratorSigned,
		};

		res.status(200).json({
			success: true,
			message: contractChanged
				? 'Contract updated successfully - both parties must sign again'
				: 'Contract updated successfully',
			contract: contractData,
			requiresResigning: contractChanged,
		});

		// Notify the other party on contract update when changed
		if (contractChanged) {
			const updateRecipientId = isOwner
				? collaboration.collaboratorId._id
				: collaboration.postOwnerId._id;
			const actor = await User.findById(userId).select(
				'firstName lastName email profileImage',
			);
			const actorName = actor
				? actor.firstName
					? `${actor.firstName} ${actor.lastName || ''}`.trim()
					: actor.firstName || actor.email
				: 'Someone';
			await notificationService.create({
				recipientId: updateRecipientId,
				actorId: userId,
				type: 'contract:updated',
				entity: { type: 'collaboration', id: collaboration._id },
				title: 'Contract updated',
				message:
					'Contract content changed. Signatures reset; both must sign again.',
				data: {
					actorName,
					actorAvatar: actor?.profileImage || undefined,
				},
			});
		}
	} catch (error) {
		console.error('Error updating contract:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

export const getContract = async (
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
			.populate(
				'postOwnerId',
				'firstName lastName email profileImage',
			)
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

		// Check if user is part of this collaboration
		const isOwner = collaboration.postOwnerId._id.toString() === userId;
		const isCollaborator =
			collaboration.collaboratorId._id.toString() === userId;

		if (!isOwner && !isCollaborator) {
			res.status(403).json({
				success: false,
				message: 'You are not authorized to view this contract',
			});
			return;
		}

		// Auto-generate default contract template if empty
		if (
			!collaboration.contractText ||
			collaboration.contractText.trim() === ''
		) {
			const ownerName = `${(collaboration.postOwnerId as unknown as PopulatedUser).firstName} ${(collaboration.postOwnerId as unknown as PopulatedUser).lastName}`;
			const collaboratorName = `${(collaboration.collaboratorId as unknown as PopulatedUser).firstName} ${(collaboration.collaboratorId as unknown as PopulatedUser).lastName}`;
			const ownerCommission = 100 - collaboration.proposedCommission;
			const collaboratorCommission = collaboration.proposedCommission;

			const defaultTemplate = `CONTRAT DE COLLABORATION IMMOBILIÈRE

ENTRE LES SOUSSIGNÉS :

D'une part,
${ownerName}
Agent immobilier propriétaire du bien
Ci-après dénommé « L'AGENT PROPRIÉTAIRE »

Et d'autre part,
${collaboratorName}
Agent immobilier apporteur
Ci-après dénommé « L'AGENT APPORTEUR »

ARTICLE 1 - OBJET DU CONTRAT
Le présent contrat a pour objet de définir les modalités de collaboration entre les deux agents immobiliers pour la vente du bien immobilier référencé dans cette collaboration.

ARTICLE 2 - OBLIGATIONS DE L'AGENT PROPRIÉTAIRE
L'Agent Propriétaire s'engage à :
- Fournir toutes les informations nécessaires concernant le bien
- Assurer la coordination des visites
- Gérer les aspects administratifs et juridiques de la vente

ARTICLE 3 - OBLIGATIONS DE L'AGENT APPORTEUR
L'Agent Apporteur s'engage à :
- Prospecter activement pour trouver des acquéreurs potentiels
- Organiser les visites en coordination avec l'Agent Propriétaire
- Assurer le suivi des clients prospects

ARTICLE 4 - RÉPARTITION DES COMMISSIONS
La commission sera répartie comme suit :
- Agent Propriétaire : ${ownerCommission}%
- Agent Apporteur : ${collaboratorCommission}%

ARTICLE 5 - DURÉE
Le présent contrat prend effet à compter de sa signature par les deux parties et reste valable jusqu'à la finalisation de la vente ou résiliation par l'une des parties.

ARTICLE 6 - RÉSILIATION
Chaque partie peut résilier le présent contrat moyennant un préavis de 7 jours par notification écrite.

Fait en deux exemplaires originaux.

Date : ${new Date().toLocaleDateString('fr-FR')}`;

			collaboration.contractText = defaultTemplate;
			collaboration.contractModified = false;
			await collaboration.save();
		}

		// Extract contract-specific data
		const contractData = {
			id: collaboration._id,
			contractText: collaboration.contractText,
			additionalTerms: collaboration.additionalTerms,
			contractModified: collaboration.contractModified,
			ownerSigned: collaboration.ownerSigned,
			ownerSignedAt: collaboration.ownerSignedAt,
			collaboratorSigned: collaboration.collaboratorSigned,
			collaboratorSignedAt: collaboration.collaboratorSignedAt,
			status: collaboration.status,
			currentStep: collaboration.currentStep,
			propertyOwner: {
				id: collaboration.postOwnerId._id,
				name: `${(collaboration.postOwnerId as unknown as PopulatedUser).firstName} ${(collaboration.postOwnerId as unknown as PopulatedUser).lastName}`,
				email: (
					collaboration.postOwnerId as unknown as PopulatedUser
				).email,
				profileImage:
					(collaboration.postOwnerId as unknown as PopulatedUser)
						.profileImage || null,
			},
			collaborator: {
				id: collaboration.collaboratorId._id,
				name: `${(collaboration.collaboratorId as unknown as PopulatedUser).firstName} ${(collaboration.collaboratorId as unknown as PopulatedUser).lastName}`,
				email: (
					collaboration.collaboratorId as unknown as PopulatedUser
				).email,
				profileImage:
					(collaboration.collaboratorId as unknown as PopulatedUser)
						.profileImage || null,
			},
			canEdit: isOwner || isCollaborator,
			canSign:
				(isOwner && !collaboration.ownerSigned) ||
				(isCollaborator && !collaboration.collaboratorSigned),
			requiresBothSignatures:
				collaboration.ownerSigned !== collaboration.collaboratorSigned,
		};

		res.status(200).json({
			success: true,
			contract: contractData,
		});
	} catch (error) {
		console.error('Error fetching contract:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};
