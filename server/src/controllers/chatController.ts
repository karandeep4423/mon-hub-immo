import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import Message from '../models/Chat';
import { getSocketService } from '../server';
import { Types } from 'mongoose';
import { s3Service } from '../services/s3Service';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sort conversations by most recent activity
 * @param conversations - Array of conversations with users
 * @returns Sorted conversations (most recent first)
 */
type ConversationLike = {
	lastMessage?: { createdAt?: Date | string } | null;
	createdAt?: Date | string;
	firstName?: string;
	email?: string;
	unreadCount?: number;
};

const sortConversationsByActivity = (conversations: ConversationLike[]) => {
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
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error('Error in getUsersForSidebar: ', msg);
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
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.log('Error in getMessages controller: ', msg);
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

		const { text, attachments } = req.body as {
			text?: string;
			attachments?: Array<{
				url: string;
				name: string;
				mime: string;
				size: number;
				type?: 'image' | 'pdf' | 'doc' | 'docx' | 'file';
				thumbnailUrl?: string;
			}>;
		};
		const { id: receiverId } = req.params;
		const senderId = new Types.ObjectId(req.userId);

		// Back-compat: preserve legacy image field if provided (not used in new flow)
		let imageUrl: string | undefined;

		// Create and save new message
		const newMessage = new Message({
			senderId,
			receiverId,
			text,
			image: imageUrl,
			attachments: attachments?.map((a) => ({
				url: a.url,
				name: a.name,
				mime: a.mime,
				size: a.size,
				type:
					a.type ||
					(a.mime.startsWith('image/')
						? 'image'
						: a.mime.includes('pdf')
							? 'pdf'
							: a.mime.includes('word') ||
								  a.mime.includes('msword') ||
								  a.mime.includes('officedocument')
								? 'docx'
								: 'file'),
				thumbnailUrl: a.thumbnailUrl,
			})),
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
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.log('Error in sendMessage controller: ', msg);
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
	} catch (error: unknown) {
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
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error('Error in getUserById:', msg);
		res.status(500).json({ error: 'Internal server error' });
	}
};

/**
 * Delete a message (sender only) and remove its files from S3
 */
export const deleteMessage = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.userId) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const { messageId } = req.params as { messageId: string };
		const me = new Types.ObjectId(req.userId);

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ error: 'Message not found' });
		}

		if (String(message.senderId) !== String(me)) {
			return res.status(403).json({ error: 'Forbidden' });
		}

		// Collect S3 keys from attachments and legacy image URL
		const keys: string[] = [];
		const extractKey = (url?: string): string | null => {
			if (!url) return null;
			const match = url.match(/amazonaws\.com\/(.+)$/);
			return match ? match[1] : null;
		};

		if (Array.isArray(message.attachments)) {
			for (const att of message.attachments) {
				const key = extractKey(att.url);
				if (key) keys.push(key);
			}
		}

		const legacyKey = extractKey(message.image as unknown as string);
		if (legacyKey) keys.push(legacyKey);

		// Best-effort deletion of files
		if (keys.length > 0) {
			try {
				await s3Service.deleteMultipleImages(keys);
			} catch (e) {
				console.warn(
					'Warning deleting S3 objects for message:',
					messageId,
					e,
				);
			}
		}

		// Remove message from DB
		await Message.deleteOne({ _id: messageId });

		// Notify both users via socket
		const socketService = getSocketService();
		socketService.emitMessageDeleted({
			messageId,
			receiverId: String(message.receiverId),
			senderId: String(message.senderId),
		});

		return res.status(200).json({ success: true });
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error('Error in deleteMessage:', msg);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
