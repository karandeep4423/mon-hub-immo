import { getResponsiveStyles } from '../styles';

export const getAccountBlockedTemplate = (name: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Compte suspendu - MonHubImmo</title>
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
				background: linear-gradient(135deg, #dc2626, #b91c1c);
				color: white; 
				padding: 30px 20px; 
				text-align: center; 
			}
			.header h1 {
				margin: 0;
				font-size: 24px;
			}
			.logo {
				font-size: 28px;
				font-weight: bold;
				margin-bottom: 10px;
			}
			.content { 
				padding: 30px 20px; 
				background: white;
			}
			.alert-box {
				background: linear-gradient(135deg, #FEE2E2, #FECACA);
				border-radius: 12px;
				padding: 25px;
				text-align: center;
				margin: 20px 0;
			}
			.alert-icon {
				font-size: 48px;
				margin-bottom: 10px;
			}
			.alert-title {
				font-size: 18px;
				font-weight: bold;
				color: #991B1B;
				margin: 10px 0;
			}
			.info-box {
				background: #F0F9FF;
				border-left: 4px solid #0369A1;
				padding: 15px;
				margin: 20px 0;
				border-radius: 0 8px 8px 0;
			}
			.info-title {
				font-weight: bold;
				color: #0369A1;
				margin-bottom: 10px;
			}
			.contact-box {
				background: #f8f9fa;
				border: 2px solid #e9ecef;
				border-radius: 8px;
				padding: 20px;
				text-align: center;
				margin: 20px 0;
			}
			.contact-label {
				font-size: 12px;
				color: #666;
				text-transform: uppercase;
				letter-spacing: 1px;
				margin-bottom: 5px;
			}
			.contact-email {
				font-size: 18px;
				font-weight: bold;
				color: #0369A1;
			}
			.footer { 
				text-align: center; 
				padding: 20px; 
				font-size: 12px; 
				color: #666;
				background: #f8f9fa;
				border-top: 1px solid #e9ecef;
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
							<div class="logo">MonHubImmo</div>
							<h1>⚠️ Compte suspendu</h1>
						</div>
						<div class="content">
							<p>Bonjour <strong>${name}</strong>,</p>
							
							<div class="alert-box">
								<div class="alert-icon">🚫</div>
								<div class="alert-title">Votre compte a été suspendu</div>
								<p style="margin: 0; color: #666;">Un administrateur a suspendu temporairement l'accès à votre compte.</p>
							</div>

							<p>Pendant cette période de suspension, vous ne pourrez pas :</p>
							<ul>
								<li>Vous connecter à votre compte</li>
								<li>Accéder à vos biens et annonces</li>
								<li>Utiliser la messagerie</li>
								<li>Gérer vos collaborations</li>
							</ul>

							<div class="info-box">
								<div class="info-title">💡 Pourquoi mon compte est-il suspendu ?</div>
								<p style="margin: 0; font-size: 14px;">
									Cette suspension peut être due à une violation des conditions d'utilisation, 
									une vérification d'identité en attente, ou d'autres raisons administratives.
								</p>
							</div>

							<p><strong>Vous pensez qu'il s'agit d'une erreur ?</strong></p>
							<p>Contactez notre équipe support pour en savoir plus ou faire appel de cette décision :</p>

							<div class="contact-box">
								<div class="contact-label">Support MonHubImmo</div>
								<div class="contact-email">contact@monhubimmo.fr</div>
							</div>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
							<p>Ceci est un message automatique, merci de ne pas y répondre directement.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;
