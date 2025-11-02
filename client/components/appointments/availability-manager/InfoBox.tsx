export const InfoBox = () => {
	return (
		<div className="bg-info-light border border-info rounded-lg p-4">
			<div className="flex items-start gap-3">
				<svg
					className="w-5 h-5 text-info mt-0.5 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div className="text-sm text-info">
					<p className="font-medium mb-1">
						💡 Enregistrement automatique activé
					</p>
					<ul className="space-y-1 list-disc list-inside">
						<li>
							Toutes vos modifications sont sauvegardées
							automatiquement après 2 secondes
						</li>
						<li>
							Ajoutez plusieurs créneaux par jour si besoin
							(matin/après-midi)
						</li>
						<li>
							Bloquez des dates spécifiques - une seule date ou
							une période complète
						</li>
						<li>
							Les créneaux disponibles sont calculés selon la
							durée et le temps de pause
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};
