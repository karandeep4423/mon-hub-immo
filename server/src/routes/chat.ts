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

const router: Router = express.Router();

router.get('/users', authenticateToken, getUsersForSidebar as RequestHandler);
router.get('/user/:id', authenticateToken, getUserById as RequestHandler);
router.get('/:id', authenticateToken, getMessages as RequestHandler);
router.post('/send/:id', authenticateToken, sendMessage as RequestHandler);
router.put(
	'/read/:id',
	authenticateToken,
	markMessagesAsRead as RequestHandler,
);

router.delete(
	'/:messageId',
	authenticateToken,
	deleteMessage as unknown as RequestHandler,
);

export default router;
