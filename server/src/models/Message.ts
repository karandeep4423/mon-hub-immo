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
		isRead: { type: Boolean, default: false },
		readAt: { type: Date },
	},
	{ timestamps: true },
);

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
