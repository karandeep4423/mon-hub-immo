import { Schema, model, Document, Types } from 'mongoose';

export interface ITimeSlot {
	startTime: string; // Format: "HH:MM"
	endTime: string; // Format: "HH:MM"
}

export interface IDayAvailability {
	dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
	isAvailable: boolean;
	slots: ITimeSlot[];
}

export interface IAgentAvailability extends Document {
	agentId: Types.ObjectId;

	// Weekly recurring schedule
	weeklySchedule: IDayAvailability[];

	// Specific date overrides (for holidays, special days off, etc.)
	dateOverrides: Array<{
		date: Date;
		isAvailable: boolean;
		slots?: ITimeSlot[];
	}>;

	// Appointment duration preferences
	defaultDuration: number; // in minutes
	bufferTime: number; // Buffer time between appointments in minutes

	// Advanced settings
	maxAppointmentsPerDay?: number;
	advanceBookingDays?: number; // How many days in advance can clients book

	createdAt: Date;
	updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>(
	{
		startTime: {
			type: String,
			required: true,
			validate: {
				validator: function (v: string) {
					return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
				},
				message: 'Time must be in HH:MM format',
			},
		},
		endTime: {
			type: String,
			required: true,
			validate: {
				validator: function (v: string) {
					return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
				},
				message: 'Time must be in HH:MM format',
			},
		},
	},
	{ _id: false },
);

const DayAvailabilitySchema = new Schema<IDayAvailability>(
	{
		dayOfWeek: {
			type: Number,
			required: true,
			min: 0,
			max: 6,
		},
		isAvailable: {
			type: Boolean,
			default: true,
		},
		slots: {
			type: [TimeSlotSchema],
			default: [],
		},
	},
	{ _id: false },
);

const AgentAvailabilitySchema = new Schema<IAgentAvailability>(
	{
		agentId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
			index: true,
		},
		weeklySchedule: {
			type: [DayAvailabilitySchema],
			default: [
				{ dayOfWeek: 0, isAvailable: false, slots: [] }, // Sunday
				{
					dayOfWeek: 1,
					isAvailable: true,
					slots: [{ startTime: '09:00', endTime: '18:00' }],
				},
				{
					dayOfWeek: 2,
					isAvailable: true,
					slots: [{ startTime: '09:00', endTime: '18:00' }],
				},
				{
					dayOfWeek: 3,
					isAvailable: true,
					slots: [{ startTime: '09:00', endTime: '18:00' }],
				},
				{
					dayOfWeek: 4,
					isAvailable: true,
					slots: [{ startTime: '09:00', endTime: '18:00' }],
				},
				{
					dayOfWeek: 5,
					isAvailable: true,
					slots: [{ startTime: '09:00', endTime: '18:00' }],
				},
				{ dayOfWeek: 6, isAvailable: false, slots: [] }, // Saturday
			],
		},
		dateOverrides: {
			type: [
				{
					date: { type: Date, required: true },
					isAvailable: { type: Boolean, required: true },
					slots: { type: [TimeSlotSchema], default: [] },
				},
			],
			default: [],
		},
		defaultDuration: {
			type: Number,
			default: 60,
			min: 15,
			max: 480,
		},
		bufferTime: {
			type: Number,
			default: 15,
			min: 0,
			max: 60,
		},
		maxAppointmentsPerDay: {
			type: Number,
			default: 8,
			min: 1,
			max: 20,
		},
		advanceBookingDays: {
			type: Number,
			default: 60,
			min: 1,
			max: 365,
		},
	},
	{
		timestamps: true,
	},
);

const AgentAvailability = model<IAgentAvailability>(
	'AgentAvailability',
	AgentAvailabilitySchema,
);

export default AgentAvailability;
