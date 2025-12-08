import { getResponsiveStyles } from '../styles';

export const getSubscriptionCanceledTemplate = (
	name: string,
	endDate: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Abonnement annulé - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #6B7280, #4B5563); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
			a.cta { background: #00b4d8; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; }
			.info-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; margin: 15px 0; border-radius: 4px; }
			.date-highlight { font-size: 18px; font-weight: bold; color: #00b4d8; }
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>Abonnement annulé</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Nous confirmons l'annulation de votre abonnement MonHubImmo.</p>
							
							<div class="info-box">
								<p>✅ <strong>Bonne nouvelle :</strong> Vous conservez votre accès jusqu'au <span class="date-highlight">${endDate}</span></p>
							</div>
							
							<p>Après cette date, vous ne pourrez plus :</p>
							<ul>
								<li>Publier de nouveaux biens</li>
								<li>Créer des annonces de recherche</li>
								<li>Utiliser la messagerie</li>
								<li>Accéder aux fonctionnalités premium</li>
							</ul>
							
							<p><strong>Vous avez changé d'avis ?</strong></p>
							<p>Vous pouvez réactiver votre abonnement à tout moment avant la date de fin.</p>
							
							<p style="text-align:center; margin: 18px 0;"><a class="cta" href="${process.env.FRONTEND_URL || 'https://monhubimmo.com'}/dashboard">Réactiver mon abonnement</a></p>
							
							<p style="color: #6B7280; font-size: 14px;">Nous serions ravis de connaître la raison de votre départ. N'hésitez pas à nous faire part de vos commentaires à contact@monhubimmo.fr</p>
						</div>
						<div class="footer">
							<p>Merci d'avoir utilisé MonHubImmo.</p>
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;
