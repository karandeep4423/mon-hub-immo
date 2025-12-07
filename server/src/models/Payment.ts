import mongoose, { Document, Schema } from 'mongoose';

/**
 * Payment Model
 * Tracks all payment transactions for audit and history purposes
 */

export interface IPayment extends Document {
	userId: mongoose.Types.ObjectId;
	stripeInvoiceId: string;
	stripePaymentIntentId?: string;
	stripeSubscriptionId?: string;
	stripeCustomerId: string;
	amount: number; // Amount in cents
	amountFormatted: number; // Amount in euros
	currency: string;
	status: 'succeeded' | 'failed' | 'pending' | 'refunded';
	description?: string;
	invoicePdf?: string;
	receiptUrl?: string;
	hostedInvoiceUrl?: string;
	paidAt?: Date;
	failedAt?: Date;
	refundedAt?: Date;
	refundAmount?: number;
	billingReason?:
		| 'subscription_create'
		| 'subscription_cycle'
		| 'subscription_update'
		| 'manual';
	metadata?: Record<string, string>;
	createdAt: Date;
	updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		stripeInvoiceId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		stripePaymentIntentId: {
			type: String,
			index: true,
		},
		stripeSubscriptionId: {
			type: String,
			index: true,
		},
		stripeCustomerId: {
			type: String,
			required: true,
			index: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		amountFormatted: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			default: 'eur',
		},
		status: {
			type: String,
			enum: ['succeeded', 'failed', 'pending', 'refunded'],
			required: true,
			index: true,
		},
		description: {
			type: String,
		},
		invoicePdf: {
			type: String,
		},
		receiptUrl: {
			type: String,
		},
		hostedInvoiceUrl: {
			type: String,
		},
		paidAt: {
			type: Date,
		},
		failedAt: {
			type: Date,
		},
		refundedAt: {
			type: Date,
		},
		refundAmount: {
			type: Number,
		},
		billingReason: {
			type: String,
			enum: [
				'subscription_create',
				'subscription_cycle',
				'subscription_update',
				'manual',
			],
		},
		metadata: {
			type: Map,
			of: String,
		},
	},
	{
		timestamps: true,
	},
);

// Compound indexes for common queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
