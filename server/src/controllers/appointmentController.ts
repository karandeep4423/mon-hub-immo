import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Appointment from '../models/Appointment';
import AgentAvailability from '../models/AgentAvailability';
import { User, IUser } from '../models/User';
import { getSocketService } from '../server';
import { AuthRequest } from '../types/auth';
import { appointmentEmailService } from '../services/appointmentEmailService';
import { logger } from '../utils/logger';

// Create a new appointment (supports both authenticated and anonymous bookings)
export const createAppointment = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const loggedInUserId = req.user?.id; // May be undefined for guest bookings
		const {
			agentId,
			appointmentType,
			scheduledDate,
			scheduledTime,
			duration,
			propertyDetails,
			contactDetails,
			notes,
		} = req.body;

		// Validate required contact details
		if (
			!contactDetails ||
			!contactDetails.name ||
			!contactDetails.email ||
			!contactDetails.phone
		) {
			res.status(400).json({
				success: false,
				message:
					'Les informations de contact (nom, email, téléphone) sont requises',
			});
			return;
		}

		// Verify agent exists and is an agent
		const agent = await User.findById(agentId);
		if (!agent || agent.userType !== 'agent') {
			res.status(404).json({
				success: false,
				message: 'Agent non trouvé',
			});
			return;
		}

		// Check if time slot is available
		const scheduledDateTime = new Date(scheduledDate);
		const existingAppointment = await Appointment.findOne({
			agentId,
			scheduledDate: scheduledDateTime,
			scheduledTime,
			status: { $in: ['pending', 'confirmed'] },
		});

		if (existingAppointment) {
			res.status(400).json({
				success: false,
				message: "Ce créneau horaire n'est plus disponible",
			});
			return;
		}

		let clientId = loggedInUserId;
		const isGuestBooking = !loggedInUserId;

		// For guest bookings, create or find a guest user
		if (isGuestBooking) {
			// Check if any user already exists with this email (guest or regular)
			const existingUser = await User.findOne({
				email: contactDetails.email.toLowerCase(),
			});

			if (existingUser) {
				// Use the existing user's ID (whether guest or regular user)
				clientId = (existingUser._id as Types.ObjectId).toString();
			} else {
				// Create a new guest user only if no user exists with this email
				const guestUser = await User.create({
					firstName: contactDetails.name.split(' ')[0] || 'Guest',
					lastName:
						contactDetails.name.split(' ').slice(1).join(' ') || '',
					email: contactDetails.email.toLowerCase(),
					phone: contactDetails.phone,
					userType: 'guest',
					isGuest: true,
					isEmailVerified: false,
					profileCompleted: false,
					password: '', // No password for guest users
				});
				clientId = (guestUser._id as Types.ObjectId).toString();
			}
		}

		// Create appointment
		const appointment = await Appointment.create({
			agentId,
			clientId,
			isGuestBooking,
			appointmentType,
			scheduledDate: scheduledDateTime,
			scheduledTime,
			duration: duration || 60,
			propertyDetails,
			contactDetails,
			notes,
			status: 'pending',
		});

		// Populate agent and client details
		const populatedAppointment = await Appointment.findById(appointment._id)
			.populate(
				'agentId',
				'firstName lastName email phone profileImage professionalInfo',
			)
			.populate(
				'clientId',
				'firstName lastName email phone profileImage',
			);

		// Send real-time notification to agent (if online)
		const socketService = getSocketService();
		if (socketService) {
			socketService.emitToUser(agentId, 'appointment:new', {
				appointment: populatedAppointment,
			});
		}

		// Send emails
		try {
			logger.debug(
				'[AppointmentController] Attempting to send appointment emails',
			);
			logger.debug('[AppointmentController] Agent email', agent.email);
			logger.debug(
				'[AppointmentController] Client email',
				contactDetails.email,
			);

			await appointmentEmailService.sendNewAppointmentEmails(
				appointment,
				agent,
				contactDetails.email,
				contactDetails.name,
			);
			logger.debug(
				'[AppointmentController] All appointment emails sent successfully',
			);
		} catch (emailError) {
			logger.error(
				'[AppointmentController] Error sending appointment emails',
				emailError,
			);
			// Don't fail the request if email fails
		}

		res.status(201).json({
			success: true,
			data: populatedAppointment,
			message: 'Demande de rendez-vous envoyée avec succès',
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error creating appointment',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la création du rendez-vous',
		});
	}
};

