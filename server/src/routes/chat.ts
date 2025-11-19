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
import { requireActiveSubscription } from '../middleware/subscription';

const router: Router = express.Router();

// ============================================================================
// PROTECTED ROUTES (All chat routes require authentication)
// ============================================================================

// Apply authentication and subscription middleware to all routes
router.use(authenticateToken, requireActiveSubscription);

// @route   GET api/message/users
// @desc    Get users for sidebar (contacts)
// @access  Private (authenticated users)
router.get('/users', getUsersForSidebar as RequestHandler);

// @route   GET api/message/user/:id
// @desc    Get user by ID
// @access  Private (authenticated users)
router.get('/user/:id', getUserById as RequestHandler);

// @route   GET api/message/:id
// @desc    Get messages with a specific user
// @access  Private (authenticated users)
router.get('/:id', getMessages as RequestHandler);

// @route   POST api/message/send/:id
// @desc    Send a message to a user
// @access  Private (authenticated users)
router.post('/send/:id', sendMessage as RequestHandler);

// @route   PUT api/message/read/:id
// @desc    Mark messages as read
// @access  Private (authenticated users)
router.put('/read/:id', markMessagesAsRead as RequestHandler);

// @route   DELETE api/message/:messageId
// @desc    Delete a message
// @access  Private (authenticated users)
router.delete('/:messageId', deleteMessage as unknown as RequestHandler);

export default router;
