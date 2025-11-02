import { Schema, model, Document, Types } from 'mongoose';

export interface IAppointment extends Document {
	agentId: Types.ObjectId;
	clientId?: Types.ObjectId; // Optional for guest bookings
	isGuestBooking: boolean; // True if booked without login

	// Appointment details
	appointmentType: 'estimation' | 'vente' | 'achat' | 'conseil';
	status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

	// Date and time
	scheduledDate: Date;
	scheduledTime: string; // Format: "HH:MM"
	duration: number; // Duration in minutes (default 60)

	// Property details (optional)
	propertyDetails?: {
		address?: string;
		city?: string;
		postalCode?: string;
		propertyType?: string;
		description?: string;
	};

	// Contact details
	contactDetails: {
		name: string;
		email: string;
		phone: string;
	};

	// Additional information
	notes?: string;

	// Reschedule tracking
	isRescheduled?: boolean;
	rescheduleReason?: string;
	originalScheduledDate?: Date;
	originalScheduledTime?: string;

	// Cancellation/Rejection
	cancellationReason?: string;
	cancelledBy?: Types.ObjectId;
	cancelledAt?: Date;

	// Agent response
	agentNotes?: string;
	respondedAt?: Date;

	createdAt: Date;
	updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
	{
		agentId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		clientId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: false,
			index: true,
		},
		isGuestBooking: {
			type: Boolean,
			default: false,
			index: true,
		},
		appointmentType: {
			type: String,
			enum: ['estimation', 'vente', 'achat', 'conseil'],
			required: true,
		},
		status: {
			type: String,
			enum: [
				'pending',
				'confirmed',
				'completed',
				'cancelled',
				'rejected',
			],
			default: 'pending',
			index: true,
		},
		scheduledDate: {
			type: Date,
			required: true,
			index: true,
		},
		scheduledTime: {
			type: String,
			required: true,
			validate: {
				validator: function (v: string) {
					return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
				},
				message: 'Time must be in HH:MM format',
			},
		},
		duration: {
			type: Number,
			default: 60,
			min: 15,
			max: 480,
		},
		propertyDetails: {
			type: {
				address: { type: String, trim: true },
				city: { type: String, trim: true },
				postalCode: { type: String, trim: true },
				propertyType: { type: String, trim: true },
				description: { type: String, trim: true, maxlength: 1000 },
			},
			required: false,
		},
		contactDetails: {
			type: {
				name: { type: String, required: true, trim: true },
				email: {
					type: String,
					required: true,
					trim: true,
					lowercase: true,
				},
				phone: { type: String, required: true, trim: true },
			},
			required: true,
		},
		notes: {
			type: String,
			trim: true,
			maxlength: 2000,
		},
		isRescheduled: {
			type: Boolean,
			default: false,
		},
		rescheduleReason: {
			type: String,
			trim: true,
			maxlength: 500,
		},
		originalScheduledDate: {
			type: Date,
		},
		originalScheduledTime: {
			type: String,
		},
		cancellationReason: {
			type: String,
			trim: true,
			maxlength: 500,
		},
		cancelledBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		cancelledAt: {
			type: Date,
		},
		agentNotes: {
			type: String,
			trim: true,
			maxlength: 1000,
		},
		respondedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	},
);

// Indexes for efficient queries
AppointmentSchema.index({ agentId: 1, scheduledDate: 1 });
AppointmentSchema.index({ clientId: 1, status: 1 });
AppointmentSchema.index({ scheduledDate: 1, status: 1 });

const Appointment = model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
