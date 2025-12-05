import { getResponsiveStyles } from '../styles';

export const getInviteTemplate = (name: string, inviteUrl: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Invitation MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #6AD1E3, #3BA8BB); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			.important { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin: 15px 0; }
			${getResponsiveStyles()}
			a.cta { background: #00BCE4; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; display: inline-block; }
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>Invitation à rejoindre MonHubImmo</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Un compte a été créé pour vous sur MonHubImmo.</p>
							<div class="important">
								<strong>ℹ️ Étape 1 :</strong> Vérifiez d'abord votre email en utilisant le code de vérification envoyé dans un autre email.
							</div>
							<p><strong>Étape 2 :</strong> Après vérification, cliquez sur le bouton ci‑dessous pour définir votre mot de passe :</p>
							<p style="text-align:center; margin: 18px 0;"><a class="cta" href="${inviteUrl}">Définir mon mot de passe</a></p>
							<p>Ce lien expire dans 24 heures. Si vous n'avez pas demandé ce compte, ignorez cet email.</p>
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
