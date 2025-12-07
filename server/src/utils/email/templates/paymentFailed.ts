import { getResponsiveStyles } from '../styles';

export const getPaymentFailedTemplate = (
	name: string,
	amount: string,
	attemptNumber: number,
	billingUrl: string,
): string => {
	const isUrgent = attemptNumber >= 3;
	const headerBg = isUrgent
		? 'linear-gradient(135deg, #DC2626, #B91C1C)'
		: 'linear-gradient(135deg, #F59E0B, #D97706)';
	const ctaBg = isUrgent ? '#DC2626' : '#F59E0B';

	return `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Échec de paiement - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: ${headerBg}; color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
			a.cta { background: ${ctaBg}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; }
			.warning-icon { font-size: 48px; margin-bottom: 10px; }
			.alert-box { background: ${isUrgent ? '#FEE2E2' : '#FEF3C7'}; border-left: 4px solid ${isUrgent ? '#DC2626' : '#F59E0B'}; padding: 15px; margin: 15px 0; border-radius: 4px; }
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
							<div class="warning-icon">⚠️</div>
							<h1>${isUrgent ? 'Action urgente requise' : 'Échec de paiement'}</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							
							<div class="alert-box">
								${
									isUrgent
										? `<p><strong>⚠️ Attention :</strong> C'est la ${attemptNumber}ème tentative de paiement échouée. Votre accès sera suspendu si le paiement n'est pas régularisé.</p>`
										: `<p>Nous n'avons pas pu traiter votre paiement de <strong>${amount}</strong> pour votre abonnement MonHubImmo.</p>`
								}
							</div>
							
							<div class="details">
								<p><strong>Montant :</strong> ${amount}</p>
								<p><strong>Tentative :</strong> ${attemptNumber}</p>
							</div>
							
							<p><strong>Pourquoi mon paiement a-t-il échoué ?</strong></p>
							<ul>
								<li>Carte expirée ou invalide</li>
								<li>Fonds insuffisants</li>
								<li>Problème temporaire avec votre banque</li>
								<li>Limite de carte atteinte</li>
							</ul>
							
							<p><strong>Que dois-je faire ?</strong></p>
							<p>Mettez à jour votre moyen de paiement dès maintenant pour continuer à profiter de MonHubImmo.</p>
							
							<p style="text-align:center; margin: 24px 0;"><a class="cta" href="${billingUrl}">Mettre à jour mon paiement</a></p>
							
							${isUrgent ? '<p style="color: #DC2626; font-weight: bold;">⏰ Vous disposez de 48h pour régulariser votre situation.</p>' : ''}
						</div>
						<div class="footer">
							<p>Besoin d'aide ? Contactez-nous à support@monhubimmo.com</p>
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;
};
