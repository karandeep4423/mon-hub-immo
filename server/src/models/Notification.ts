import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
	| 'chat:new_message'
	| 'collab:proposal_received'
	| 'collab:proposal_accepted'
	| 'collab:proposal_rejected'
	| 'contract:updated'
	| 'contract:signed'
	| 'collab:activated'
	| 'collab:progress_updated'
	| 'collab:cancelled'
	| 'collab:completed'
	| 'collab:note_added'
	| 'appointment:new'
	| 'appointment:confirmed'
	| 'appointment:rejected'
	| 'appointment:cancelled'
	| 'appointment:rescheduled';

export interface INotification extends Document {
	_id: Types.ObjectId;
	recipientId: Types.ObjectId;
	actorId: Types.ObjectId;
	type: NotificationType;
	entity: {
		type: 'chat' | 'collaboration' | 'appointment';
		id: Types.ObjectId;
	};
	title: string;
	message: string;
	data?: Record<string, unknown>;
	read: boolean;
	readAt?: Date;
	dedupeKey?: string;
	createdAt: Date;
	updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
	{
		recipientId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		actorId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: [
				'chat:new_message',
				'collab:proposal_received',
				'collab:proposal_accepted',
				'collab:proposal_rejected',
				'contract:updated',
				'contract:signed',
				'collab:activated',
				'collab:progress_updated',
				'collab:cancelled',
				'collab:completed',
				'collab:note_added',
				'appointment:new',
				'appointment:confirmed',
				'appointment:rejected',
				'appointment:cancelled',
				'appointment:rescheduled',
			],
			required: true,
		},
		entity: {
			type: new Schema(
				{
					type: {
						type: String,
						enum: ['chat', 'collaboration', 'appointment'],
						required: true,
					},
					id: { type: Schema.Types.ObjectId, required: true },
				},
				{ _id: false },
			),
			required: true,
		},
		title: { type: String, required: true },
		message: { type: String, required: true },
		data: { type: Schema.Types.Mixed },
		read: { type: Boolean, default: false, index: true },
		readAt: { type: Date },
		dedupeKey: { type: String, unique: false, sparse: true },
	},
	{ timestamps: true, collection: 'notifications' },
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
// Optional unique dedupe can be enabled by migration when needed per-type
// notificationSchema.index({ dedupeKey: 1 }, { unique: true, sparse: true });

export const Notification = mongoose.model<INotification>(
	'Notification',
	notificationSchema,
);
