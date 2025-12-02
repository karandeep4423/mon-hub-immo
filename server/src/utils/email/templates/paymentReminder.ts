import { getResponsiveStyles } from '../styles';

export const getPaymentReminderTemplate = (
	name: string,
	billingUrl: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Rappel de paiement - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
			a.cta { background: #F59E0B; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; }
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>Rappel de paiement</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Nous vous rappelons de finaliser votre paiement pour accéder aux fonctionnalités complètes de MonHubImmo.</p>
							<p style="text-align:center; margin: 18px 0;"><a class="cta" href="${billingUrl}">Gérer mon paiement</a></p>
							<p>Si vous avez déjà réglé, vous pouvez ignorer ce message.</p>
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