// Get appointments for logged-in user
export const getMyAppointments = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.user?.id;
		const user = await User.findById(userId);
		const { status, startDate, endDate } = req.query;

		interface AppointmentFilter {
			agentId?: string;
			clientId?: string;
			status?: string;
			scheduledDate?: {
				$gte?: Date;
				$lte?: Date;
			};
		}

		const filter: AppointmentFilter = {};

		// Filter by role
		if (user?.userType === 'agent') {
			filter.agentId = userId;
		} else {
			filter.clientId = userId;
		}

		// Filter by status
		if (status && status !== 'all') {
			filter.status = status as string;
		}

		// Filter by date range
		if (startDate || endDate) {
			filter.scheduledDate = {};
			if (startDate) {
				filter.scheduledDate.$gte = new Date(startDate as string);
			}
			if (endDate) {
				filter.scheduledDate.$lte = new Date(endDate as string);
			}
		}

		const appointments = await Appointment.find(filter)
			.populate(
				'agentId',
				'firstName lastName email phone profileImage professionalInfo',
			)
			.populate('clientId', 'firstName lastName email phone profileImage')
			.populate('cancelledBy', 'firstName lastName')
			.sort({ scheduledDate: 1, scheduledTime: 1 });

		// Custom sort for agents: pending → confirmed → cancelled/rejected, then by date
		let sortedAppointments = appointments;
		if (user?.userType === 'agent') {
			const statusOrder = {
				pending: 1,
				confirmed: 2,
				completed: 3,
				cancelled: 4,
				rejected: 5,
			};

			sortedAppointments = appointments.sort((a, b) => {
				const statusA =
					statusOrder[a.status as keyof typeof statusOrder] || 999;
				const statusB =
					statusOrder[b.status as keyof typeof statusOrder] || 999;

				if (statusA !== statusB) {
					return statusA - statusB;
				}

				// If same status, sort by scheduled date
				return (
					new Date(a.scheduledDate).getTime() -
					new Date(b.scheduledDate).getTime()
				);
			});
		}

		res.status(200).json({
			success: true,
			data: sortedAppointments,
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error fetching appointments',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des rendez-vous',
		});
	}
};

// Get single appointment
export const getAppointment = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;

		const appointment = await Appointment.findById(id)
			.populate(
				'agentId',
				'firstName lastName email phone profileImage professionalInfo',
			)
			.populate('clientId', 'firstName lastName email phone profileImage')
			.populate('cancelledBy', 'firstName lastName');

		if (!appointment) {
			res.status(404).json({
				success: false,
				message: 'Rendez-vous non trouvé',
			});
			return;
		}

		// Check authorization
		const isAgent = appointment.agentId._id.toString() === userId;
		const isClient = appointment.clientId
			? appointment.clientId._id.toString() === userId
			: false;

		if (!isAgent && !isClient) {
			res.status(403).json({
				success: false,
				message: 'Accès non autorisé',
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: appointment,
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error fetching appointment',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération du rendez-vous',
		});
	}
};

