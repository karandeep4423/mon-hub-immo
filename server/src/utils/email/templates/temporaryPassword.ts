import { getResponsiveStyles } from '../styles';

export const getTemporaryPasswordTemplate = (
	name: string,
	tempPassword: string,
): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Mot de passe temporaire - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #6AD1E3, #3BA8BB); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
			.password { font-family: monospace; background: #eef; padding: 10px; border-radius: 6px; display: inline-block; }
			.important { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px; margin: 15px 0; }
			.footer { font-size: 12px; color: #666; padding: 20px; background: #f8f9fa; text-align: center; }
			${getResponsiveStyles()}
		</style>
	</head>
	<body>
		<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td style="padding: 20px 0;">
					<div class="container">
						<div class="header">
							<div class="logo">MonHubImmo</div>
							<h1>Mot de passe temporaire</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Un administrateur a créé un compte pour vous sur MonHubImmo.</p>
							<div class="important">
								<strong>ℹ️ Étape 1 :</strong> Vérifiez d'abord votre email en utilisant le code de vérification envoyé dans un autre email.
							</div>
							<p><strong>Étape 2 :</strong> Après vérification, connectez-vous avec le mot de passe temporaire ci‑dessous :</p>
							<p class="password">${tempPassword}</p>
							<p>Pour votre sécurité, vous serez invité(e) à définir un nouveau mot de passe lors de votre première connexion.</p>
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
