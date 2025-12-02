import { getResponsiveStyles } from '../styles';

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