// Update appointment status (confirm/reject/complete)
export const updateAppointmentStatus = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;
		const { status, agentNotes, cancellationReason } = req.body;

		const appointment = await Appointment.findById(id);

		if (!appointment) {
			res.status(404).json({
				success: false,
				message: 'Rendez-vous non trouvé',
			});
			return;
		}

		// Check authorization
		const isAgent = appointment.agentId.toString() === userId;
		const isClient = appointment.clientId
			? appointment.clientId.toString() === userId
			: false;

		if (!isAgent && !isClient) {
			res.status(403).json({
				success: false,
				message: 'Accès non autorisé',
			});
			return;
		}

		// Only agents can confirm/reject, both can cancel
		if ((status === 'confirmed' || status === 'rejected') && !isAgent) {
			res.status(403).json({
				success: false,
				message:
					"Seul l'agent peut confirmer ou rejeter un rendez-vous",
			});
			return;
		}

		// Update appointment
		appointment.status = status;
		if (agentNotes) appointment.agentNotes = agentNotes;
		if (status === 'cancelled') {
			appointment.cancelledBy = new Types.ObjectId(userId!);
			appointment.cancelledAt = new Date();
			appointment.cancellationReason = cancellationReason;
		}
		if (status === 'confirmed' || status === 'rejected') {
			appointment.respondedAt = new Date();
		}

		await appointment.save();

		const populatedAppointment = await Appointment.findById(appointment._id)
			.populate(
				'agentId',
				'firstName lastName email phone profileImage professionalInfo',
			)
			.populate('clientId', 'firstName lastName email phone profileImage')
			.populate('cancelledBy', 'firstName lastName');

		// Send email notifications
		if (populatedAppointment) {
			const agent = populatedAppointment.agentId as unknown as IUser;
			const client = populatedAppointment.clientId as unknown as
				| IUser
				| undefined;

			// Determine client name and email
			const clientEmail =
				client?.email || populatedAppointment.contactDetails.email;
			const clientName =
				client && client.firstName && client.lastName
					? `${client.firstName} ${client.lastName}`
					: populatedAppointment.contactDetails.name;

			if (clientEmail) {
				if (status === 'confirmed') {
					await appointmentEmailService.sendAppointmentConfirmedEmail(
						populatedAppointment,
						agent,
						clientEmail,
						clientName,
					);
				} else if (status === 'rejected') {
					await appointmentEmailService.sendAppointmentRejectedEmail(
						populatedAppointment,
						agent,
						clientEmail,
						clientName,
					);
				} else if (status === 'cancelled') {
					await appointmentEmailService.sendAppointmentCancelledEmail(
						populatedAppointment,
						agent,
						clientEmail,
						clientName,
					);
				}
			}
		}

		// Send socket notification only to agent (client gets email)
		const socketService = getSocketService();
		if (socketService && !isAgent && appointment.clientId) {
			// Only send socket notification to agent when client updates
			socketService.emitToUser(
				appointment.agentId.toString(),
				'appointment:updated',
				{
					appointment: populatedAppointment,
				},
			);
		}

		res.status(200).json({
			success: true,
			data: populatedAppointment,
			message: 'Rendez-vous mis à jour avec succès',
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error updating appointment',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la mise à jour du rendez-vous',
		});
	}
};

