import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Message document
export interface IMessage extends Document {
	senderId: mongoose.Types.ObjectId;
	receiverId: mongoose.Types.ObjectId;
	text?: string;
	image?: string;
	attachments?: Array<{
		url: string;
		name: string;
		mime: string;
		size: number;
		type: 'image' | 'pdf' | 'doc' | 'docx' | 'file';
		thumbnailUrl?: string;
	}>;
	createdAt: Date;
	updatedAt: Date;
	isRead: boolean;
	readAt?: Date;
}

const messageSchema: Schema<IMessage> = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		text: {
			type: String,
		},
		image: {
			type: String,
		},
		attachments: [
			new mongoose.Schema(
				{
					url: { type: String, required: true },
					name: { type: String, required: true },
					mime: { type: String, required: true },
					size: { type: Number, required: true },
					type: {
						type: String,
						enum: ['image', 'pdf', 'doc', 'docx', 'file'],
						required: true,
					},
					thumbnailUrl: { type: String },
				},
				{ _id: false },
			),
		],
		isRead: {
			type: Boolean,
			default: false,
			index: true, // Add index for better performance on unread count queries
		},
		readAt: { type: Date },
	},
	{ timestamps: true },
);

// Add compound index for better performance on unread count queries
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
