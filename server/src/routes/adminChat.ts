import express, { Router, RequestHandler } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { Collaboration } from '../models/Collaboration';
import Message from '../models/Chat';
import { logger } from '../utils/logger';
import { Types, FilterQuery } from 'mongoose';

const router: Router = express.Router();

// Protect all admin chat routes
router.use(authenticateToken, requireAdmin);

// GET /api/admin/chat/conversation?collaborationId=...
router.get('/conversation', (async (req, res) => {
	try {
		const { collaborationId } = req.query as { collaborationId?: string };
		if (!collaborationId || !Types.ObjectId.isValid(collaborationId)) {
			return res.status(400).json({ error: 'collaborationId invalide' });
		}
		const collaboration = await Collaboration.findById(
			collaborationId,
		).select('postOwnerId collaboratorId status');
		if (!collaboration) {
			return res.status(404).json({ error: 'Collaboration introuvable' });
		}
		// Build conversation descriptor
		const convo = {
			_id: collaboration._id.toString(),
			ownerId: collaboration.postOwnerId.toString(),
			collaboratorId: collaboration.collaboratorId.toString(),
			status: collaboration.status,
		};
		return res.status(200).json({ conversation: convo });
	} catch (e) {
		logger.error('[AdminChatRoutes] Error fetching conversation', e);
		return res.status(500).json({ error: 'Erreur interne serveur' });
	}
}) as RequestHandler);

// GET /api/admin/chat/messages?userA=...&userB=...&limit=30
router.get('/messages', (async (req, res) => {
	try {
		const { userA, userB, before, limit } = req.query as {
			userA?: string;
			userB?: string;
			before?: string;
			limit?: string;
		};
		if (
			!userA ||
			!userB ||
			!Types.ObjectId.isValid(userA) ||
			!Types.ObjectId.isValid(userB)
		) {
			return res
				.status(400)
				.json({ error: 'Paramètres userA/userB invalides' });
		}
		const a = new Types.ObjectId(userA);
		const b = new Types.ObjectId(userB);
		const take = Math.min(Math.max(parseInt(limit || '30', 10), 1), 200);
		const query: FilterQuery<Record<string, unknown>> = {
			$or: [
				{ senderId: a, receiverId: b },
				{ senderId: b, receiverId: a },
			],
		};
		if (before) {
			query.createdAt = { $lt: new Date(before) };
		}
		const results = await Message.find(query)
			.sort({ createdAt: -1 })
			.limit(take);
		return res
			.status(200)
			.json({ messages: results.reverse(), count: results.length });
	} catch (e) {
		logger.error('[AdminChatRoutes] Error fetching messages', e);
		return res.status(500).json({ error: 'Erreur interne serveur' });
	}
}) as RequestHandler);

export default router;
