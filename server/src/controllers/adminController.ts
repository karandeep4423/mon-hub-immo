import { User } from '../models/User';
import { Property } from '../models/Property'; // ou ton modèle d'annonces
import { Collaboration } from '../models/Collaboration'; // idem pour collaborations
import Message from '../models/Chat';
import { SearchAd } from '../models/SearchAd';
import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import mongoose from 'mongoose';
import { SecurityLog } from '../models/SecurityLog';
import { PendingVerification } from '../models/PendingVerification';
import crypto from 'crypto';
import { logSecurityEvent } from '../utils/securityLogger';
import { logger } from '../utils/logger';
import { createSafeRegex } from '../utils/sanitize';
import {
	generateVerificationCode,
	sendAccountValidated,
	sendPaymentReminderEmail,
	sendEmail,
} from '../utils/emailService';
import { getAdminCreatedAccountTemplate } from '../utils/email/templates/adminCreatedAccount';

// Controller exports are declared inline with each function below

export const getAdminUsers = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest;
		const actorId = authReq.userId || authReq.user?.id || null;
		// Lecture des filtres via req.query
		const { name, userType, network, isValidated, isBlocked } = req.query;
		logger.info('[AdminController] getAdminUsers called', {
			actorId,
			filters: { name, userType, network, isValidated, isBlocked },
		});
		// Construction dynamique des filtres
		const filter: Record<string, unknown> = {};
		if (typeof name === 'string' && name.trim() !== '') {
			const safeNameRegex = createSafeRegex(name.trim());
			filter.$or = [
				{ firstName: safeNameRegex },
				{ lastName: safeNameRegex },
			];
		}

		if (userType) filter.userType = userType;
		if (isValidated !== undefined)
			filter.isValidated = isValidated === 'true';
		if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
		if (network) filter['professionalInfo.network'] = network;

		// On récupère les users filtrés
		const users = await User.find(filter).lean();

		// Calcul statistiques par user
		const userIds = users.map((u) => u._id);
		// Annonces: Property documents use `owner` as the owner reference (not agentId)
		const propsCounts = await Property.aggregate([
			{ $match: { owner: { $in: userIds } } },
			{ $group: { _id: '$owner', count: { $sum: 1 } } },
		]);
		// Collabs actives/clôturées
		// Collaborations: schema uses `postOwnerId` and `collaboratorId` and statuses include 'completed'
		// We aggregate separately for postOwnerId and collaboratorId and then combine counts per user id.
		const collabCountsOwner = await Collaboration.aggregate([
			{ $match: { postOwnerId: { $in: userIds } } },
			{
				$group: {
					_id: '$postOwnerId',
					active: {
						$sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
					},
					closed: {
						$sum: {
							$cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
						},
					},
				},
			},
		]);
		const collabCountsCollaborator = await Collaboration.aggregate([
			{ $match: { collaboratorId: { $in: userIds } } },
			{
				$group: {
					_id: '$collaboratorId',
					active: {
						$sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
					},
					closed: {
						$sum: {
							$cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
						},
					},
				},
			},
		]);
		// Connection counts (login successes) from security logs
		const connectionCounts = await SecurityLog.aggregate([
			{
				$match: {
					userId: { $in: userIds },
					eventType: 'login_success',
				},
			},
			{ $group: { _id: '$userId', count: { $sum: 1 } } },
		]);
		// On map les stats sur chaque user
		// Build lookup maps keyed by string userId to avoid ObjectId/string mismatches
		const propsMap: Record<string, number> = {};
		for (const p of propsCounts) {
			const k = String(p._id);
			propsMap[k] = p.count || 0;
		}
		const collabMapActive: Record<string, number> = {};
		const collabMapClosed: Record<string, number> = {};
		// aggregate owner counts
		for (const c of collabCountsOwner) {
			const k = String(c._id);
			collabMapActive[k] = (collabMapActive[k] || 0) + (c.active || 0);
			collabMapClosed[k] = (collabMapClosed[k] || 0) + (c.closed || 0);
		}
		// aggregate collaborator counts
		for (const c of collabCountsCollaborator) {
			const k = String(c._id);
			collabMapActive[k] = (collabMapActive[k] || 0) + (c.active || 0);
			collabMapClosed[k] = (collabMapClosed[k] || 0) + (c.closed || 0);
		}
		const connMap: Record<string, number> = {};
		for (const cc of connectionCounts) {
			const k = String(cc._id);
			connMap[k] = cc.count || 0;
		}

		const usersWithStats = users.map((u) => {
			const user = u as unknown as {
				_id: mongoose.Types.ObjectId;
				lastSeen?: Date;
				isBlocked?: boolean;
				isValidated?: boolean;
			};
			const uid = String(user._id);
			return {
				...u,
				propertiesCount: propsMap[uid] || 0,
				collaborationsActive: collabMapActive[uid] || 0,
				collaborationsClosed: collabMapClosed[uid] || 0,
				connectionsCount: connMap[uid] || 0,
				lastActive: user.lastSeen
					? new Date(user.lastSeen).toISOString()
					: undefined,
				// derive status for admin UI
				status: user.isBlocked
					? 'blocked'
					: user.isValidated
						? 'active'
						: 'pending',
			};
		});

		logger.info('[AdminController] getAdminUsers success', {
			actorId,
			count: usersWithStats.length,
		});
		res.json(usersWithStats);
	} catch (error) {
		logger.error('[AdminController] getAdminUsers failed', {
			error: error instanceof Error ? error.message : String(error),
		});
		res.status(500).json({ error: 'Failed to fetch admin users' });
	}
};

