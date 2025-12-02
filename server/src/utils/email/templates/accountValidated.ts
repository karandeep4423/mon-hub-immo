import { getResponsiveStyles } from '../styles';

export const getAccountValidatedTemplate = (name: string, email: string): string => `
	<!DOCTYPE html>
	<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Compte validé - MonHubImmo</title>
		<style>
			body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; }
			.container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
			.header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; text-align: center; }
			.content { padding: 20px; }
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
							<h1>Votre compte a été validé</h1>
						</div>
						<div class="content">
							<p>Bonjour ${name},</p>
							<p>Votre compte MonHubImmo a été validé par notre équipe. Vous pouvez désormais vous connecter à la plateforme en utilisant l'adresse email suivante :</p>
							<p><strong>${email}</strong></p>
							<p>Si vous avez oublié votre mot de passe, vous pouvez le réinitialiser depuis la page de connexion.</p>
							<p>Bienvenue sur MonHubImmo !</p>
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