// Reschedule appointment (agent only)
export const rescheduleAppointment = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;
		const { scheduledDate, scheduledTime, rescheduleReason } = req.body;

		const appointment = await Appointment.findById(id);

		if (!appointment) {
			res.status(404).json({
				success: false,
				message: 'Rendez-vous non trouvé',
			});
			return;
		}

		// Check authorization - ONLY AGENT can reschedule
		const isAgent = appointment.agentId.toString() === userId;

		if (!isAgent) {
			res.status(403).json({
				success: false,
				message: "Seul l'agent peut reporter un rendez-vous",
			});
			return;
		}

		// Check if new time slot is available
		const scheduledDateTime = new Date(scheduledDate);
		const existingAppointment = await Appointment.findOne({
			agentId: appointment.agentId,
			scheduledDate: scheduledDateTime,
			scheduledTime,
			status: { $in: ['pending', 'confirmed'] },
			_id: { $ne: id },
		});

		if (existingAppointment) {
			res.status(400).json({
				success: false,
				message: "Ce créneau horaire n'est plus disponible",
			});
			return;
		}

		// Store original date/time before updating
		if (!appointment.isRescheduled) {
			appointment.originalScheduledDate = appointment.scheduledDate;
			appointment.originalScheduledTime = appointment.scheduledTime;
		}

		// Update appointment - keep status as confirmed, mark as rescheduled
		appointment.scheduledDate = scheduledDateTime;
		appointment.scheduledTime = scheduledTime;
		appointment.isRescheduled = true;
		appointment.rescheduleReason = rescheduleReason;
		await appointment.save();

		const populatedAppointment = await Appointment.findById(appointment._id)
			.populate(
				'agentId',
				'firstName lastName email phone profileImage professionalInfo',
			)
			.populate(
				'clientId',
				'firstName lastName email phone profileImage',
			);

		// Send email to client
		if (populatedAppointment) {
			const agent = populatedAppointment.agentId as unknown as IUser;
			const client = populatedAppointment.clientId as unknown as
				| IUser
				| undefined;

			// Determine client name and email
			const clientEmail =
				client?.email || populatedAppointment.contactDetails.email;
			const clientName =
				client && client.firstName && client.lastName
					? `${client.firstName} ${client.lastName}`
					: populatedAppointment.contactDetails.name;

			if (clientEmail) {
				await appointmentEmailService.sendAppointmentRescheduledEmail(
					populatedAppointment,
					agent,
					clientEmail,
					clientName,
				);
			}
		}

		// Notify client via socket (optional - they get email)
		const socketService = getSocketService();
		if (socketService && appointment.clientId) {
			socketService.emitToUser(
				appointment.clientId.toString(),
				'appointment:rescheduled',
				{
					appointment: populatedAppointment,
				},
			);
		}

		res.status(200).json({
			success: true,
			data: populatedAppointment,
			message: 'Rendez-vous reporté avec succès',
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error rescheduling appointment',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors du report du rendez-vous',
		});
	}
};

// Get appointment statistics
export const getAppointmentStats = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.user?.id;
		const user = await User.findById(userId);

		const filter =
			user?.userType === 'agent'
				? { agentId: userId }
				: { clientId: userId };

		const stats = await Appointment.aggregate([
			{ $match: filter },
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 },
				},
			},
		]);

		const total = await Appointment.countDocuments(filter);
		const upcoming = await Appointment.countDocuments({
			...filter,
			scheduledDate: { $gte: new Date() },
			status: { $in: ['pending', 'confirmed'] },
		});

		res.status(200).json({
			success: true,
			data: {
				total,
				upcoming,
				byStatus: stats,
			},
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error fetching appointment stats',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des statistiques',
		});
	}
};

// Agent Availability Management

// Get agent availability
export const getAgentAvailability = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { agentId } = req.params;

		const availability = await AgentAvailability.findOne({ agentId });

		if (!availability) {
			// Return default availability if not set
			res.status(200).json({
				success: true,
				data: {
					agentId,
					weeklySchedule: [
						{ dayOfWeek: 0, isAvailable: false, slots: [] },
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
						{ dayOfWeek: 6, isAvailable: false, slots: [] },
					],
					dateOverrides: [],
					defaultDuration: 60,
					bufferTime: 15,
					maxAppointmentsPerDay: 8,
					advanceBookingDays: 60,
				},
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: availability,
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error fetching agent availability',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des disponibilités',
		});
	}
};

// Update agent availability
export const updateAgentAvailability = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.user?.id;
		const updateData = req.body;

		const availability = await AgentAvailability.findOneAndUpdate(
			{ agentId: userId },
			{ $set: updateData },
			{ new: true, upsert: true },
		);

		res.status(200).json({
			success: true,
			data: availability,
			message: 'Disponibilités mises à jour avec succès',
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error updating agent availability',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la mise à jour des disponibilités',
		});
	}
};

