export interface ContactFormData {
	name: string;
	email: string;
	phone?: string;
}

export interface ContactResponse {
	success: boolean;
	message: string;
}

export class ContactApi {
	/**
	 * Send contact form data to external service
	 */
	static async sendContactForm(
		data: ContactFormData,
	): Promise<ContactResponse> {
		try {
			const response = await fetch(
				'https://www.monhubimmo.com/api/send-email',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
				},
			);

			if (response.ok) {
				return {
					success: true,
					message:
						'Votre message a été envoyé avec succès. Nous vous contacterons bientôt.',
				};
			} else {
				throw new Error("Erreur lors de l'envoi du message");
			}
		} catch (error) {
			console.error('Contact form error:', error);
			return {
				success: false,
				message:
					'Une erreur est survenue. Veuillez réessayer plus tard.',
			};
		}
	}
}