export const validateUser = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.params.id;
		const { value } = req.body;
		const adminId = req.userId;

		logger.info('[AdminController] validateUser called', {
			adminId,
			userId,
			value: !!value,
		});

		const user = await User.findById(userId);
		if (!user)
			return res.status(404).json({ error: 'Utilisateur non trouvé' });

		user.isValidated = !!value;
		user.validatedAt = value ? new Date() : undefined;
		user.validatedBy = value
			? adminId
				? new mongoose.Types.ObjectId(adminId)
				: undefined
			: undefined;
		await user.save();

		// Log security event for validation/unvalidation
		await logSecurityEvent({
			userId: (user._id as unknown as string).toString(),
			eventType: 'account_validated',
			req,
			metadata: { validatedBy: adminId, value: !!value },
		});
		// If user validated -> send confirmation email
		if (value) {
			try {
				logger.info(
					'[AdminController] Sending account validation email',
					{
						to: user.email,
						name: `${user.firstName} ${user.lastName}`,
					},
				);
				await sendAccountValidated({
					to: user.email,
					name: `${user.firstName} ${user.lastName}`,
					email: user.email,
				});
				logger.info(
					'[AdminController] Account validation email sent successfully',
				);
			} catch (emailError) {
				// Log but don't fail the response
				logger.error(
					'[AdminController] Failed to send account validation email',
					{
						error:
							emailError instanceof Error
								? emailError.message
								: String(emailError),
						userId,
						userEmail: user.email,
					},
				);
				await logSecurityEvent({
					userId: (user._id as unknown as string).toString(),
					eventType: 'email_send_failed',
					req,
					metadata: {
						error: String(emailError),
						emailType: 'account_validated',
					},
				});
			}
		}

		logger.info('[AdminController] validateUser success', {
			adminId,
			userId,
		});
		res.json({ success: true, user });
	} catch (error) {
		logger.error('[AdminController] validateUser failed', {
			error: error instanceof Error ? error.message : String(error),
		});
		res.status(500).json({ error: 'Failed to validate user' });
	}
};

// Block a user (admin)
export const blockUser = async (req: AuthRequest, res: Response) => {
	const userId = req.params.id;
	if (!userId) return res.status(400).json({ error: 'Missing user id' });
	const adminId = req.userId;

	try {
		logger.info('[AdminController] blockUser called', { adminId, userId });
		const user = await User.findById(userId);
		if (!user)
			return res.status(404).json({ error: 'Utilisateur non trouvé' });

		user.isBlocked = true;
		user.blockedAt = new Date();
		user.blockedBy = adminId
			? new mongoose.Types.ObjectId(adminId)
			: undefined;
		await user.save();

		// log security event
		await logSecurityEvent({
			userId: userId as unknown as string,
			eventType: 'account_blocked',
			req,
			metadata: { blockedBy: adminId },
		});

		logger.info('[AdminController] blockUser success', { adminId, userId });
		res.json({ success: true, user });
	} catch (error) {
		logger.error('[AdminController] blockUser failed', {
			error: error instanceof Error ? error.message : String(error),
			adminId,
			userId,
		});
		res.status(500).json({
			error: 'Failed to block user',
			details: (error as Error).message,
		});
	}
};

// Unblock a user (admin)
export const unblockUser = async (req: AuthRequest, res: Response) => {
	const userId = req.params.id;
	if (!userId) return res.status(400).json({ error: 'Missing user id' });
	const adminId = req.userId;

	try {
		logger.info('[AdminController] unblockUser called', {
			adminId,
			userId,
		});
		const user = await User.findById(userId);
		if (!user)
			return res.status(404).json({ error: 'Utilisateur non trouvé' });

		user.isBlocked = false;
		user.blockedAt = undefined;
		user.blockedBy = undefined;
		await user.save();

		// log security event
		await logSecurityEvent({
			userId: userId as unknown as string,
			eventType: 'account_unblocked',
			req,
			metadata: { unblockedBy: adminId },
		});

		logger.info('[AdminController] unblockUser success', {
			adminId,
			userId,
		});
		res.json({ success: true, user });
	} catch (error) {
		logger.error('[AdminController] unblockUser failed', {
			error: error instanceof Error ? error.message : String(error),
			adminId,
			userId,
		});
		res.status(500).json({
			error: 'Failed to unblock user',
			details: (error as Error).message,
		});
	}
};

// Grant access to a user (admin override)
export const grantAdminAccess = async (req: AuthRequest, res: Response) => {
	const userId = req.params.id;
	if (!userId) return res.status(400).json({ error: 'Missing user id' });
	const adminId = req.userId;

	try {
		logger.info('[AdminController] grantAdminAccess called', {
			adminId,
			userId,
		});
		const user = await User.findById(userId);
		if (!user)
			return res.status(404).json({ error: 'Utilisateur non trouvé' });

		user.accessGrantedByAdmin = true;
		await user.save();

		// log security event
		await logSecurityEvent({
			userId: userId,
			eventType: 'account_access_granted',
			req,
			metadata: { grantedBy: adminId },
		});

		logger.info('[AdminController] grantAdminAccess success', {
			adminId,
			userId,
		});
		res.json({ success: true, user });
	} catch (error) {
		logger.error('[AdminController] grantAdminAccess failed', {
			error: error instanceof Error ? error.message : String(error),
			adminId,
			userId,
		});
		res.status(500).json({
			error: 'Failed to grant access',
			details: (error as Error).message,
		});
	}
};

