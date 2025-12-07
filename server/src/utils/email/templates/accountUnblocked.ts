import { getResponsiveStyles } from '../styles';

export const getAccountUnblockedTemplate = (name: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Compte réactivé - MonHubImmo</title>
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
				background: linear-gradient(135deg, #22c55e, #16a34a);
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
			.success-box {
				background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
				border-radius: 12px;
				padding: 25px;
				text-align: center;
				margin: 20px 0;
			}
			.success-icon {
				font-size: 48px;
				margin-bottom: 10px;
			}
			.success-title {
				font-size: 18px;
				font-weight: bold;
				color: #2E7D32;
				margin: 10px 0;
			}
			.cta-container {
				text-align: center;
				margin: 25px 0;
			}
			.cta-button {
				display: inline-block;
				background: #22c55e;
				color: white !important;
				padding: 14px 32px;
				border-radius: 8px;
				text-decoration: none;
				font-weight: bold;
				font-size: 16px;
			}
			.features-box {
				background: #F0F9FF;
				border-radius: 8px;
				padding: 20px;
				margin: 20px 0;
			}
			.features-title {
				font-weight: bold;
				color: #0369A1;
				margin-bottom: 15px;
			}
			.feature-item {
				display: flex;
				align-items: center;
				margin-bottom: 10px;
			}
			.feature-icon {
				margin-right: 10px;
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
							<h1>✅ Compte réactivé !</h1>
						</div>
						<div class="content">
							<p>Bonjour <strong>${name}</strong>,</p>
							
							<div class="success-box">
								<div class="success-icon">🎉</div>
								<div class="success-title">Bienvenue de retour !</div>
								<p style="margin: 0; color: #666;">Votre compte a été réactivé par notre équipe.</p>
							</div>

							<p>Vous pouvez désormais vous reconnecter et retrouver l'accès à toutes les fonctionnalités de MonHubImmo.</p>

							<div class="cta-container">
								<a href="${process.env.CLIENT_URL || 'https://www.monhubimmo.fr'}/auth/login" class="cta-button">Se connecter maintenant</a>
							</div>

							<div class="features-box">
								<div class="features-title">🚀 Ce que vous pouvez faire maintenant :</div>
								<div class="feature-item">
									<span class="feature-icon">📊</span>
									<span>Accéder à votre tableau de bord</span>
								</div>
								<div class="feature-item">
									<span class="feature-icon">🏠</span>
									<span>Gérer vos biens immobiliers</span>
								</div>
								<div class="feature-item">
									<span class="feature-icon">🤝</span>
									<span>Reprendre vos collaborations</span>
								</div>
								<div class="feature-item">
									<span class="feature-icon">💬</span>
									<span>Consulter vos messages</span>
								</div>
							</div>

							<p>Merci de votre confiance.</p>
							<p>L'équipe MonHubImmo</p>
						</div>
						<div class="footer">
							<p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
							<p>Ravi de vous revoir !</p>
						</div>
					</div>
				</td>
			</tr>
		</table>
	</body>
	</html>
`;
