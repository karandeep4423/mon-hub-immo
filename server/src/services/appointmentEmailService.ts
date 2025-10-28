import { emailService } from '../utils/emailService';
import {
	getNewAppointmentClientTemplate,
	getNewAppointmentAgentTemplate,
	getAppointmentConfirmedTemplate,
	getAppointmentRejectedTemplate,
	getAppointmentCancelledTemplate,
	getAppointmentRescheduledTemplate,
	AppointmentEmailData,
} from '../utils/appointmentEmailTemplates';
import { IAppointment } from '../models/Appointment';
import { IUser } from '../models/User';

export class AppointmentEmailService {
	async sendNewAppointmentEmails(
		appointment: IAppointment,
		agent: IUser,
		clientEmail: string,
		clientName: string,
	): Promise<void> {
		const scheduledDate = new Date(
			appointment.scheduledDate,
		).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		// Send email to client
		const clientData: AppointmentEmailData = {
			clientName,
			agentName: `${agent.firstName} ${agent.lastName}`,
			appointmentType: appointment.appointmentType,
			scheduledDate,
			scheduledTime: appointment.scheduledTime,
		};

		await emailService.sendEmail({
			to: clientEmail,
			subject: 'Demande de rendez-vous envoyée - MonHubImmo',
			html: getNewAppointmentClientTemplate(clientData),
		});

		// Send email to agent
		const agentData: AppointmentEmailData = {
			clientName,
			agentName: `${agent.firstName} ${agent.lastName}`,
			appointmentType: appointment.appointmentType,
			scheduledDate,
			scheduledTime: appointment.scheduledTime,
			clientEmail: appointment.contactDetails.email,
			clientPhone: appointment.contactDetails.phone,
			notes: appointment.notes,
		};

		console.log('📧 Sending email to agent:', agent.email);
		await emailService.sendEmail({
			to: agent.email,
			subject: 'Nouvelle demande de rendez-vous - MonHubImmo',
			html: getNewAppointmentAgentTemplate(agentData),
		});
		console.log('✅ Agent email sent successfully');
	}

	async sendAppointmentConfirmedEmail(
		appointment: IAppointment,
		agent: IUser,
		clientEmail: string,
		clientName: string,
	): Promise<void> {
		const scheduledDate = new Date(
			appointment.scheduledDate,
		).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		const data: AppointmentEmailData = {
			clientName,
			agentName: `${agent.firstName} ${agent.lastName}`,
			appointmentType: appointment.appointmentType,
			scheduledDate,
			scheduledTime: appointment.scheduledTime,
		};

		await emailService.sendEmail({
			to: clientEmail,
			subject: 'Rendez-vous confirmé - MonHubImmo',
			html: getAppointmentConfirmedTemplate(data),
		});
	}

	async sendAppointmentRejectedEmail(
		appointment: IAppointment,
		agent: IUser,
		clientEmail: string,
		clientName: string,
	): Promise<void> {
		const scheduledDate = new Date(
			appointment.scheduledDate,
		).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		const data: AppointmentEmailData = {
			clientName,
			agentName: `${agent.firstName} ${agent.lastName}`,
			appointmentType: appointment.appointmentType,
			scheduledDate,
			scheduledTime: appointment.scheduledTime,
			reason: appointment.cancellationReason,
		};

		await emailService.sendEmail({
			to: clientEmail,
			subject: 'Rendez-vous refusé - MonHubImmo',
			html: getAppointmentRejectedTemplate(data),
		});
	}

	async sendAppointmentCancelledEmail(
		appointment: IAppointment,
		agent: IUser,
		clientEmail: string,
		clientName: string,
	): Promise<void> {
		const scheduledDate = new Date(
			appointment.scheduledDate,
		).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		const data: AppointmentEmailData = {
			clientName,
			agentName: `${agent.firstName} ${agent.lastName}`,
			appointmentType: appointment.appointmentType,
			scheduledDate,
			scheduledTime: appointment.scheduledTime,
			reason: appointment.cancellationReason,
		};

		await emailService.sendEmail({
			to: clientEmail,
			subject: 'Rendez-vous annulé - MonHubImmo',
			html: getAppointmentCancelledTemplate(data),
		});
	}

	async sendAppointmentRescheduledEmail(
		appointment: IAppointment,
		agent: IUser,
		clientEmail: string,
		clientName: string,
	): Promise<void> {
		const scheduledDate = new Date(
			appointment.scheduledDate,
		).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		const originalScheduledDate = appointment.originalScheduledDate
			? new Date(appointment.originalScheduledDate).toLocaleDateString(
					'fr-FR',
					{
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					},
				)
			: undefined;

		const data: AppointmentEmailData = {
			clientName,
			agentName: `${agent.firstName} ${agent.lastName}`,
			appointmentType: appointment.appointmentType,
			scheduledDate,
			scheduledTime: appointment.scheduledTime,
			originalScheduledDate,
			originalScheduledTime: appointment.originalScheduledTime,
			reason: appointment.rescheduleReason,
		};

		await emailService.sendEmail({
			to: clientEmail,
			subject: 'Rendez-vous reporté - MonHubImmo',
			html: getAppointmentRescheduledTemplate(data),
		});
	}
}

export const appointmentEmailService = new AppointmentEmailService();
