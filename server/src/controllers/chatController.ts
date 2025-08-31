import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import Message from '../models/Chat';
import { getSocketService } from '../server';
import { Types } from 'mongoose';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sort conversations by most recent activity
 * @param conversations - Array of conversations with users
 * @returns Sorted conversations (most recent first)
 */
const sortConversationsByActivity = (conversations: any[]) => {
	return conversations.sort((a, b) => {
		const aTime = a.lastMessage?.createdAt || a.createdAt || new Date(0);
		const bTime = b.lastMessage?.createdAt || b.createdAt || new Date(0);

		// Convert to timestamps for proper comparison
		const aTimestamp = new Date(aTime).getTime();
		const bTimestamp = new Date(bTime).getTime();

		console.log(
			`Sorting: ${a.firstName || a.email} (${aTimestamp}) vs ${b.firstName || b.email} (${bTimestamp})`,
		);

		return bTimestamp - aTimestamp; // Most recent first
	});
};

// ============================================================================
// CONTROLLER FUNCTIONS
// ============================================================================

/**
 * Get users with existing conversations for sidebar with last message and unread count
 * Only returns users that the current user has actually exchanged messages with
 * @param req - Express request with authenticated user
 * @param res - Express response
 */
export const getUsersForSidebar = async (req: AuthRequest, res: Response) => {
	try {
		// Validate authentication
		if (!req.userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const loggedInUserId = new Types.ObjectId(req.userId);

		// First, find all unique user IDs that have exchanged messages with the current user
		const messagesWithOthers = await Message.aggregate([
			{
				$match: {
					$or: [
						{ senderId: loggedInUserId },
						{ receiverId: loggedInUserId },
					],
				},
			},
			{
				$group: {
					_id: {
						$cond: [
							{ $eq: ['$senderId', loggedInUserId] },
							'$receiverId',
							'$senderId',
						],
					},
					count: { $sum: 1 },
				},
			},
		]);

		const conversationUserIds = messagesWithOthers.map((item) => item._id);

		if (conversationUserIds.length === 0) {
			console.log(
				'No existing conversations found for user:',
				req.userId,
			);
			return res.status(200).json([]);
		}

		// Get user details for these conversation participants
		const conversationUsers = await User.find({
			_id: { $in: conversationUserIds },
		}).select('-password');

		// Get conversation data for each user
		const conversationsWithUsers = await Promise.all(
			conversationUsers.map(async (user) => {
				// Get last message between current user and this user
				const lastMessage = await Message.findOne({
					$or: [
						{ senderId: loggedInUserId, receiverId: user._id },
						{ senderId: user._id, receiverId: loggedInUserId },
					],
				}).sort({ createdAt: -1 });

				// Get unread message count - messages sent TO current user that are unread
				const unreadCount = await Message.countDocuments({
					senderId: user._id,
					receiverId: loggedInUserId,
					isRead: false,
				});

				console.log(
					`User ${user.firstName || user.email}: unreadCount = ${unreadCount}`,
				);

				return {
					...user.toObject(),
					lastMessage: lastMessage
						? {
								text: lastMessage.text,
								createdAt: lastMessage.createdAt,
								senderId: lastMessage.senderId,
							}
						: null,
					unreadCount: unreadCount || 0, // Ensure it's always a number
				};
			}),
		);

		// Sort by last message time (most recent first)
		const sortedConversations = sortConversationsByActivity(
			conversationsWithUsers,
		);

		console.log(
			'Returning existing conversations with unread counts:',
			sortedConversations.map((u) => ({
				name: u.firstName || u.email,
				unreadCount: u.unreadCount,
				lastMessageTime: u.lastMessage?.createdAt || 'No message',
			})),
		);

		res.status(200).json(sortedConversations);
	} catch (error: any) {
		console.error('Error in getUsersForSidebar: ', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
};

/**
 * Get messages between two users with pagination support
 * @param req - Express request with user ID parameter and query params
 * @param res - Express response
 */
export const getMessages = async (req: AuthRequest, res: Response) => {
	try {
		// Validate authentication
		if (!req.userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const { id: userToChatId } = req.params;
		const { before, limit } = req.query as {
			before?: string;
			limit?: string;
		};
		const myId = new Types.ObjectId(req.userId);

		// Build query for messages between the two users
		const query: Record<string, unknown> = {
			$or: [
				{ senderId: myId, receiverId: userToChatId },
				{ senderId: userToChatId, receiverId: myId },
			],
		};

		// Add pagination filter if 'before' timestamp provided
		if (before) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(query as any).createdAt = { $lt: new Date(before) };
		}

		// Validate and set limit (1-100 messages per request)
		const take = Math.min(Math.max(parseInt(limit || '30', 10), 1), 100);

		// Fetch newest first then reverse to ascending for UI rendering
		const results = await Message.find(query)
			.sort({ createdAt: -1 })
			.limit(take);
		const messagesAsc = results.reverse();

		res.status(200).json(messagesAsc);
	} catch (error: any) {
		console.log('Error in getMessages controller: ', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
};

/**
 * Send a new message and emit real-time updates
 * @param req - Express request with message data and receiver ID
 * @param res - Express response
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
	try {
		// Validate authentication
		if (!req.userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const { text } = req.body;
		const { id: receiverId } = req.params;
		const senderId = new Types.ObjectId(req.userId);

		// TODO: Add image upload support
		let imageUrl: string | undefined;

		// Create and save new message
		const newMessage = new Message({
			senderId,
			receiverId,
			text,
			image: imageUrl,
			isRead: false,
		});

		await newMessage.save();

		// Get sender info for notification
		const sender = await User.findById(senderId).select(
			'firstName lastName name email',
		);

		// Prepare message payload with sender info and string IDs for socket emission
		const messageWithSender = {
			...newMessage.toObject(),
			senderId: senderId.toString(),
			receiverId: receiverId.toString(),
			senderName: sender
				? sender.firstName
					? `${sender.firstName} ${sender.lastName}`
					: sender.firstName || sender.email
				: 'Someone',
		};

		// Emit real-time updates via socket service
		const socketService = getSocketService();
		socketService.emitNewMessage(messageWithSender);

		res.status(201).json(newMessage);
	} catch (error: any) {
		console.log('Error in sendMessage controller: ', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
};

/**
 * Mark messages as read and emit read receipts
 * @param req - Express request with sender ID parameter
 * @param res - Express response
 */
export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
	try {
		// Validate authentication
		if (!req.userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const { id: senderId } = req.params;
		const receiverId = new Types.ObjectId(req.userId);

		console.log(
			'📖 Marking messages as read from:',
			senderId,
			'to:',
			receiverId.toString(),
		);

		// Mark all unread messages from sender as read
		const result = await Message.updateMany(
			{
				senderId: senderId,
				receiverId: receiverId,
				isRead: false,
			},
			{
				isRead: true,
				readAt: new Date(),
			},
		);

		console.log('✅ Marked', result.modifiedCount, 'messages as read');

		// Emit read receipt via socket service if messages were marked as read
		if (result.modifiedCount > 0) {
			const socketService = getSocketService();
			socketService.emitReadReceipt(senderId, receiverId.toString());
		}

		res.status(200).json({
			message: 'Messages marked as read',
			count: result.modifiedCount,
		});
	} catch (error: any) {
		console.error('Error marking messages as read:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

/**
 * Get user details by ID for initiating new conversations
 * @param req - Express request with user ID parameter
 * @param res - Express response
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
	try {
		// Validate authentication
		if (!req.userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const { id: targetUserId } = req.params;

		// Ensure user isn't trying to get their own details
		if (targetUserId === req.userId) {
			return res
				.status(400)
				.json({ error: 'Cannot get your own details' });
		}

		// Find the target user
		const targetUser =
			await User.findById(targetUserId).select('-password');

		if (!targetUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Return user details formatted for chat
		const userForChat = {
			...targetUser.toObject(),
			lastMessage: null,
			unreadCount: 0,
		};

		console.log(
			'User details fetched for new conversation:',
			userForChat.firstName || userForChat.email,
		);

		res.status(200).json(userForChat);
	} catch (error: any) {
		console.error('Error in getUserById:', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
};
