import { sendEmail } from '../utils/emailService';
import {
	getNewAppointmentClientTemplate,
	getNewAppointmentAgentTemplate,
	getAppointmentConfirmedTemplate,
	getAppointmentRejectedTemplate,
	getAppointmentCancelledTemplate,
	getAppointmentRescheduledTemplate,
	AppointmentEmailData,
} from '../utils/appointmentEmailTemplates';
import { logger } from '../utils/logger';
import { IAppointment } from '../models/Appointment';
import { IUser } from '../models/User';

export class AppointmentEmailService {
	async sendNewAppointmentEmails(
		appointment: IAppointment,
		agent: IUser,
		clientEmail: string,
		clientName: string,
	): Promise<void> {
		logger.info('========================================');
		logger.info(
			'[AppointmentEmailService] 📧 Starting to send appointment booking emails',
		);
		logger.info('[AppointmentEmailService] Agent ID:', String(agent._id));
		logger.info(
			'[AppointmentEmailService] Agent Name:',
			`${agent.firstName} ${agent.lastName}`,
		);
		logger.info('[AppointmentEmailService] Agent Email:', agent.email);
		logger.info('[AppointmentEmailService] Client Name:', clientName);
		logger.info('[AppointmentEmailService] Client Email:', clientEmail);
		logger.info(
			'[AppointmentEmailService] Appointment Type:',
			appointment.appointmentType,
		);
		logger.info('========================================');

		const scheduledDate = new Date(
			appointment.scheduledDate,
		).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		// Send email to client
		logger.info(
			'[AppointmentEmailService] 📤 Step 1/2: Sending email to CLIENT...',
		);
		const clientData: AppointmentEmailData = {
			clientName,
			agentName: `${agent.firstName} ${agent.lastName}`,
			appointmentType: appointment.appointmentType,
			scheduledDate,
			scheduledTime: appointment.scheduledTime,
		};

		try {
			await sendEmail({
				to: clientEmail,
				subject: 'Demande de rendez-vous envoyée - MonHubImmo',
				html: getNewAppointmentClientTemplate(clientData),
			});
			logger.info(
				'[AppointmentEmailService] ✅ CLIENT email sent successfully to:',
				clientEmail,
			);
		} catch (clientEmailError) {
			logger.error(
				'[AppointmentEmailService] ❌ Failed to send CLIENT email:',
				clientEmailError,
			);
			throw clientEmailError;
		}

		// Send email to agent
		logger.info(
			'[AppointmentEmailService] 📤 Step 2/2: Sending email to AGENT...',
		);
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

		logger.info('[AppointmentEmailService] Agent email details:', {
			to: agent.email,
			subject: 'Nouvelle demande de rendez-vous - MonHubImmo',
			clientName,
			clientEmail: appointment.contactDetails.email,
			clientPhone: appointment.contactDetails.phone,
		});

		try {
			await sendEmail({
				to: agent.email,
				subject: 'Nouvelle demande de rendez-vous - MonHubImmo',
				html: getNewAppointmentAgentTemplate(agentData),
			});
			logger.info(
				'[AppointmentEmailService] ✅ AGENT email sent successfully to:',
				agent.email,
			);
		} catch (agentEmailError) {
			logger.error(
				'[AppointmentEmailService] ❌ Failed to send AGENT email:',
				agentEmailError,
			);
			throw agentEmailError;
		}

		logger.info(
			'[AppointmentEmailService] 🎉 Both emails sent successfully!',
		);
		logger.info('========================================');
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

		await sendEmail({
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

		await sendEmail({
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

		await sendEmail({
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

		await sendEmail({
			to: clientEmail,
			subject: 'Rendez-vous reporté - MonHubImmo',
			html: getAppointmentRescheduledTemplate(data),
		});
	}
}

export const appointmentEmailService = new AppointmentEmailService();
