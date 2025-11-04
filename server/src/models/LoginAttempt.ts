import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginAttempt extends Document {
	identifier: string; // IP + Email combination
	ip: string;
	email: string;
	attemptCount: number;
	resetAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const LoginAttemptSchema: Schema = new Schema(
	{
		identifier: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		ip: {
			type: String,
			required: true,
			index: true,
		},
		email: {
			type: String,
			required: true,
			lowercase: true,
			index: true,
		},
		attemptCount: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
		},
		resetAt: {
			type: Date,
			required: true,
			index: true,
		},
	},
	{
		timestamps: true,
	},
);

// Index for automatic cleanup of expired records
LoginAttemptSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient queries
LoginAttemptSchema.index({ ip: 1, email: 1 });

export const LoginAttempt = mongoose.model<ILoginAttempt>(
	'LoginAttempt',
	LoginAttemptSchema,
);
