import { Types } from 'mongoose';
import {
	Notification,
	INotification,
	NotificationType,
} from '../models/Notification';
import { getSocketService } from '../server';
import { logger } from '../utils/logger';

type EntityType = 'chat' | 'collaboration' | 'appointment';

export interface CreateNotificationInput {
	recipientId: string | Types.ObjectId;
	actorId: string | Types.ObjectId;
	type: NotificationType;
	entity: { type: EntityType; id: string | Types.ObjectId };
	title: string;
	message: string;
	data?: Record<string, unknown>;
	dedupeKey?: string;
}

export interface ListParams {
	userId: string;
	cursor?: string; // ISO date string
	limit?: number;
}

const toObjectId = (id: string | Types.ObjectId) =>
	typeof id === 'string' ? new Types.ObjectId(id) : id;

export const notificationService = {
	async create(input: CreateNotificationInput): Promise<INotification> {
		const doc = new Notification({
			recipientId: toObjectId(input.recipientId),
			actorId: toObjectId(input.actorId),
			type: input.type,
			entity: {
				type: input.entity.type,
				id: toObjectId(input.entity.id),
			},
			title: input.title,
			message: input.message,
			data: input.data ?? {},
			read: false,
			readAt: undefined,
			dedupeKey: input.dedupeKey,
		});

		await doc.save();
		logger.debug('[NotificationService] Notification created::', {
			id: String(doc._id),
			type: doc.type,
			recipientId: String(doc.recipientId),
		});

		// Skip socket side-effects in tests to keep unit tests deterministic
		if (process.env.NODE_ENV !== 'test') {
			try {
				// Emit socket events
				const socketService = getSocketService();
				const recipientId = String(doc.recipientId);
				const socketId = socketService.getReceiverSocketId(recipientId);

				if (socketId) {
					logger.debug(
						'[NotificationService] Emitting notification via socket: via socket:',
						{
							recipientId,
							socketId,
							type: doc.type,
						},
					);
				} else {
					logger.warn(
						'[NotificationService] Recipient not connected via socket: via socket:',
						{
							recipientId,
							type: doc.type,
						},
					);
				}

				socketService.emitToUser(recipientId, 'notification:new', {
					notification: {
						id: String(doc._id),
						type: doc.type,
						title: doc.title,
						message: doc.message,
						entity: {
							type: doc.entity.type,
							id: String(doc.entity.id),
						},
						data: doc.data || {},
						actorId: String(doc.actorId),
						read: doc.read,
						createdAt: doc.createdAt,
					},
				});

				// Emit updated unread count
				const unread = await Notification.countDocuments({
					recipientId: doc.recipientId,
					read: false,
				});
				socketService.emitToUser(recipientId, 'notifications:count', {
					unreadCount: unread,
				});
			} catch (err) {
				logger.error(
					'[NotificationService]',
					'? Failed to emit notification via socket:',
					err,
				);
			}
		}

		return doc;
	},

	async list(params: ListParams) {
		const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
		const query: {
			recipientId: Types.ObjectId;
			createdAt?: { $lt: Date };
		} = {
			recipientId: toObjectId(params.userId),
		};
		if (params.cursor) {
			query.createdAt = { $lt: new Date(params.cursor) };
		}
		const items = await Notification.find(query)
			.sort({ createdAt: -1 })
			.limit(limit + 1)
			.lean();

		const hasMore = items.length > limit;
		const sliced = hasMore ? items.slice(0, limit) : items;
		const nextCursor = hasMore
			? sliced[sliced.length - 1].createdAt.toISOString()
			: null;

		return {
			items: sliced.map((n) => ({
				id: String(n._id),
				type: n.type,
				title: n.title,
				message: n.message,
				entity: { type: n.entity.type, id: String(n.entity.id) },
				data: n.data || {},
				actorId: String(n.actorId),
				read: !!n.read,
				createdAt: n.createdAt,
			})),
			nextCursor,
		};
	},

	async countUnread(userId: string) {
		return Notification.countDocuments({
			recipientId: toObjectId(userId),
			read: false,
		});
	},

	async markRead(userId: string, id: string) {
		const res = await Notification.updateOne(
			{
				_id: new Types.ObjectId(id),
				recipientId: toObjectId(userId),
				read: false,
			},
			{ $set: { read: true, readAt: new Date() } },
		);
		if (res.modifiedCount > 0) {
			if (process.env.NODE_ENV !== 'test') {
				try {
					const socketService = getSocketService();
					socketService.emitToUser(userId, 'notification:read', {
						id,
					});
					const unread = await this.countUnread(userId);
					socketService.emitToUser(userId, 'notifications:count', {
						unreadCount: unread,
					});
				} catch {
					// ignore socket errors
				}
			}
		}
	},

	async markAllRead(userId: string) {
		await Notification.updateMany(
			{ recipientId: toObjectId(userId), read: false },
			{ $set: { read: true, readAt: new Date() } },
		);
		if (process.env.NODE_ENV !== 'test') {
			try {
				const socketService = getSocketService();
				socketService.emitToUser(userId, 'notifications:readAll', {
					count: 0,
				});
				socketService.emitToUser(userId, 'notifications:count', {
					unreadCount: 0,
				});
			} catch {
				// ignore socket errors
			}
		}
	},

	async delete(userId: string, id: string) {
		await Notification.deleteOne({
			_id: new Types.ObjectId(id),
			recipientId: toObjectId(userId),
		});
	},
};
