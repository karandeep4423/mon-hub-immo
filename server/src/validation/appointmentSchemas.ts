import { z } from 'zod';

export const createAppointmentSchema = z.object({
	agentId: z.string().min(1, 'Agent ID est requis'),
	appointmentType: z.enum(['estimation', 'vente', 'achat', 'conseil'], {
		errorMap: () => ({ message: 'Type de rendez-vous invalide' }),
	}),
	scheduledDate: z.string().refine(
		(date) => {
			const d = new Date(date);
			return !isNaN(d.getTime()) && d > new Date();
		},
		{ message: 'Date invalide ou passée' },
	),
	scheduledTime: z
		.string()
		.regex(
			/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
			'Format horaire invalide (HH:MM)',
		),
	duration: z.number().min(15).max(480).optional(),
	propertyDetails: z
		.object({
			address: z.string().max(200).optional(),
			city: z.string().max(100).optional(),
			postalCode: z.string().max(10).optional(),
			propertyType: z.string().max(50).optional(),
			description: z.string().max(1000).optional(),
		})
		.optional(),
	contactDetails: z.object({
		name: z.string().min(1, 'Nom requis').max(100),
		email: z.string().email('Email invalide'),
		phone: z.string().min(10, 'Numéro de téléphone invalide').max(20),
	}),
	notes: z.string().max(2000).optional(),
});

export const updateAppointmentStatusSchema = z.object({
	status: z.enum(['confirmed', 'completed', 'cancelled', 'rejected']),
	agentNotes: z.string().max(1000).optional(),
	cancellationReason: z.string().max(500).optional(),
});

export const rescheduleAppointmentSchema = z.object({
	scheduledDate: z.string().refine(
		(date) => {
			const d = new Date(date);
			return !isNaN(d.getTime()) && d > new Date();
		},
		{ message: 'Date invalide ou passée' },
	),
	scheduledTime: z
		.string()
		.regex(
			/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
			'Format horaire invalide (HH:MM)',
		),
});

export const updateAvailabilitySchema = z.object({
	weeklySchedule: z
		.array(
			z.object({
				dayOfWeek: z.number().min(0).max(6),
				isAvailable: z.boolean(),
				slots: z.array(
					z.object({
						startTime: z
							.string()
							.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
						endTime: z
							.string()
							.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
					}),
				),
			}),
		)
		.optional(),
	dateOverrides: z
		.array(
			z.object({
				date: z.string(),
				isAvailable: z.boolean(),
				slots: z
					.array(
						z.object({
							startTime: z
								.string()
								.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
							endTime: z
								.string()
								.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
						}),
					)
					.optional(),
			}),
		)
		.optional(),
	defaultDuration: z.number().min(15).max(480).optional(),
	bufferTime: z.number().min(0).max(60).optional(),
	maxAppointmentsPerDay: z.number().min(1).max(20).optional(),
	advanceBookingDays: z.number().min(1).max(365).optional(),
});