// Revoke access from a user (admin override)
export const revokeAdminAccess = async (req: AuthRequest, res: Response) => {
	const userId = req.params.id;
	if (!userId) return res.status(400).json({ error: 'Missing user id' });
	const adminId = req.userId;

	try {
		logger.info('[AdminController] revokeAdminAccess called', {
			adminId,
			userId,
		});
		const user = await User.findById(userId);
		if (!user)
			return res.status(404).json({ error: 'Utilisateur non trouvé' });

		user.accessGrantedByAdmin = false;
		await user.save();

		// log security event
		await logSecurityEvent({
			userId: userId,
			eventType: 'account_access_revoked',
			req,
			metadata: { revokedBy: adminId },
		});

		logger.info('[AdminController] revokeAdminAccess success', {
			adminId,
			userId,
		});
		res.json({ success: true, user });
	} catch (error) {
		logger.error('[AdminController] revokeAdminAccess failed', {
			error: error instanceof Error ? error.message : String(error),
			adminId,
			userId,
		});
		res.status(500).json({
			error: 'Failed to revoke access',
			details: (error as Error).message,
		});
	}
};

// Get detailed user profile for admin (with simple related counts)
export const getAdminUserProfile = async (req: Request, res: Response) => {
	try {
		const userId = req.params.id;
		if (!userId) return res.status(400).json({ error: 'Missing user id' });
		logger.info('[AdminController] getAdminUserProfile called', {
			actorId:
				(req as AuthRequest).userId ||
				(req as AuthRequest).user?.id ||
				null,
			userId,
		});

		const user = await User.findById(userId).lean();
		if (!user)
			return res.status(404).json({ error: 'Utilisateur non trouvé' });

		// related counts
		const propertiesCount = await Property.countDocuments({
			agentId: user._id,
		});
		const collaborationsCount = await Collaboration.countDocuments({
			agentId: user._id,
		});

		logger.info('[AdminController] getAdminUserProfile success', {
			userId,
		});
		res.json({ ...user, propertiesCount, collaborationsCount });
	} catch (error) {
		logger.error('[AdminController] getAdminUserProfile failed', {
			error: error instanceof Error ? error.message : String(error),
		});
		res.status(500).json({ error: 'Failed to fetch admin user profile' });
	}
};

// Per-user detailed stats (properties count, collaborations active/closed, search ads, messages, etc.)
export const getAdminUserStats = async (req: Request, res: Response) => {
	const userId = req.params.id;
	if (!userId) return res.status(400).json({ error: 'Missing user id' });

	try {
		logger.info('[AdminController] getAdminUserStats called', {
			actorId:
				(req as AuthRequest).userId ||
				(req as AuthRequest).user?.id ||
				null,
			userId,
		});
		const uid = new mongoose.Types.ObjectId(userId);

		// Get user for additional info (last login, created at)
		const user = await User.findById(uid).select(
			'lastLogin createdAt loginCount',
		);

		// Run all counts in parallel for better performance
		const [
			propertiesCount,
			searchAdsCount,
			messagesCount,
			ownerAgg,
			collabAgg,
		] = await Promise.all([
			// Properties: count documents owned by this user
			Property.countDocuments({ owner: uid }),
			// Search Ads: count documents authored by this user
			SearchAd.countDocuments({ authorId: uid }),
			// Messages: count messages sent by this user
			Message.countDocuments({ senderId: uid }),
			// Collaborations as post owner
			Collaboration.aggregate([
				{ $match: { postOwnerId: uid } },
				{
					$group: {
						_id: '$postOwnerId',
						active: {
							$sum: {
								$cond: [{ $eq: ['$status', 'active'] }, 1, 0],
							},
						},
						pending: {
							$sum: {
								$cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
							},
						},
						closed: {
							$sum: {
								$cond: [
									{ $eq: ['$status', 'completed'] },
									1,
									0,
								],
							},
						},
						cancelled: {
							$sum: {
								$cond: [
									{ $eq: ['$status', 'cancelled'] },
									1,
									0,
								],
							},
						},
					},
				},
			]),
			// Collaborations as collaborator
			Collaboration.aggregate([
				{ $match: { collaboratorId: uid } },
				{
					$group: {
						_id: '$collaboratorId',
						active: {
							$sum: {
								$cond: [{ $eq: ['$status', 'active'] }, 1, 0],
							},
						},
						pending: {
							$sum: {
								$cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
							},
						},
						closed: {
							$sum: {
								$cond: [
									{ $eq: ['$status', 'completed'] },
									1,
									0,
								],
							},
						},
						cancelled: {
							$sum: {
								$cond: [
									{ $eq: ['$status', 'cancelled'] },
									1,
									0,
								],
							},
						},
					},
				},
			]),
		]);

		const collaborationsActive =
			(ownerAgg[0]?.active || 0) + (collabAgg[0]?.active || 0);
		const collaborationsPending =
			(ownerAgg[0]?.pending || 0) + (collabAgg[0]?.pending || 0);
		const collaborationsClosed =
			(ownerAgg[0]?.closed || 0) + (collabAgg[0]?.closed || 0);
		const collaborationsCancelled =
			(ownerAgg[0]?.cancelled || 0) + (collabAgg[0]?.cancelled || 0);
		const collaborationsTotal =
			collaborationsActive +
			collaborationsPending +
			collaborationsClosed +
			collaborationsCancelled;

		logger.info('[AdminController] getAdminUserStats success', {
			userId,
			propertiesCount,
			searchAdsCount,
			messagesCount,
			collaborationsActive,
			collaborationsClosed,
		});

		res.json({
			propertiesCount,
			searchAdsCount,
			messagesCount,
			collaborationsActive,
			collaborationsPending,
			collaborationsClosed,
			collaborationsCancelled,
			collaborationsTotal,
			memberSince: user?.createdAt || null,
		});
	} catch (err) {
		logger.error('[AdminController] getAdminUserStats failed', {
			error: err instanceof Error ? err.message : String(err),
			userId,
		});
		res.status(500).json({
			error: 'Failed to compute user stats',
			details: (err as Error).message,
		});
	}
};

