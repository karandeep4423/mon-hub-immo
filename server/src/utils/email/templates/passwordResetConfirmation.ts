import { getResponsiveStyles } from '../styles';

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
