import nodemailer from 'nodemailer';
import * as brevo from '@getbrevo/brevo';
import { logger } from './logger';
import { getSignupAcknowledgementTemplate } from './email/templates/signupAcknowledgement';
import { getAccountValidatedTemplate } from './email/templates/accountValidated';
import { getInviteTemplate } from './email/templates/invite';
import { getTemporaryPasswordTemplate } from './email/templates/temporaryPassword';
import { getVerificationCodeTemplate } from './email/templates/verificationCode';
import { getPasswordResetTemplate } from './email/templates/passwordReset';
import { getPasswordResetConfirmationTemplate } from './email/templates/passwordResetConfirmation';
import { getAccountLockedTemplate } from './email/templates/accountLocked';
import { getAccountBlockedTemplate } from './email/templates/accountBlocked';
import { getAccountUnblockedTemplate } from './email/templates/accountUnblocked';
import { getPaymentReminderTemplate } from './email/templates/paymentReminder';
import { getPaymentSuccessTemplate } from './email/templates/paymentSuccess';
import { getPaymentFailedTemplate } from './email/templates/paymentFailed';
import { getSubscriptionCanceledTemplate } from './email/templates/subscriptionCanceled';
import { getSubscriptionExpiringSoonTemplate } from './email/templates/subscriptionExpiringSoon';

// Re-export templates for backward compatibility with existing imports
export { getSignupAcknowledgementTemplate } from './email/templates/signupAcknowledgement';
export { getAccountValidatedTemplate } from './email/templates/accountValidated';
export { getInviteTemplate } from './email/templates/invite';
export { getTemporaryPasswordTemplate } from './email/templates/temporaryPassword';
export { getVerificationCodeTemplate } from './email/templates/verificationCode';
export { getPasswordResetTemplate } from './email/templates/passwordReset';
export { getPasswordResetConfirmationTemplate } from './email/templates/passwordResetConfirmation';
export { getAccountLockedTemplate } from './email/templates/accountLocked';
export { getAccountBlockedTemplate } from './email/templates/accountBlocked';
export { getAccountUnblockedTemplate } from './email/templates/accountUnblocked';

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

const isDevelopment = process.env.NODE_ENV === 'development';

const createMailtrapTransporter = (): nodemailer.Transporter => {
	const port = parseInt(process.env.EMAIL_PORT || '2525');
	const secure = port === 465;

	return nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port,
		secure,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});
};

// Templates moved to server/src/utils/email/templates/*

// High-level, typed helpers used by controllers/services
// Prefer these instead of building subjects/html ad-hoc in route handlers.

export const sendSignupAcknowledgement = async (opts: {
	to: string;
	name: string;
}): Promise<void> => {
	const { to, name } = opts;
	logger.info('[EmailService] sendSignupAcknowledgement');
	await sendEmail({
		to,
		subject: 'Inscription reçue - MonHubImmo',
		html: getSignupAcknowledgementTemplate(name),
	});
};

export const sendAccountValidated = async (opts: {
	to: string;
	name: string;
	email: string;
}): Promise<void> => {
	const { to, name, email } = opts;
	logger.info('[EmailService] sendAccountValidated');
	const baseUrl =
		process.env.CLIENT_URL ||
		process.env.FRONTEND_URL ||
		'http://localhost:3000';
	const loginUrl = `${baseUrl}/auth/login`;
	await sendEmail({
		to,
		subject: 'Votre compte a été validé - MonHubImmo',
		html: getAccountValidatedTemplate(name, email, loginUrl),
	});
};

export const sendInviteToSetPassword = async (opts: {
	to: string;
	name: string;
	inviteUrl: string;
}): Promise<void> => {
	const { to, name, inviteUrl } = opts;
	logger.info('[EmailService] sendInviteToSetPassword');
	await sendEmail({
		to,
		subject: 'Invitation MonHubImmo - Définir votre mot de passe',
		html: getInviteTemplate(name, inviteUrl),
	});
};

export const sendTemporaryPassword = async (opts: {
	to: string;
	name: string;
	tempPassword: string;
}): Promise<void> => {
	const { to, name, tempPassword } = opts;
	logger.info('[EmailService] sendTemporaryPassword');
	await sendEmail({
		to,
		subject: 'Mot de passe temporaire - MonHubImmo',
		html: getTemporaryPasswordTemplate(name, tempPassword),
	});
};