// Create an admin user (basic)
export const createAdminUser = async (req: AuthRequest, res: Response) => {
	try {
		const payload = req.body || {};
		// Minimal required fields: email
		if (!payload.email)
			return res.status(400).json({ error: 'Email required' });

		logger.info('[AdminController] createAdminUser called', {
			adminId: req.userId,
			email: payload.email,
			userType: payload.userType || 'apporteur',
			flags: {
				isValidated: payload.isValidated ?? false,
				sendInvite: payload.sendInvite,
				sendRandomPassword: payload.sendRandomPassword,
				providedPassword: Boolean(payload.password),
			},
		});

		const existing = await User.findOne({ email: payload.email });
		if (existing)
			return res.status(409).json({
				message: 'User already exists',
				error: 'User already exists',
			});

		const newUser = new User({
			firstName: payload.firstName || '',
			lastName: payload.lastName || '',
			email: payload.email,
			userType: payload.userType || 'apporteur',
			isValidated: payload.isValidated ?? false,
			validatedAt: payload.isValidated ? new Date() : undefined,
			validatedBy:
				payload.isValidated && req.userId
					? new mongoose.Types.ObjectId(req.userId)
					: undefined,
			professionalInfo: payload.professionalInfo || undefined,
			phone: payload.phone || undefined,
			profileImage: payload.profileImage || undefined,
			// If admin provided a password at creation time, use it; otherwise we'll set an invite token below
			...(payload.password ? { password: payload.password } : {}),
		});
		// If admin requested a random temporary password, generate one and require change on first login
		const sendRandomPassword =
			payload.sendRandomPassword === true ||
			payload.sendRandomPassword === 'true';
		let generatedTempPassword: string | undefined;
		if (sendRandomPassword && !payload.password) {
			// Generate a 12-character temporary password with letters/numbers/symbols
			const chars =
				'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
			let pwd = '';
			for (let i = 0; i < 12; i++)
				pwd += chars[Math.floor(Math.random() * chars.length)];
			generatedTempPassword = pwd;
			(newUser as { password?: string }).password = generatedTempPassword;
			(newUser as { mustChangePassword?: boolean }).mustChangePassword =
				true;
			// Email NOT verified - user must verify first before using temp password
			(newUser as { isEmailVerified?: boolean }).isEmailVerified = false;
		}
		// Determine invite behavior
		const sendInvite =
			payload.sendInvite === undefined
				? !payload.password
				: !!payload.sendInvite;
		if (sendInvite && !payload.password) {
			// Generate a secure invite token to let the user define their password for the first time
			const token = crypto.randomBytes(32).toString('hex');
			newUser.passwordResetCode = token;
			// Invite links valid for 24 hours
			newUser.passwordResetExpires = new Date(
				Date.now() + 24 * 60 * 60 * 1000,
			);
			// Email NOT verified - user must verify first before setting password
			(newUser as { isEmailVerified?: boolean }).isEmailVerified = false;
		}

		await newUser.save();

		// Track which emails were sent
		const emailsSent: string[] = [];

		// Generate verification code and store in PendingVerification
		const verificationCode = generateVerificationCode();
		const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		await PendingVerification.findOneAndUpdate(
			{ email: newUser.email },
			{
				email: newUser.email,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				password: 'admin_created_placeholder', // Not used for admin-created users
				userType: newUser.userType as 'agent' | 'apporteur',
				emailVerificationCode: verificationCode,
				emailVerificationExpires: verificationExpires,
			},
			{ upsert: true, new: true },
		);

		// Build URLs
		const baseUrl =
			process.env.CLIENT_URL ||
			process.env.FRONTEND_URL ||
			'http://localhost:3000';
		const verifyUrl = `${baseUrl}/auth/verify-email?email=${encodeURIComponent(newUser.email)}`;

		// Send ONE comprehensive email with all information
		// This provides better UX than multiple fragmented emails
		try {
			if (sendInvite && !payload.password) {
				// Invite link flow - send comprehensive email with verification + invite link
				const inviteUrl = `${baseUrl}/auth/set-password?email=${encodeURIComponent(newUser.email)}&token=${encodeURIComponent(String(newUser.passwordResetCode))}`;
				await sendEmail({
					to: newUser.email,
					subject: `Bienvenue sur MonHubImmo - Activez votre compte`,
					html: getAdminCreatedAccountTemplate({
						name: `${newUser.firstName} ${newUser.lastName}`,
						verificationCode,
						verifyUrl,
						flow: 'invite',
						inviteUrl,
					}),
				});
				emailsSent.push(
					'adminCreatedAccount',
					'verificationCode',
					'invite',
				);
				await logSecurityEvent({
					userId: (newUser._id as unknown as string).toString(),
					eventType: 'verification_code_sent',
					req,
					metadata: { method: 'admin_create', flow: 'invite' },
				});
			} else if (generatedTempPassword) {
				// Temp password flow - send comprehensive email with verification + temp password
				await sendEmail({
					to: newUser.email,
					subject: `Bienvenue sur MonHubImmo - Activez votre compte`,
					html: getAdminCreatedAccountTemplate({
						name: `${newUser.firstName} ${newUser.lastName}`,
						verificationCode,
						verifyUrl,
						flow: 'tempPassword',
						tempPassword: generatedTempPassword,
					}),
				});
				emailsSent.push(
					'adminCreatedAccount',
					'verificationCode',
					'tempPassword',
				);
				await logSecurityEvent({
					userId: (newUser._id as unknown as string).toString(),
					eventType: 'verification_code_sent',
					req,
					metadata: { method: 'admin_create', flow: 'tempPassword' },
				});
			}
		} catch (err) {
			logger.error(
				'[AdminController] Failed to send admin created account email',
				err,
			);
			await logSecurityEvent({
				userId: (newUser._id as unknown as string).toString(),
				eventType: 'verification_code_sent',
				req,
				metadata: { error: String(err), method: 'admin_create' },
			});
		}

		const adminId = req.userId;

		if (newUser.isValidated) {
			try {
				// send account validated email
				await sendAccountValidated({
					to: newUser.email,
					name: `${newUser.firstName} ${newUser.lastName}`,
					email: newUser.email,
				});
				emailsSent.push('validation');
			} catch (emailError) {
				// log the issue but continue
				await logSecurityEvent({
					userId: (newUser._id as unknown as string).toString(),
					eventType: 'account_validated',
					req,
					metadata: { error: String(emailError) },
				});
			}

			// Log validation event as admin validated the account upon creation
			await logSecurityEvent({
				userId: (newUser._id as unknown as string).toString(),
				eventType: 'account_validated',
				req,
				metadata: { validatedBy: adminId, via: 'admin_create' },
			});
		}
		logger.info('[AdminController] createAdminUser success', {
			adminId,
			userId: (newUser._id as unknown as string).toString(),
			email: newUser.email,
			emailsSent,
		});
		res.status(201).json({ success: true, user: newUser, emailsSent });
	} catch (err) {
		logger.error('[AdminController] createAdminUser failed', {
			error: err instanceof Error ? err.message : String(err),
		});
		res.status(500).json({
			error: 'Failed to create user',
			details: (err as Error).message,
		});
	}
};

