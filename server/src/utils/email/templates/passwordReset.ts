import { getResponsiveStyles } from '../styles';

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