export const sendVerificationCodeEmail = async (opts: {
	to: string;
	name: string;
	code?: string;
	verifyUrl?: string;
}): Promise<void> => {
	const { to, name, verifyUrl } = opts;
	const code = opts.code ?? generateVerificationCode();
	logger.info('[EmailService] sendVerificationCodeEmail');
	await sendEmail({
		to,
		subject: 'Code de vérification - MonHubImmo',
		html: getVerificationCodeTemplate(name, code, verifyUrl),
	});
};

export const sendPasswordResetCodeEmail = async (opts: {
	to: string;
	name: string;
	code: string;
	inviteUrl?: string;
}): Promise<void> => {
	const { to, name, code, inviteUrl } = opts;
	logger.info('[EmailService] sendPasswordResetCodeEmail');
	await sendEmail({
		to,
		subject: 'Réinitialisation du mot de passe - MonHubImmo',
		html: getPasswordResetTemplate(name, code, inviteUrl),
	});
};

export const sendPasswordResetConfirmationEmail = async (opts: {
	to: string;
	name: string;
}): Promise<void> => {
	const { to, name } = opts;
	logger.info('[EmailService] sendPasswordResetConfirmationEmail');
	await sendEmail({
		to,
		subject: 'Mot de passe réinitialisé - MonHubImmo',
		html: getPasswordResetConfirmationTemplate(name),
	});
};

export const sendAccountLockedEmail = async (opts: {
	to: string;
	name: string;
	lockDurationMinutes: number;
	unlockTime: string;
}): Promise<void> => {
	const { to, name, lockDurationMinutes, unlockTime } = opts;
	logger.info('[EmailService] sendAccountLockedEmail');
	await sendEmail({
		to,
		subject: 'Alerte de sécurité - Compte verrouillé',
		html: getAccountLockedTemplate(name, lockDurationMinutes, unlockTime),
	});
};

export const sendAccountBlockedEmail = async (opts: {
	to: string;
	name: string;
}): Promise<void> => {
	const { to, name } = opts;
	logger.info('[EmailService] sendAccountBlockedEmail');
	await sendEmail({
		to,
		subject: 'Compte suspendu - MonHubImmo',
		html: getAccountBlockedTemplate(name),
	});
};

export const sendAccountUnblockedEmail = async (opts: {
	to: string;
	name: string;
}): Promise<void> => {
	const { to, name } = opts;
	logger.info('[EmailService] sendAccountUnblockedEmail');
	await sendEmail({
		to,
		subject: 'Compte réactivé - MonHubImmo',
		html: getAccountUnblockedTemplate(name),
	});
};

export const sendPaymentReminderEmail = async (opts: {
	to: string;
	name: string;
	billingUrl: string;
}): Promise<void> => {
	const { to, name, billingUrl } = opts;
	logger.info('[EmailService] sendPaymentReminderEmail');
	const html = getPaymentReminderTemplate(name, billingUrl);
	await sendEmail({ to, subject: 'Rappel de paiement - MonHubImmo', html });
};

// ============================================
// PAYMENT & SUBSCRIPTION EMAIL FUNCTIONS
// ============================================

export const sendPaymentSuccessEmail = async (opts: {
	to: string;
	name: string;
	amount: string;
	invoiceUrl?: string;
}): Promise<void> => {
	const { to, name, amount, invoiceUrl } = opts;
	logger.info('[EmailService] sendPaymentSuccessEmail');
	const html = getPaymentSuccessTemplate(name, amount, invoiceUrl);
	await sendEmail({
		to,
		subject: '✓ Paiement confirmé - MonHubImmo',
		html,
	});
};

export const sendPaymentFailedEmail = async (opts: {
	to: string;
	name: string;
	amount: string;
	attemptNumber: number;
	billingUrl: string;
}): Promise<void> => {
	const { to, name, amount, attemptNumber, billingUrl } = opts;
	logger.info(
		`[EmailService] sendPaymentFailedEmail (attempt ${attemptNumber})`,
	);
	const html = getPaymentFailedTemplate(
		name,
		amount,
		attemptNumber,
		billingUrl,
	);
	const subject =
		attemptNumber >= 3
			? '⚠️ Action urgente - Échec de paiement'
			: 'Échec de paiement - MonHubImmo';
	await sendEmail({ to, subject, html });
};

export const sendSubscriptionCanceledEmail = async (opts: {
	to: string;
	name: string;
	endDate: string;
}): Promise<void> => {
	const { to, name, endDate } = opts;
	logger.info('[EmailService] sendSubscriptionCanceledEmail');
	const html = getSubscriptionCanceledTemplate(name, endDate);
	await sendEmail({
		to,
		subject: "Confirmation d'annulation - MonHubImmo",
		html,
	});
};