// Update an admin user
export const updateAdminUser = async (req: Request, res: Response) => {
	const userId = req.params.id;
	const payload = req.body || {};
	if (!userId) return res.status(400).json({ error: 'Missing user id' });

	try {
		logger.info('[AdminController] updateAdminUser called', {
			actorId:
				(req as AuthRequest).userId ||
				(req as AuthRequest).user?.id ||
				null,
			userId,
		});
		const user = await User.findById(userId);
		if (!user)
			return res.status(404).json({ error: 'Utilisateur non trouvé' });

		Object.assign(user, payload);
		await user.save();
		logger.info('[AdminController] updateAdminUser success', { userId });
		res.json({ success: true, user });
	} catch (err) {
		logger.error('[AdminController] updateAdminUser failed', {
			error: err instanceof Error ? err.message : String(err),
			userId,
		});
		res.status(500).json({
			error: 'Failed to update user',
			details: (err as Error).message,
		});
	}
};

// Delete admin user
export const deleteAdminUser = async (req: Request, res: Response) => {
	const userId = req.params.id;
	if (!userId) return res.status(400).json({ error: 'Missing user id' });

	try {
		const actorId =
			(req as AuthRequest).userId ||
			(req as AuthRequest).user?.id ||
			null;
		logger.info('[AdminController] deleteAdminUser called', {
			actorId,
			userId,
		});

		// Find user first to get details for logging
		const user = await User.findById(userId);
		if (!user) {
			logger.warn('[AdminController] deleteAdminUser - user not found', {
				userId,
			});
			return res.status(404).json({ error: 'User not found' });
		}

		// Delete user's properties (annonces)
		const { Property } = await import('../models/Property');
		const deletedProperties = await Property.deleteMany({ owner: userId });
		logger.info('[AdminController] Deleted user properties', {
			userId,
			count: deletedProperties.deletedCount,
		});

		// Delete user's search ads
		const { SearchAd } = await import('../models/SearchAd');
		const deletedSearchAds = await SearchAd.deleteMany({
			createdBy: userId,
		});
		logger.info('[AdminController] Deleted user search ads', {
			userId,
			count: deletedSearchAds.deletedCount,
		});

		// Delete collaborations where user is involved
		const { Collaboration } = await import('../models/Collaboration');
		const deletedCollaborations = await Collaboration.deleteMany({
			$or: [{ agent: userId }, { apporteur: userId }],
		});
		logger.info('[AdminController] Deleted user collaborations', {
			userId,
			count: deletedCollaborations.deletedCount,
		});

		// Delete user's messages
		const Message = (await import('../models/Chat')).default;
		const deletedMessages = await Message.deleteMany({
			$or: [{ senderId: userId }, { receiverId: userId }],
		});
		logger.info('[AdminController] Deleted user messages', {
			userId,
			count: deletedMessages.deletedCount,
		});

		// Delete the user
		await User.findByIdAndDelete(userId);

		// Log security event
		await logSecurityEvent({
			userId: actorId || undefined,
			eventType: 'account_deleted',
			req,
			metadata: {
				deletedUserId: userId,
				email: user.email,
				propertiesDeleted: deletedProperties.deletedCount,
				searchAdsDeleted: deletedSearchAds.deletedCount,
				collaborationsDeleted: deletedCollaborations.deletedCount,
				messagesDeleted: deletedMessages.deletedCount,
			},
		});

		logger.info('[AdminController] deleteAdminUser success', {
			userId,
			propertiesDeleted: deletedProperties.deletedCount,
			searchAdsDeleted: deletedSearchAds.deletedCount,
			collaborationsDeleted: deletedCollaborations.deletedCount,
			messagesDeleted: deletedMessages.deletedCount,
		});

		res.json({
			success: true,
			deleted: {
				properties: deletedProperties.deletedCount,
				searchAds: deletedSearchAds.deletedCount,
				collaborations: deletedCollaborations.deletedCount,
				messages: deletedMessages.deletedCount,
			},
		});
	} catch (err) {
		logger.error('[AdminController] deleteAdminUser failed', {
			error: err instanceof Error ? err.message : String(err),
			userId,
		});
		res.status(500).json({
			error: 'Failed to delete user',
			details: (err as Error).message,
		});
	}
};

