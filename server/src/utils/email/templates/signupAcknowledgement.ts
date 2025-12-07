import { getResponsiveStyles } from '../styles';

export const getSignupAcknowledgementTemplate = (name: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Inscription reçue - MonHubImmo</title>
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
			.logo {
				font-size: 28px;
				font-weight: bold;
				margin-bottom: 10px;
			}
			.content { 
				padding: 30px 20px; 
				background: white;
			}
			.status-box {
				background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
				border-radius: 12px;
				padding: 25px;
				text-align: center;
				margin: 20px 0;
			}
			.status-icon {
				font-size: 48px;
				margin-bottom: 10px;
			}
			.status-title {
				font-size: 18px;
				font-weight: bold;
				color: #1565C0;
				margin: 10px 0;
			}
			.info-box {
				background: #FFF8E1;
				border-left: 4px solid #FFA726;
				padding: 15px;
				margin: 20px 0;
				border-radius: 0 8px 8px 0;
			}
			.timeline {
				margin: 25px 0;
			}
			.timeline-item {
				display: flex;
				align-items: flex-start;
				margin-bottom: 15px;
			}
			.timeline-dot {
				width: 12px;
				height: 12px;
				background: #6AD1E3;
				border-radius: 50%;
				margin-right: 15px;
				margin-top: 5px;
				flex-shrink: 0;
			}
			.timeline-dot.completed {
				background: #4CAF50;
			}
			.timeline-dot.pending {
				background: #FFA726;
				animation: pulse 2s infinite;
			}
			@keyframes pulse {
				0%, 100% { opacity: 1; }
				50% { opacity: 0.5; }
			}
			.timeline-content {
				flex: 1;
			}
			.timeline-content strong {
				color: #333;
			}
			.timeline-content p {
				margin: 4px 0 0 0;
				font-size: 14px;
				color: #666;
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
							<h1>📝 Inscription reçue</h1>
						</div>
						<div class="content">
							<p>Bonjour <strong>${name}</strong>,</p>
							
							<div class="status-box">
								<div class="status-icon">⏳</div>
								<div class="status-title">Votre dossier est en cours de vérification</div>
								<p style="margin: 0; color: #666;">Notre équipe examine votre demande</p>
							</div>

							<p>Merci pour votre inscription sur MonHubImmo ! Votre demande a été enregistrée avec succès.</p>

							<div class="timeline">
								<div class="timeline-item">
									<div class="timeline-dot completed"></div>
									<div class="timeline-content">
										<strong>✓ Inscription soumise</strong>
										<p>Votre demande a bien été reçue</p>
									</div>
								</div>
								<div class="timeline-item">
									<div class="timeline-dot pending"></div>
									<div class="timeline-content">
										<strong>Vérification en cours</strong>
										<p>Notre équipe vérifie votre dossier</p>
									</div>
								</div>
								<div class="timeline-item">
									<div class="timeline-dot"></div>
									<div class="timeline-content">
										<strong>Validation du compte</strong>
										<p>Vous recevrez un email de confirmation</p>
									</div>
								</div>
							</div>

							<div class="info-box">
								<strong>💡 Bon à savoir</strong>
								<p style="margin: 8px 0 0 0;">La validation est généralement effectuée dans un délai de 24 à 48 heures ouvrées. Vous recevrez automatiquement un email dès que votre compte sera activé.</p>
							</div>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
							<p>Merci de votre confiance.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;
