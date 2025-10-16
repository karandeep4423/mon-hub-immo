import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Appointment from '../models/Appointment';
import AgentAvailability from '../models/AgentAvailability';
import { User } from '../models/User';
import { getSocketService } from '../server';
import { AuthRequest } from '../types/auth';

// Create a new appointment
export const createAppointment = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const clientId = req.user?.id;
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

		// Create appointment
		const appointment = await Appointment.create({
			agentId,
			clientId,
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

		// Send real-time notification to agent
		const socketService = getSocketService();
		if (socketService) {
			socketService.emitToUser(agentId, 'appointment:new', {
				appointment: populatedAppointment,
			});
		}

		res.status(201).json({
			success: true,
			data: populatedAppointment,
			message: 'Demande de rendez-vous envoyée avec succès',
		});
	} catch (error) {
		console.error('Error creating appointment:', error);
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

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const filter: any = {};

		// Filter by role
		if (user?.userType === 'agent') {
			filter.agentId = userId;
		} else {
			filter.clientId = userId;
		}

		// Filter by status
		if (status && status !== 'all') {
			filter.status = status;
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

		res.status(200).json({
			success: true,
			data: appointments,
		});
	} catch (error) {
		console.error('Error fetching appointments:', error);
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
		if (
			appointment.agentId._id.toString() !== userId &&
			appointment.clientId._id.toString() !== userId
		) {
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
		console.error('Error fetching appointment:', error);
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
		const isClient = appointment.clientId.toString() === userId;

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

		// Send notification to the other party
		const socketService = getSocketService();
		const notifyUserId = isAgent
			? appointment.clientId.toString()
			: appointment.agentId.toString();

		if (socketService) {
			socketService.emitToUser(notifyUserId, 'appointment:updated', {
				appointment: populatedAppointment,
			});
		}

		res.status(200).json({
			success: true,
			data: populatedAppointment,
			message: 'Rendez-vous mis à jour avec succès',
		});
	} catch (error) {
		console.error('Error updating appointment:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la mise à jour du rendez-vous',
		});
	}
};

// Reschedule appointment
export const rescheduleAppointment = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?.id;
		const { scheduledDate, scheduledTime } = req.body;

		const appointment = await Appointment.findById(id);

		if (!appointment) {
			res.status(404).json({
				success: false,
				message: 'Rendez-vous non trouvé',
			});
			return;
		}

		// Check authorization
		if (
			appointment.agentId.toString() !== userId &&
			appointment.clientId.toString() !== userId
		) {
			res.status(403).json({
				success: false,
				message: 'Accès non autorisé',
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

		// Update appointment
		appointment.scheduledDate = scheduledDateTime;
		appointment.scheduledTime = scheduledTime;
		appointment.status = 'pending'; // Reset to pending after rescheduling
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

		// Notify the other party
		const socketService = getSocketService();
		const notifyUserId =
			appointment.agentId.toString() === userId
				? appointment.clientId.toString()
				: appointment.agentId.toString();

		if (socketService) {
			socketService.emitToUser(notifyUserId, 'appointment:rescheduled', {
				appointment: populatedAppointment,
			});
		}

		res.status(200).json({
			success: true,
			data: populatedAppointment,
			message: 'Rendez-vous reporté avec succès',
		});
	} catch (error) {
		console.error('Error rescheduling appointment:', error);
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
		console.error('Error fetching appointment stats:', error);
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
		console.error('Error fetching agent availability:', error);
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
		console.error('Error updating agent availability:', error);
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
			console.log(`Creating default availability for agent ${agentId}`);
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
		console.error('Error fetching available slots:', error);
		res.status(500).json({
			success: false,
			message: 'Erreur lors de la récupération des créneaux disponibles',
		});
	}
};