// Import users from CSV (expects middleware to provide `req.file.buffer`)
export const importUsersFromCSV = async (req: Request, res: Response) => {
	try {
		const file = (req as { file?: { buffer?: Buffer } }).file;
		if (!file || !file.buffer)
			return res.status(400).json({ error: 'No CSV file uploaded' });

		logger.info('[AdminController] importUsersFromCSV called', {
			actorId:
				(req as AuthRequest).userId ||
				(req as AuthRequest).user?.id ||
				null,
			fileSize: file.buffer?.length || 0,
		});

		// Admin flags available on form body
		// By default, when importing CSV we will send an invite to each created user
		const sendInviteDefault =
			typeof req.body.sendInviteDefault === 'undefined'
				? true
				: req.body.sendInviteDefault === 'true' ||
					req.body.sendInviteDefault === true;
		const validateDefault =
			req.body.validateDefault === 'true' ||
			req.body.validateDefault === true;
		const defaultUserType =
			(req.body.defaultUserType as string) || 'apporteur';
		const updateIfExists =
			req.body.updateIfExists === 'true' ||
			req.body.updateIfExists === true;

		const text = file.buffer.toString('utf8');
		const lines = text
			.split(/\r?\n/)
			.map((l: string) => l.trim())
			.filter(Boolean);
		if (lines.length === 0)
			return res.status(400).json({ error: 'CSV empty' });

		const header = lines[0]
			.split(',')
			.map((h: string) => h.trim().toLowerCase());
		// accept common headers; optional ones included (email, firstname, lastname are expected)

		// Result bookkeeping
		const created: Array<{ email: string; id: unknown }> = [];
		const updated: Array<{ email: string; id: unknown }> = [];
		const skipped: Array<{ line: number; reason: string }> = [];
		const errors: string[] = [];

		// Helper: basic email validation
		const isValidEmail = (e: string) =>
			typeof e === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

		for (let i = 1; i < lines.length; i++) {
			const cols = lines[i].split(',').map((c: string) => c.trim());
			if (cols.length === 0) continue;
			const row: Record<string, string> = {};
			header.forEach((h: string, idx: number) => {
				row[h] = cols[idx] ?? '';
			});

			// Normalize fields
			const email = (row.email || '').toLowerCase();
			if (!email || !isValidEmail(email)) {
				skipped.push({
					line: i + 1,
					reason: 'Invalid or missing email',
				});
				continue;
			}

			// Check for existing user
			const existing = await User.findOne({ email });
			if (existing && !updateIfExists) {
				skipped.push({ line: i + 1, reason: 'User already exists' });
				continue;
			}

			// Build user object
			const userPayload: {
				firstName: string;
				lastName: string;
				email: string;
				userType: string;
				phone?: string;
				professionalInfo?: { network: string };
				isValidated: boolean;
				password?: string;
			} = {
				firstName: row.firstname || '',
				lastName: row.lastname || '',
				email,
				userType: row.usertype || defaultUserType,
				phone: row.phone || undefined,
				professionalInfo: row.network
					? { network: row.network }
					: undefined,
				isValidated:
					typeof row.isvalidated !== 'undefined'
						? String(row.isvalidated).toLowerCase() === 'true'
						: validateDefault,
			};

			// If admin provided password in CSV (not recommended), set it; it will be hashed by pre-save hook
			if (row.password) {
				userPayload.password = row.password;
			}

			// If user exists and updateIfExists true -> update fields
			if (existing && updateIfExists) {
				Object.assign(existing, userPayload);
				await existing.save();
				updated.push({ id: existing._id, email });
				// If admin wants to invite on update and no password present, set invite
				const sendInvite =
					typeof row.sendinvite !== 'undefined'
						? String(row.sendinvite).toLowerCase() === 'true'
						: sendInviteDefault;
				if (sendInvite && !existing.password) {
					const token = crypto.randomBytes(32).toString('hex');
					existing.passwordResetCode = token;
					existing.passwordResetExpires = new Date(
						Date.now() + 24 * 60 * 60 * 1000,
					); // 24 hours
					// Email NOT verified - user must verify first (same as manual user creation)
					(
						existing as { isEmailVerified?: boolean }
					).isEmailVerified = false;
					await existing.save();

					// Send comprehensive email with verification + invite link (same flow as manual user creation)
					try {
						// Generate verification code and store in PendingVerification
						const verificationCode = generateVerificationCode();
						const verificationExpires = new Date(
							Date.now() + 24 * 60 * 60 * 1000,
						); // 24 hours

						await PendingVerification.findOneAndUpdate(
							{ email: existing.email },
							{
								email: existing.email,
								firstName: existing.firstName,
								lastName: existing.lastName,
								password: 'admin_created_placeholder',
								userType: existing.userType as
									| 'agent'
									| 'apporteur',
								emailVerificationCode: verificationCode,
								emailVerificationExpires: verificationExpires,
							},
							{ upsert: true, new: true },
						);

						const baseUrl =
							process.env.CLIENT_URL ||
							process.env.FRONTEND_URL ||
							'http://localhost:3000';
						const verifyUrl = `${baseUrl}/auth/verify-email?email=${encodeURIComponent(existing.email)}`;
						const inviteUrl = `${baseUrl}/auth/set-password?email=${encodeURIComponent(existing.email)}&token=${encodeURIComponent(String(existing.passwordResetCode))}`;

						await sendEmail({
							to: existing.email,
							subject: `Bienvenue sur MonHubImmo - Activez votre compte`,
							html: getAdminCreatedAccountTemplate({
								name: `${existing.firstName} ${existing.lastName}`,
								verificationCode,
								verifyUrl,
								flow: 'invite',
								inviteUrl,
							}),
						});

						await logSecurityEvent({
							userId: (
								existing._id as unknown as string
							).toString(),
							eventType: 'verification_code_sent',
							req,
							metadata: {
								method: 'csv_import_update',
								flow: 'invite',
							},
						});
					} catch (err) {
						errors.push(
							`Failed to send invite to ${existing.email}: ${(err as Error).message}`,
						);
					}
				}
				continue;
			}

			// Otherwise, create new user
			const u = new User(userPayload);

			const sendInvite =
				typeof row.sendinvite !== 'undefined'
					? String(row.sendinvite).toLowerCase() === 'true'
					: sendInviteDefault;
			// If we should send an invite and the admin did not provide a password
			if (sendInvite && !row.password) {
				const token = crypto.randomBytes(32).toString('hex');
				u.passwordResetCode = token;
				u.passwordResetExpires = new Date(
					Date.now() + 24 * 60 * 60 * 1000,
				); // 24 hours
				// Email NOT verified - user must verify first before setting password (same as manual user creation)
				(u as { isEmailVerified?: boolean }).isEmailVerified = false;
			}

			// If row explicitly sets isvalidated = true, mark validated (admin explicit validation)
			// If validateDefault true (admin opted to auto-validate), set validated
			u.isValidated = userPayload.isValidated;

			try {
				await u.save();
				created.push({ id: u._id, email: u.email });

				// Send comprehensive email with verification code + invite link (same flow as manual user creation)
				if (sendInvite && !row.password) {
					try {
						// Generate verification code and store in PendingVerification (like manual user creation)
						const verificationCode = generateVerificationCode();
						const verificationExpires = new Date(
							Date.now() + 24 * 60 * 60 * 1000,
						); // 24 hours

						await PendingVerification.findOneAndUpdate(
							{ email: u.email },
							{
								email: u.email,
								firstName: u.firstName,
								lastName: u.lastName,
								password: 'admin_created_placeholder', // Not used for admin-created users
								userType: u.userType as 'agent' | 'apporteur',
								emailVerificationCode: verificationCode,
								emailVerificationExpires: verificationExpires,
							},
							{ upsert: true, new: true },
						);

						const baseUrl =
							process.env.CLIENT_URL ||
							process.env.FRONTEND_URL ||
							'http://localhost:3000';
						const verifyUrl = `${baseUrl}/auth/verify-email?email=${encodeURIComponent(u.email)}`;
						const inviteUrl = `${baseUrl}/auth/set-password?email=${encodeURIComponent(u.email)}&token=${encodeURIComponent(String(u.passwordResetCode))}`;

						// Send comprehensive email with verification + invite link (same as manual user creation)
						await sendEmail({
							to: u.email,
							subject: `Bienvenue sur MonHubImmo - Activez votre compte`,
							html: getAdminCreatedAccountTemplate({
								name: `${u.firstName} ${u.lastName}`,
								verificationCode,
								verifyUrl,
								flow: 'invite',
								inviteUrl,
							}),
						});

						await logSecurityEvent({
							userId: (u._id as unknown as string).toString(),
							eventType: 'verification_code_sent',
							req,
							metadata: { method: 'csv_import', flow: 'invite' },
						});
					} catch (err) {
						errors.push(
							`Failed to send invite to ${u.email}: ${(err as Error).message}`,
						);
					}
				}
			} catch (err) {
				skipped.push({
					line: i + 1,
					reason: `DB error: ${(err as Error).message}`,
				});
			}
		}

		logger.info('[AdminController] importUsersFromCSV success', {
			createdCount: created.length,
			updatedCount: updated.length,
			skippedCount: skipped.length,
			errorCount: errors.length,
		});
		res.json({
			success: true,
			createdCount: created.length,
			updatedCount: updated.length,
			skipped,
			errors,
			created,
		});
	} catch (err) {
		logger.error('[AdminController] importUsersFromCSV failed', {
			error: err instanceof Error ? err.message : String(err),
		});
		res.status(500).json({
			error: 'Failed to import CSV',
			details: (err as Error).message,
		});
	}
};

