import { getResponsiveStyles } from '../styles';

export const getPaymentSuccessTemplate = (
	name: string,
	amount: string,
	invoiceUrl?: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Paiement confirmé - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #00b4d8, #0096c7); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
			a.cta { background: #00b4d8; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; }
			.success-icon { font-size: 48px; margin-bottom: 10px; }
			.amount { font-size: 24px; font-weight: bold; color: #00b4d8; margin: 10px 0; }
			.details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<div class="success-icon">✓</div>
							<h1>Paiement confirmé</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Nous avons bien reçu votre paiement. Merci pour votre confiance !</p>
							
							<div class="details">
								<p><strong>Montant :</strong> <span class="amount">${amount}</span></p>
								<p><strong>Abonnement :</strong> MonHubImmo - Mensuel</p>
								<p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
							</div>
							
							${invoiceUrl ? `<p style="text-align:center; margin: 18px 0;"><a class="cta" href="${invoiceUrl}">Voir ma facture</a></p>` : ''}
							
							<p>Vous avez maintenant accès à toutes les fonctionnalités de MonHubImmo :</p>
							<ul>
								<li>Publication de biens immobiliers</li>
								<li>Création d'annonces de recherche</li>
								<li>Collaboration avec les apporteurs</li>
								<li>Messagerie en temps réel</li>
								<li>Et bien plus encore...</li>
							</ul>
							
							<p style="text-align:center; margin: 18px 0;"><a class="cta" href="${process.env.FRONTEND_URL || 'https://monhubimmo.com'}/dashboard">Accéder à mon tableau de bord</a></p>
						</div>
						<div class="footer">
							<p>Une question ? Contactez-nous à contact@monhubimmo.fr</p>
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;
