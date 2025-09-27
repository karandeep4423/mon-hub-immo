// Centralized French notification texts
// Keep messages short, human, and consistent across the app.

export type ChatNewMessageParams = {
	actorName: string;
	text?: string;
	attachmentCount?: number;
};

export const chatTexts = {
	newMessageTitle: (p: { actorName: string }) =>
		`Nouveau message de ${p.actorName}`,
	newMessageBody: (p: ChatNewMessageParams) => {
		if (p.text && p.text.trim()) return p.text.slice(0, 120);
		const n = p.attachmentCount ?? 0;
		if (n > 0)
			return `${p.actorName} a envoyé ${n} pièce${n > 1 ? 's' : ''} jointe${
				n > 1 ? 's' : ''
			}`;
		return `${p.actorName} vous a envoyé un message`;
	},
};

export const collabTexts = {
	proposalReceivedTitle: 'Nouvelle proposition de collaboration',
	proposalReceivedBody: (p: { actorName: string; commission: number }) =>
		`Proposition de ${p.actorName} – commission ${p.commission}%`,
	proposalAcceptedTitle: (p: { actorName: string }) =>
		`Collaboration acceptée par ${p.actorName}`,
	proposalAcceptedBody: (p: { actorName: string }) =>
		`${p.actorName} a accepté votre proposition de collaboration.`,
	proposalRejectedTitle: (p: { actorName: string }) =>
		`Collaboration refusée par ${p.actorName}`,
	proposalRejectedBody: (p: { actorName: string }) =>
		`${p.actorName} a refusé votre proposition de collaboration.`,
	noteAddedTitle: (p: { actorName: string }) =>
		`Nouvelle note de ${p.actorName}`,
	progressUpdatedTitle: 'Avancement de la collaboration mis à jour',
	progressUpdatedBody: (p: { step: string }) => `Étape : ${p.step}`,
	cancelledTitle: 'Collaboration annulée',
	cancelledBody: 'La collaboration a été annulée.',
	completedTitle: 'Collaboration terminée',
	completedBody: 'La collaboration a été marquée comme terminée.',
	activatedTitle: 'Collaboration activée',
	activatedBody: 'La collaboration est maintenant active.',
};

export const contractTexts = {
	signedTitle: 'Contrat signé',
	signedBody: 'Le contrat a été signé.',
};