export const sendSubscriptionExpiringSoonEmail = async (opts: {
	to: string;
	name: string;
	daysRemaining: number;
	endDate: string;
	billingUrl: string;
}): Promise<void> => {
	const { to, name, daysRemaining, endDate, billingUrl } = opts;
	logger.info(
		`[EmailService] sendSubscriptionExpiringSoonEmail (${daysRemaining} days)`,
	);
	const html = getSubscriptionExpiringSoonTemplate(
		name,
		daysRemaining,
		endDate,
		billingUrl,
	);
	await sendEmail({
		to,
		subject: `⏰ Plus que ${daysRemaining} jours - MonHubImmo`,
		html,
	});
};

const createBrevoClient = (): brevo.TransactionalEmailsApi => {
	const client = new brevo.TransactionalEmailsApi();
	client.setApiKey(
		brevo.TransactionalEmailsApiApiKeys.apiKey,
		process.env.BREVO_API_KEY || '',
	);
	return client;
};

let transporter: nodemailer.Transporter | null = null;
let brevoClient: brevo.TransactionalEmailsApi | null = null;

const getTransporter = (): nodemailer.Transporter => {
	if (!transporter) {
		transporter = createMailtrapTransporter();
	}
	return transporter;
};

const getBrevoClient = (): brevo.TransactionalEmailsApi => {
	if (!brevoClient) {
		brevoClient = createBrevoClient();
	}
	return brevoClient;
};

// Responsive styles moved to server/src/utils/email/styles.ts

export const sendEmail = async (options: EmailOptions): Promise<void> => {
	logger.info('========================================');
	logger.info('[EmailService] 📨 Sending email...');
	logger.info('[EmailService] To:', options.to);
	logger.info('[EmailService] Subject:', options.subject);
	logger.info(
		'[EmailService] Environment:',
		isDevelopment ? 'DEVELOPMENT (Mailtrap)' : 'PRODUCTION (Brevo)',
	);
	logger.info('========================================');

	if (isDevelopment) {
		const mailOptions = {
			from: process.env.EMAIL_FROM,
			to: options.to,
			subject: options.subject,
			html: options.html,
		};

		logger.info('[EmailService] Using Mailtrap for development');
		logger.info('[EmailService] From:', process.env.EMAIL_FROM);

		try {
			const result = await getTransporter().sendMail(mailOptions);
			logger.info(
				'[EmailService] ✅ Email sent successfully via Mailtrap',
			);
			logger.info('[EmailService] Message ID:', result.messageId);
			logger.info(
				'[EmailService] Preview URL:',
				nodemailer.getTestMessageUrl(result),
			);
			logger.info('========================================');
		} catch (error) {
			logger.error(
				'[EmailService] ❌ Failed to send email via Mailtrap:',
				error,
			);
			logger.error('========================================');
			throw error;
		}
	} else {
		// Production: Use Brevo API
		if (!process.env.BREVO_API_KEY) {
			logger.error('[EmailService] ❌ BREVO_API_KEY is not set!');
			throw new Error(
				'BREVO_API_KEY is not set in environment variables. Please add it to your .env file.',
			);
		}

		const sendSmtpEmail = new brevo.SendSmtpEmail();
		sendSmtpEmail.sender = {
			name: 'MonHubImmo',
			email: process.env.EMAIL_FROM || 'contact@monhubimmo.fr',
		};
		sendSmtpEmail.to = [{ email: options.to }];
		sendSmtpEmail.subject = options.subject;
		sendSmtpEmail.htmlContent = options.html;

		logger.info('[EmailService] Using Brevo for production');
		logger.info('[EmailService] Sender:', sendSmtpEmail.sender);

		try {
			const result =
				await getBrevoClient().sendTransacEmail(sendSmtpEmail);
			logger.info('[EmailService] ✅ Email sent successfully via Brevo');
			logger.info('[EmailService] Brevo Response:', result);
			logger.info('========================================');
		} catch (error: unknown) {
			const err = error as {
				message?: string;
				response?: { data?: unknown; status?: number };
			};
			logger.error('[EmailService] Failed to send email via Brevo', {
				message: err?.message,
				response: err?.response?.data,
				status: err?.response?.status,
			});
			throw new Error(
				`Failed to send email via Brevo: ${err?.message || 'Unknown error'}`,
			);
		}
	}
};

export const generateVerificationCode = (): string =>
	Math.floor(100000 + Math.random() * 900000).toString();

// Verification code template moved to templates/verificationCode.ts

// Password reset template moved to templates/passwordReset.ts

// Password reset confirmation template moved to templates/passwordResetConfirmation.ts

// Account locked template moved to templates/accountLocked.ts
