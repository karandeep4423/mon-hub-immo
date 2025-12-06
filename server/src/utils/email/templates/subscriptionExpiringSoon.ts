import { getResponsiveStyles } from '../styles';

export const getSubscriptionExpiringSoonTemplate = (
	name: string,
	daysRemaining: number,
	endDate: string,
	billingUrl: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Abonnement expire bientôt - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
			a.cta { background: #00b4d8; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; }
			.countdown { font-size: 36px; font-weight: bold; color: #F59E0B; text-align: center; margin: 20px 0; }
			.countdown-label { font-size: 14px; color: #6B7280; text-align: center; }
			.warning-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0; border-radius: 4px; }
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>⏰ Votre abonnement expire bientôt</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							
							<div class="countdown">${daysRemaining}</div>
							<p class="countdown-label">jours restants</p>
							
							<div class="warning-box">
								<p>Votre abonnement MonHubImmo expire le <strong>${endDate}</strong>.</p>
								<p>Après cette date, vous perdrez l'accès à toutes les fonctionnalités premium.</p>
							</div>
							
							<p><strong>Continuez à profiter de MonHubImmo :</strong></p>
							<ul>
								<li>✓ Publication illimitée de biens</li>
								<li>✓ Annonces de recherche</li>
								<li>✓ Collaboration avec les apporteurs</li>
								<li>✓ Messagerie en temps réel</li>
							</ul>
							
							<p style="text-align:center; margin: 24px 0;"><a class="cta" href="${billingUrl}">Renouveler mon abonnement</a></p>
						</div>
						<div class="footer">
							<p>Une question ? Contactez-nous à support@monhubimmo.com</p>
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;
