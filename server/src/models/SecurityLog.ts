import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityLog extends Document {
	userId: mongoose.Types.ObjectId;
	eventType:
			| 'login_success'
		| 'login_failure'
		| 'password_reset_request'
		| 'password_reset_success'
		| 'password_change'
		| 'account_locked'
			| 'account_blocked'
			| 'account_unblocked'
		| 'account_unlocked'
		| 'logout'
		| 'email_verified'
			| 'invite_sent'
			| 'temp_password_sent'
			| 'account_access_granted'
			| 'account_access_revoked'
			| 'account_validated'
			| 'email_send_failed'
		| 'failed_verification_attempt'
		| 'account_deleted';
	ipAddress?: string;
	userAgent?: string;
	metadata?: {
		email?: string;
		reason?: string;
		attemptsRemaining?: number;
		lockedUntil?: Date;
		[key: string]: unknown;
	};
	createdAt: Date;
}

const securityLogSchema = new Schema<ISecurityLog>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		eventType: {
			type: String,
			required: true,
			enum: [
				'login_success',
				'login_failure',
				'password_reset_request',
				'password_reset_success',
				'password_change',
				'account_locked',
				'account_blocked',
				'account_unblocked',
				'account_unlocked',
				'logout',
				'email_verified',
				'invite_sent',
				'temp_password_sent',
				'account_access_granted',
				'account_access_revoked',
				'account_validated',
				'email_send_failed',
				'failed_verification_attempt',
				'account_deleted',
			],
			index: true,
		},
		ipAddress: {
			type: String,
			trim: true,
		},
		userAgent: {
			type: String,
			trim: true,
		},
		metadata: {
			type: Schema.Types.Mixed,
			default: {},
		},
	},
	{
		timestamps: true,
	},
);

// Compound index for efficient user event queries
securityLogSchema.index({ userId: 1, createdAt: -1 });
securityLogSchema.index({ eventType: 1, createdAt: -1 });

// TTL index - automatically delete logs older than 90 days
securityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const SecurityLog = mongoose.model<ISecurityLog>(
	'SecurityLog',
	securityLogSchema,
);