// Get available time slots for a specific date
export const getAvailableSlots = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { agentId } = req.params;
		const { date } = req.query;

		if (!date) {
			res.status(400).json({
				success: false,
				message: 'Date requise',
			});
			return;
		}

		const selectedDate = new Date(date as string);
		const dayOfWeek = selectedDate.getDay();

		// Get agent availability
		let availability = await AgentAvailability.findOne({ agentId });

		// If no availability exists, create default availability for the agent
		if (!availability) {
			logger.debug(
				`[AppointmentController] Creating default availability for agent ${agentId}`,
			);
			availability = await AgentAvailability.create({
				agentId,
				weeklySchedule: [
					{ dayOfWeek: 0, isAvailable: false, slots: [] }, // Sunday
					{
						dayOfWeek: 1,
						isAvailable: true,
						slots: [{ startTime: '09:00', endTime: '18:00' }],
					}, // Monday
					{
						dayOfWeek: 2,
						isAvailable: true,
						slots: [{ startTime: '09:00', endTime: '18:00' }],
					}, // Tuesday
					{
						dayOfWeek: 3,
						isAvailable: true,
						slots: [{ startTime: '09:00', endTime: '18:00' }],
					}, // Wednesday
					{
						dayOfWeek: 4,
						isAvailable: true,
						slots: [{ startTime: '09:00', endTime: '18:00' }],
					}, // Thursday
					{
						dayOfWeek: 5,
						isAvailable: true,
						slots: [{ startTime: '09:00', endTime: '18:00' }],
					}, // Friday
					{ dayOfWeek: 6, isAvailable: false, slots: [] }, // Saturday
				],
				dateOverrides: [],
				defaultDuration: 60,
				bufferTime: 15,
				maxAppointmentsPerDay: 8,
				advanceBookingDays: 60,
			});
		}

		// Check for date overrides
		const override = availability.dateOverrides.find(
			(o) => o.date.toDateString() === selectedDate.toDateString(),
		);

		let daySchedule;
		if (override) {
			daySchedule = {
				isAvailable: override.isAvailable,
				slots: override.slots || [],
			};
		} else {
			daySchedule = availability.weeklySchedule.find(
				(s) => s.dayOfWeek === dayOfWeek,
			);
		}

		if (!daySchedule || !daySchedule.isAvailable) {
			res.status(200).json({
				success: true,
				data: { slots: [], isAvailable: false },
				message:
					"L'agent n'est pas disponible pour cette date. Veuillez choisir un autre jour.",
			});
			return;
		}

		// Get existing appointments for the date
		const existingAppointments = await Appointment.find({
			agentId,
			scheduledDate: selectedDate,
			status: { $in: ['pending', 'confirmed'] },
		}).select('scheduledTime duration');

		// Generate available slots
		const availableSlotsSet = new Set<string>();
		const bookedSlots = new Set(
			existingAppointments.map((a) => a.scheduledTime),
		);

		for (const slot of daySchedule.slots) {
			const [startHour, startMin] = slot.startTime.split(':').map(Number);
			const [endHour, endMin] = slot.endTime.split(':').map(Number);

			let currentTime = startHour * 60 + startMin;
			const endTime = endHour * 60 + endMin;

			while (currentTime + availability.defaultDuration <= endTime) {
				const hours = Math.floor(currentTime / 60)
					.toString()
					.padStart(2, '0');
				const mins = (currentTime % 60).toString().padStart(2, '0');
				const timeSlot = `${hours}:${mins}`;

				if (!bookedSlots.has(timeSlot)) {
					availableSlotsSet.add(timeSlot);
				}

				currentTime +=
					availability.defaultDuration + availability.bufferTime;
			}
		}

		const availableSlots = Array.from(availableSlotsSet).sort();

		res.status(200).json({
			success: true,
			data: {
				slots: availableSlots,
				isAvailable: true,
				duration: availability.defaultDuration,
			},
		});
	} catch (error) {
		logger.error(
			'[AppointmentController] Error fetching available slots',
			error,
		);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des créneaux disponibles',
		});
	}
};
