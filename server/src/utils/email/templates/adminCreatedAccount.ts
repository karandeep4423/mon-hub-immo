import { getResponsiveStyles } from '../styles';

export type AdminCreatedAccountFlow = 'invite' | 'tempPassword';

interface AdminCreatedAccountOptions {
	name: string;
	verificationCode: string;
	verifyUrl: string;
	flow: AdminCreatedAccountFlow;
	// For invite flow
	inviteUrl?: string;
	// For temp password flow
	tempPassword?: string;
}

export const getAdminCreatedAccountTemplate = (
	options: AdminCreatedAccountOptions,
): string => {
	const { name, verificationCode, verifyUrl, flow, inviteUrl, tempPassword } =
		options;

	const flowSpecificContent =
		flow === 'invite'
			? `
				<div class="step-box">
					<div class="step-number">2</div>
					<div class="step-content">
						<strong>Définissez votre mot de passe</strong>
						<p>Après vérification de votre email, cliquez sur le bouton ci-dessous pour créer votre mot de passe :</p>
						<p style="text-align:center; margin: 15px 0;">
							<a href="${inviteUrl}" class="cta-button">Définir mon mot de passe</a>
						</p>
						<p class="note">⚠️ Ce lien expire dans 24 heures.</p>
					</div>
				</div>
			`
			: `
				<div class="step-box">
					<div class="step-number">2</div>
					<div class="step-content">
						<strong>Connectez-vous avec votre mot de passe temporaire</strong>
						<p>Après vérification de votre email, utilisez ce mot de passe temporaire pour vous connecter :</p>
						<div class="password-box">${tempPassword}</div>
						<p class="note">🔒 Pour votre sécurité, vous devrez définir un nouveau mot de passe lors de votre première connexion.</p>
					</div>
				</div>
			`;

	return `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Votre compte MonHubImmo a été créé</title>
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
			.welcome-box {
				background: #E8F5E9;
				border-left: 4px solid #4CAF50;
				padding: 15px;
				margin: 20px 0;
				border-radius: 0 6px 6px 0;
			}
			.step-box {
				display: flex;
				margin: 20px 0;
				padding: 15px;
				background: #f8f9fa;
				border-radius: 8px;
				border: 1px solid #e9ecef;
			}
			.step-number {
				background: #6AD1E3;
				color: white;
				width: 32px;
				height: 32px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-weight: bold;
				flex-shrink: 0;
				margin-right: 15px;
			}
			.step-content {
				flex: 1;
			}
			.step-content p {
				margin: 8px 0;
			}
			.code-container {
				background: #E0F7FA;
				border: 2px dashed #6AD1E3;
				border-radius: 8px;
				padding: 15px;
				text-align: center;
				margin: 10px 0;
			}
			.code { 
				font-size: 28px; 
				font-weight: bold; 
				color: #00838F;
				letter-spacing: 4px;
				font-family: 'Courier New', monospace;
			}
			.cta-button {
				display: inline-block;
				background: #00BCE4;
				color: white !important;
				padding: 12px 24px;
				border-radius: 6px;
				text-decoration: none;
				font-weight: bold;
			}
			.password-box {
				font-family: monospace;
				font-size: 18px;
				background: #eef;
				padding: 12px 20px;
				border-radius: 6px;
				display: inline-block;
				margin: 10px 0;
				letter-spacing: 1px;
			}
			.note {
				font-size: 13px;
				color: #666;
				margin-top: 10px;
			}
			.footer { 
				text-align: center; 
				padding: 20px; 
				font-size: 12px; 
				color: #666;
				background: #f8f9fa;
			}
			.security-note {
				background: #FFF3E0;
				border: 1px solid #FFB74D;
				border-radius: 6px;
				padding: 12px;
				margin-top: 20px;
				font-size: 13px;
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
							<h1>🎉 Votre compte a été créé !</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							
							<div class="welcome-box">
								<strong>Bienvenue sur MonHubImmo !</strong>
								<p style="margin: 5px 0 0 0;">Un administrateur a créé un compte pour vous. Suivez les étapes ci-dessous pour activer votre compte.</p>
							</div>

							<h3 style="color: #333; margin-top: 25px;">📋 Étapes pour activer votre compte :</h3>

							<div class="step-box">
								<div class="step-number">1</div>
								<div class="step-content">
									<strong>Vérifiez votre adresse email</strong>
									<p>Utilisez le code ci-dessous ou cliquez sur le bouton pour vérifier votre email :</p>
									<div class="code-container">
										<div class="code">${verificationCode}</div>
									</div>
									<p style="text-align:center;">
										<a href="${verifyUrl}" class="cta-button">Vérifier mon email</a>
									</p>
								</div>
							</div>

							${flowSpecificContent}

							<div class="step-box">
								<div class="step-number">3</div>
								<div class="step-content">
									<strong>Accédez à votre espace</strong>
									<p>Une fois connecté, vous aurez accès à toutes les fonctionnalités de MonHubImmo.</p>
								</div>
							</div>

							<div class="security-note">
								<strong>🔒 Note de sécurité :</strong> Si vous n'avez pas demandé ce compte, veuillez ignorer cet email. Aucune action ne sera effectuée sans votre consentement.
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
};
