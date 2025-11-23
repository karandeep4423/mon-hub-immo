import nodemailer from 'nodemailer';
import * as brevo from '@getbrevo/brevo';
import { logger } from './logger';

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

export const getSignupAcknowledgementTemplate = (name: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Inscription reçue</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #6AD1E3, #3BA8BB); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>Inscription en cours de vérification</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Votre demande d'inscription a bien été enregistrée. Notre équipe va vérifier votre dossier et valider manuellement l'accès à la plateforme dans les plus brefs délais.</p>
							<p>Une fois la validation effectuée par notre équipe, vous recevrez un email de confirmation vous permettant de vous connecter.</p>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Merci de votre confiance.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;

export const getAccountValidatedTemplate = (name: string, email: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Compte validé - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>Votre compte a été validé</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Votre compte MonHubImmo a été validé par notre équipe. Vous pouvez désormais vous connecter à la plateforme en utilisant l'adresse email suivante :</p>
							<p><strong>${email}</strong></p>
							<p>Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser depuis la page de connexion.</p>
							<p>Bienvenue sur MonHubImmo !</p>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Merci de votre confiance.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;

export const getInviteTemplate = (name: string, inviteUrl: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Invitation MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #6AD1E3, #3BA8BB); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
			a.cta { background: #00BCE4; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; }
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>Invitation à rejoindre MonHubImmo</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Un compte a été créé pour vous sur MonHubImmo. Pour terminer la configuration et définir votre mot de passe, cliquez sur le bouton ci‑dessous :</p>
							<p style="text-align:center; margin: 18px 0;"><a class="cta" href="${inviteUrl}">Définir mon mot de passe</a></p>
							<p>Ce lien expire dans 24 heures. Si vous n'avez pas demandé ce compte, ignorez cet email.</p>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Merci de votre confiance.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;

export const getTemporaryPasswordTemplate = (
	name: string,
	tempPassword: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Mot de passe temporaire - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #6AD1E3, #3BA8BB); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.password { font-family: monospace; background: #eef; padding: 10px; border-radius: 6px; display: inline-block; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>Mot de passe temporaire</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Un administrateur a créé un compte pour vous sur MonHubImmo. Pour vous connecter, utilisez le mot de passe temporaire ci‑dessous :</p>
							<p class="password">${tempPassword}</p>
							<p>Pour votre sécurité, vous serez invité(e) à définir un nouveau mot de passe lors de votre première connexion.</p>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Merci de votre confiance.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;

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

const getResponsiveStyles = (): string => `
	@media (max-width: 600px) {
		.container {
			width: 100% !important;
			border-radius: 0 !important;
		}
		.header {
			padding: 20px 15px !important;
		}
		.header h1 {
			font-size: 20px !important;
		}
		.content {
			padding: 20px 15px !important;
		}
		.code {
			font-size: 24px !important;
			letter-spacing: 2px !important;
		}
		.logo {
			font-size: 24px !important;
		}
	}
	@media (max-width: 480px) {
		.code {
			font-size: 20px !important;
		}
		.header h1 {
			font-size: 18px !important;
		}
	}
`;

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
			logger.error('[EmailService] ❌ Failed to send email via Brevo');
			console.error('[Brevo Email Error]:', {
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

export const getVerificationCodeTemplate = (
	name: string,
	code: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Code de vérification email</title>
		<style>
			body { 
				font-family: Arial, sans-serif; 
				line-height: 1.6; 
				color: #333;
				margin: 0;
				padding: 0;
				background-color: #f4f4f4;
			}
			.container { 
				max-width: 600px; 
				margin: 0 auto; 
				background-color: white;
				border-radius: 8px;
				overflow: hidden;
				box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			}
			.header { 
				background: linear-gradient(135deg, #6AD1E3, #3BA8BB);
				color: white; 
				padding: 30px 20px; 
				text-align: center; 
			}
			.header h1 {
				margin: 0;
				font-size: 24px;
			}
			.content { 
				padding: 30px 20px; 
				background: white;
			}
			.code-container {
				background: #E0F7FA;
				border: 2px dashed #6AD1E3;
				border-radius: 8px;
				padding: 20px;
				text-align: center;
				margin: 20px 0;
			}
			.code { 
				font-size: 32px; 
				font-weight: bold; 
				color: #6AD1E3;
				letter-spacing: 4px;
				font-family: 'Courier New', monospace;
				word-break: break-all;
			}
			.instructions {
				background: #E0F7FA;
				border-left: 4px solid #6AD1E3;
				padding: 15px;
				margin: 20px 0;
			}
			.footer { 
				text-align: center; 
				padding: 20px; 
				font-size: 12px; 
				color: #666;
				background: #f8f9fa;
			}
			.warning {
				color: #dc3545;
				font-size: 14px;
				margin-top: 20px;
			}
			.logo {
				font-size: 28px;
				font-weight: bold;
				margin-bottom: 10px;
			}
			.logo-accent {
				color: #1F2937;
			}
			${getResponsiveStyles()}
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0; padding: 0;">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">Mon<span class="logo-accent">HubImmo</span></div>
							<h1>📧 Vérification de l'email</h1>
						</div>
						<div class="content">
							<h2>Bonjour ${name},</h2>
							<p>Merci de vous être inscrit ! Pour compléter votre inscription, veuillez utiliser le code de vérification ci-dessous :</p>
							
							<div class="code-container">
								<div class="code">${code}</div>
							</div>
							
							<div class="instructions">
								<strong>📋 Instructions :</strong>
								<ul>
									<li>Entrez ce code dans le formulaire de vérification</li>
									<li>Ce code expirera dans <strong>24 heures</strong></li>
									<li>Ne partagez ce code avec personne</li>
								</ul>
							</div>
							
							<p>Une fois vérifié, vous pourrez accéder à votre compte et à toutes nos fonctionnalités.</p>
							
							<div class="warning">
								<strong>🔒 Note de sécurité :</strong> Si vous n'avez pas créé ce compte, veuillez ignorer cet email.
							</div>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
							<p>Ceci est un message automatique, merci de ne pas y répondre.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;

export const getPasswordResetTemplate = (
	name: string,
	code: string,
	inviteUrl?: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Code de réinitialisation du mot de passe</title>
		<style>
			body { 
				font-family: Arial, sans-serif; 
				line-height: 1.6; 
				color: #333;
				margin: 0;
				padding: 0;
				background-color: #f4f4f4;
			}
			.container { 
				max-width: 600px; 
				margin: 0 auto; 
				background-color: white;
				border-radius: 8px;
				overflow: hidden;
				box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			}
			.header { 
				background: linear-gradient(135deg, #F59E0B, #D97706);
				color: white; 
				padding: 30px 20px; 
				text-align: center; 
			}
			.header h1 {
				margin: 0;
				font-size: 24px;
			}
			.content { 
				padding: 30px 20px; 
				background: white;
			}
			.code-container {
				background: #fff7ed;
				border: 2px dashed #F59E0B;
				border-radius: 8px;
				padding: 20px;
				text-align: center;
				margin: 20px 0;
			}
			.code { 
				font-size: 32px; 
				font-weight: bold; 
				color: #F59E0B;
				letter-spacing: 4px;
				font-family: 'Courier New', monospace;
				word-break: break-all;
			}
			.instructions {
				background: #fff7ed;
				border-left: 4px solid #F59E0B;
				padding: 15px;
				margin: 20px 0;
			}
			.footer { 
				text-align: center; 
				padding: 20px; 
				font-size: 12px; 
				color: #666;
				background: #f8f9fa;
			}
			.warning {
				color: #dc3545;
				font-size: 14px;
				margin-top: 20px;
				padding: 15px;
				background: #f8d7da;
				border-radius: 4px;
			}
			.logo {
				font-size: 28px;
				font-weight: bold;
				margin-bottom: 10px;
			}
			.logo-accent {
				color: #1F2937;
			}
			${getResponsiveStyles()}
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0; padding: 0;">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">Mon<span class="logo-accent">HubImmo</span></div>
							<h1>🔒 Réinitialisation du mot de passe</h1>
						</div>
						<div class="content">
							<h2>Bonjour ${name},</h2>
							<p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Utilisez le code ci-dessous pour définir votre nouveau mot de passe :</p>
							
							<div class="code-container">
								<div class="code">${code}</div>
							</div>
							
							<div class="instructions">
								<strong>⚠️ Instructions importantes :</strong>
								<ul>
									<li>Ce code expirera dans <strong>1 heure</strong></li>
									<li>Entrez ce code avec votre nouveau mot de passe</li>
									<li>Gardez ce code confidentiel</li>
									<li>Si vous n'avez pas demandé ceci, ignorez cet email</li>
								</ul>
							</div>
							
							<p>Après avoir entré le code, vous pourrez créer un nouveau mot de passe sécurisé pour votre compte.</p>
                            
							${inviteUrl ? `<p style="text-align:center; margin: 18px 0;"><a class="cta" href="${inviteUrl}" style="background: #F59E0B; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block;">Définir mon mot de passe</a></p>` : ''}

							<div class="warning">
								<strong>⚠️ Alerte de sécurité :</strong> Si vous n'avez pas demandé de réinitialisation, ignorez cet email et assurez-vous que votre compte est sécurisé.
							</div>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
							<p>Ceci est un message automatique, merci de ne pas y répondre.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;

export const getPasswordResetConfirmationTemplate = (name: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Mot de passe réinitialisé avec succès</title>
		<style>
			body { 
				font-family: Arial, sans-serif; 
				line-height: 1.6; 
				color: #333;
				margin: 0;
				padding: 0;
				background-color: #f4f4f4;
			}
			.container { 
				max-width: 600px; 
				margin: 0 auto; 
				background-color: white;
				border-radius: 8px;
				overflow: hidden;
				box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			}
			.header { 
				background: linear-gradient(135deg, #10B981, #059669);
				color: white; 
				padding: 30px 20px; 
				text-align: center; 
			}
			.header h1 {
				margin: 0;
				font-size: 24px;
			}
			.content { 
				padding: 30px 20px; 
				background: white;
			}
			.success-box {
				background: #d1fae5;
				border: 1px solid #10B981;
				border-radius: 8px;
				padding: 20px;
				text-align: center;
				margin: 20px 0;
			}
			.checkmark {
				font-size: 48px;
				color: #10B981;
				margin-bottom: 10px;
			}
			.footer { 
				text-align: center; 
				padding: 20px; 
				font-size: 12px; 
				color: #666;
				background: #f8f9fa;
			}
			.security-tips {
				background: #E0F7FA;
				border-left: 4px solid #6AD1E3;
				padding: 15px;
				margin: 20px 0;
			}
			.logo {
				font-size: 28px;
				font-weight: bold;
				margin-bottom: 10px;
			}
			.logo-accent {
				color: #1F2937;
			}
			${getResponsiveStyles()}
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0; padding: 0;">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">Mon<span class="logo-accent">HubImmo</span></div>
							<h1>✅ Réinitialisation réussie</h1>
						</div>
						<div class="content">
							<h2>Bonjour ${name},</h2>
							
							<div class="success-box">
								<div class="checkmark">✓</div>
								<h3>Votre mot de passe a été réinitialisé avec succès !</h3>
								<p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
							</div>
							
							<p>Le mot de passe de votre compte MonHubImmo a été modifié avec succès. Vous êtes maintenant automatiquement connecté à votre compte.</p>
							
							<div class="security-tips">
								<strong>🔒 Conseils de sécurité :</strong>
								<ul>
									<li>Gardez votre mot de passe sécurisé et ne le partagez avec personne</li>
									<li>Utilisez un mot de passe unique pour votre compte MonHubImmo</li>
									<li>Envisagez d'activer l'authentification à deux facteurs</li>
									<li>Si vous remarquez une activité suspecte, contactez immédiatement le support</li>
								</ul>
							</div>
							
							<p>Si vous n'avez pas effectué ce changement, veuillez contacter notre équipe de support immédiatement.</p>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
							<p>Ceci est un message automatique, merci de ne pas y répondre.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;

export const getAccountLockedTemplate = (
	name: string,
	lockDurationMinutes: number,
	unlockTime: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Alerte de sécurité - Verrouillage temporaire</title>
		<style>
			body { 
				font-family: Arial, sans-serif; 
				line-height: 1.6; 
				color: #333;
				margin: 0;
				padding: 0;
				background-color: #f4f4f4;
			}
			.container { 
				max-width: 600px; 
				margin: 0 auto; 
				background-color: white;
				border-radius: 8px;
				overflow: hidden;
				box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			}
			.header { 
				background: linear-gradient(135deg, #dc3545, #a71e2a);
				color: white; 
				padding: 30px 20px; 
				text-align: center; 
			}
			.header h1 {
				margin: 0;
				font-size: 24px;
			}
			.content { 
				padding: 30px 20px; 
				background: white;
			}
			.alert-box {
				background: #f8d7da;
				border: 2px solid #dc3545;
				border-radius: 8px;
				padding: 20px;
				text-align: center;
				margin: 20px 0;
			}
			.lock-icon {
				font-size: 48px;
				color: #dc3545;
				margin-bottom: 10px;
			}
			.lock-info {
				background: #fff3cd;
				border-left: 4px solid #ffc107;
				padding: 15px;
				margin: 20px 0;
			}
			.footer { 
				text-align: center; 
				padding: 20px; 
				font-size: 12px; 
				color: #666;
				background: #f8f9fa;
			}
			.security-tips {
				background: #E0F7FA;
				border-left: 4px solid #6AD1E3;
				padding: 15px;
				margin: 20px 0;
			}
			.logo {
				font-size: 28px;
				font-weight: bold;
				margin-bottom: 10px;
			}
			.logo-accent {
				color: #1F2937;
			}
			${getResponsiveStyles()}
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0; padding: 0;">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">Mon<span class="logo-accent">HubImmo</span></div>
							<h1>🔐 Alerte de sécurité : Compte temporairement verrouillé</h1>
						</div>
						<div class="content">
							<h2>Bonjour ${name},</h2>
							
							<div class="alert-box">
								<div class="lock-icon">🔒</div>
								<h3>Votre compte a été temporairement verrouillé</h3>
								<p>Suite à plusieurs tentatives de connexion infructueuses</p>
							</div>
							
							<p>Pour des raisons de sécurité, votre compte MonHubImmo a été temporairement verrouillé après plusieurs tentatives de connexion avec un mot de passe incorrect.</p>
							
							<div class="lock-info">
								<strong>⏱️ Informations de verrouillage :</strong>
								<ul>
									<li>Durée du verrouillage : <strong>${lockDurationMinutes} minutes</strong></li>
									<li>Déverrouillage automatique à : <strong>${unlockTime}</strong></li>
									<li>Vous pourrez vous reconnecter après ce délai</li>
								</ul>
							</div>
							
							<div class="security-tips">
								<strong>🔒 Que faire maintenant :</strong>
								<ul>
									<li>Attendez la fin du délai de verrouillage</li>
									<li>Si ce n'était pas vous, changez immédiatement votre mot de passe</li>
									<li>Assurez-vous d'utiliser un mot de passe fort et unique</li>
									<li>Vérifiez l'activité récente de votre compte</li>
								</ul>
							</div>
							
							<p><strong>C'était vous ?</strong> Attendez simplement le délai et réessayez avec le bon mot de passe.</p>
							<p><strong>Ce n'était pas vous ?</strong> Contactez immédiatement notre support pour sécuriser votre compte.</p>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
							<p>Ceci est un message automatique, merci de ne pas y répondre.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;