// Simple aggregated stats for admin dashboard
export const getAdminStats = async (req: Request, res: Response) => {
	const debug = process.env.AUTH_DEBUG === 'true';
	if (debug) {
		logger.info('[getAdminStats] called', {
			method: req.method,
			url: req.originalUrl,
			user: (req as AuthRequest).user || null,
			cookieKeys: Object.keys(req.cookies || {}),
			headers: {
				authorization: req.headers.authorization
					? '(present)'
					: '(absent)',
				origin: req.headers.origin || null,
			},
		});
	}

	try {
		// Users (agents) stats
		const agentsTotal = await User.countDocuments({ userType: 'agent' });
		const agentsActive = await User.countDocuments({
			userType: 'agent',
			isValidated: true,
			isBlocked: { $ne: true },
		});
		const agentsPending = await User.countDocuments({
			userType: 'agent',
			isValidated: false,
			isBlocked: { $ne: true },
		});
		const agentsUnsubscribed = await User.countDocuments({
			userType: 'agent',
			isBlocked: true,
		});
		// Apporteurs (lead providers)
		const apporteursTotal = await User.countDocuments({
			userType: 'apporteur',
		});
		const apporteursActive = await User.countDocuments({
			userType: 'apporteur',
			isValidated: true,
			isBlocked: { $ne: true },
		});
		const apporteursPending = await User.countDocuments({
			userType: 'apporteur',
			isValidated: false,
			isBlocked: { $ne: true },
		});

		// Properties
		const propertiesActive = await Property.countDocuments({
			status: 'active',
		});
		const propertiesArchived = await Property.countDocuments({
			status: 'archived',
		});
		// Properties currently in collaboration (distinct postIds from Collaboration)
		const propertiesInCollabDistinct = await Collaboration.distinct(
			'postId',
			{
				postType: 'Property',
				status: { $in: ['pending', 'accepted', 'active'] },
			},
		);
		const propertiesInCollab = propertiesInCollabDistinct
			? propertiesInCollabDistinct.length
			: 0;

		// Collaborations
		const collabOpen = await Collaboration.countDocuments({
			status: { $in: ['pending', 'accepted', 'active'] },
		});
		const collabClosed = await Collaboration.countDocuments({
			status: { $in: ['completed', 'cancelled'] },
		});

		// Fees total (sum of completed collaborations' commission if present)
		const feesAgg = await Collaboration.aggregate([
			{
				$match: {
					commission: { $exists: true, $ne: null },
					status: { $in: ['completed'] },
				},
			},
			{
				$group: {
					_id: null,
					total: { $sum: '$commission' },
				},
			},
		]);
		const feesTotal = feesAgg && feesAgg.length > 0 ? feesAgg[0].total : 0;

		// Top networks: group users by professionalInfo.network
		const topNetworksAgg = await User.aggregate([
			{
				$match: {
					'professionalInfo.network': { $exists: true, $ne: '' },
				},
			},
			{
				$group: {
					_id: '$professionalInfo.network',
					count: { $sum: 1 },
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: 10 },
		]);
		const topNetworks = topNetworksAgg.map((r) => ({
			name: r._id,
			count: r.count,
		}));

		// Top regions: group properties by city or location field
		const topRegionsAgg = await Property.aggregate([
			{ $match: { city: { $exists: true, $ne: '' } } },
			{ $group: { _id: '$city', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 10 },
		]);
		const topRegions = topRegionsAgg.map((r) => ({
			name: r._id,
			count: r.count,
		}));

		const stats = {
			agentsTotal,
			agentsActive,
			agentsPending,
			agentsUnsubscribed,
			apporteursTotal,
			apporteursActive,
			apporteursPending,
			propertiesActive,
			propertiesArchived,
			propertiesInCollab,
			collabOpen,
			collabClosed,
			feesTotal,
			topNetworks,
			topRegions,
		};

		logger.info('[AdminController] getAdminStats success', {
			actorId:
				(req as AuthRequest).userId ||
				(req as AuthRequest).user?.id ||
				null,
		});
		res.json(stats);
	} catch (err) {
		logger.error('[AdminController] getAdminStats failed', {
			error: err instanceof Error ? err.message : String(err),
		});
		res.status(500).json({
			error: 'Failed to compute stats',
			details: (err as Error).message,
		});
	}
};

export const sendPaymentReminder = async (req: AuthRequest, res: Response) => {
	const userId = req.params.id;
	if (!userId) return res.status(400).json({ error: 'Missing user id' });

	try {
		logger.info('[AdminController] sendPaymentReminder called', {
			adminId: req.userId,
			userId,
		});
		const user = await User.findById(userId);
		if (!user)
			return res.status(404).json({ error: 'Utilisateur non trouvé' });

		// Only send reminder to agents who haven't paid
		if (user.userType !== 'agent' || user.isPaid) {
			return res.status(400).json({
				error: "Ce utilisateur n'est pas concerné par un rappel de paiement",
			});
		}

		// Generate payment URL
		const paymentUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment`;

		await sendPaymentReminderEmail({
			to: user.email,
			name: `${user.firstName} ${user.lastName}`,
			billingUrl: paymentUrl,
		});
		logger.info('[AdminController] sendPaymentReminder success', {
			adminId: req.userId,
			userId,
		});
		res.json({
			success: true,
			message: 'Rappel de paiement envoyé avec succès',
		});
	} catch (err) {
		logger.error('[AdminController] sendPaymentReminder failed', {
			error: err instanceof Error ? err.message : String(err),
			adminId: req.userId,
			userId,
		});
		res.status(500).json({
			error: "Erreur lors de l'envoi du rappel",
			details: (err as Error).message,
		});
	}
};

// Admin delete collaboration (no ownership check)
export const deleteAdminCollaboration = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const collaboration = await Collaboration.findById(id);

		if (!collaboration) {
			res.status(404).json({
				success: false,
				message: 'Collaboration introuvable',
			});
			return;
		}

		await collaboration.deleteOne();
		logger.info('[Admin] Collaboration deleted', {
			adminId: req.userId,
			collaborationId: id,
		});

		res.status(200).json({
			success: true,
			message: 'Collaboration supprimée',
		});
	} catch (error) {
		logger.error('[Admin] Failed to delete collaboration', {
			error: (error as Error).message,
			collaborationId: req.params.id,
		});
		res.status(500).json({
			success: false,
			message: 'Échec de la suppression de la collaboration',
			error: (error as Error).message,
		});
	}
};
