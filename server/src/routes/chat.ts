import express, { Router, RequestHandler } from 'express';
import {
	getMessages,
	sendMessage,
	getUsersForSidebar,
	getUserById,
	markMessagesAsRead,
	deleteMessage,
} from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';

const router: Router = express.Router();

router.get(
	'/users',
	generalLimiter,
	authenticateToken,
	getUsersForSidebar as RequestHandler,
);
router.get(
	'/user/:id',
	generalLimiter,
	authenticateToken,
	getUserById as RequestHandler,
);
router.get(
	'/:id',
	generalLimiter,
	authenticateToken,
	getMessages as RequestHandler,
);
router.post(
	'/send/:id',
	generalLimiter,
	authenticateToken,
	sendMessage as RequestHandler,
);
router.put(
	'/read/:id',
	generalLimiter,
	authenticateToken,
	markMessagesAsRead as RequestHandler,
);

router.delete(
	'/:messageId',
	generalLimiter,
	authenticateToken,
	deleteMessage as unknown as RequestHandler,
);

export default router;
