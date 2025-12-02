import { getResponsiveStyles } from '../styles';

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
