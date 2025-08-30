import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Message document
export interface IMessage extends Document {
	senderId: mongoose.Types.ObjectId;
	receiverId: mongoose.Types.ObjectId;
	text?: string;
	image?: string;
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
