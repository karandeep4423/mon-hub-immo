import { Router, RequestHandler } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireActiveSubscription } from '../middleware/subscription';
import { validate } from '../validation/middleware';
import {
	listNotificationsSchema,
	markReadParamsSchema,
} from '../validation/notificationSchemas';
import { notificationService } from '../services/notificationService';
import { AuthRequest } from '../types/auth';

const router = Router();

// All routes require auth
router.use(authenticateToken, requireActiveSubscription);

// GET list (cursor-based)
const listHandler: RequestHandler = async (req, res) => {
	const reqA = req as AuthRequest;
	const userId = reqA.user?.id;
	if (!userId) {
		res.status(401).json({ success: false, message: 'Unauthorized' });
		return;
	}
	const { cursor, limit } =
		(
			req as unknown as {
				validated_query: { cursor?: string; limit?: number };
			}
		).validated_query || {};
	const result = await notificationService.list({ userId, cursor, limit });
	res.json({ success: true, ...result });
};
router.get('/', validate(listNotificationsSchema, 'query'), listHandler);

// GET unread count
const countHandler: RequestHandler = async (req, res) => {
	const reqA = req as AuthRequest;
	const userId = reqA.user?.id;
	if (!userId) {
		res.status(401).json({ success: false, message: 'Unauthorized' });
		return;
	}
	const unreadCount = await notificationService.countUnread(userId);
	res.json({ success: true, unreadCount });
};
router.get('/count', countHandler);

// PATCH mark single as read
const markReadHandler: RequestHandler = async (req, res) => {
	const reqA = req as AuthRequest;
	const userId = reqA.user?.id;
	if (!userId) {
		res.status(401).json({ success: false, message: 'Unauthorized' });
		return;
	}
	const { id } = (req as unknown as { validated_params: { id: string } })
		.validated_params;
	await notificationService.markRead(userId, id);
	res.status(204).end();
};
router.patch(
	'/:id/read',
	validate(markReadParamsSchema, 'params'),
	markReadHandler,
);

// PATCH mark all as read
const markAllReadHandler: RequestHandler = async (req, res) => {
	const reqA = req as AuthRequest;
	const userId = reqA.user?.id;
	if (!userId) {
		res.status(401).json({ success: false, message: 'Unauthorized' });
		return;
	}
	await notificationService.markAllRead(userId);
	res.status(204).end();
};
router.patch('/read-all', markAllReadHandler);

// DELETE single notification
const deleteHandler: RequestHandler = async (req, res) => {
	const reqA = req as AuthRequest;
	const userId = reqA.user?.id;
	if (!userId) {
		res.status(401).json({ success: false, message: 'Unauthorized' });
		return;
	}
	const { id } = (req as unknown as { validated_params: { id: string } })
		.validated_params;
	await notificationService.delete(userId, id);
	res.status(204).end();
};
router.delete('/:id', validate(markReadParamsSchema, 'params'), deleteHandler);

export default router;
