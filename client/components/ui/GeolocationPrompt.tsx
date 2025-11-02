/**
 * Geolocation Permission Prompt
 * Modal to request user's location for showing nearby posts
 */

'use client';

interface GeolocationPromptProps {
	onAllow: () => void;
	onDeny: () => void;
	error: string | null;
}

export const GeolocationPrompt: React.FC<GeolocationPromptProps> = ({
	onAllow,
	onDeny,
	error,
}) => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
				<div className="flex items-center mb-4">
					<div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mr-4">
						<svg
							className="w-6 h-6 text-brand"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900">
							Voir les annonces près de vous ?
						</h3>
						<p className="text-sm text-gray-500">
							Autoriser la localisation
						</p>
					</div>
				</div>

				<p className="text-gray-600 mb-6">
					Nous utiliserons votre position pour afficher les biens et
					recherches disponibles dans votre région. Vous pourrez
					toujours chercher dans d&apos;autres villes.
				</p>

				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}

				<div className="flex gap-3">
					<button
						onClick={onDeny}
						className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
					>
						Non merci
					</button>
					<button
						onClick={onAllow}
						className="flex-1 px-4 py-2.5 text-white bg-brand rounded-lg font-medium hover:bg-brand/90 transition-colors"
					>
						Autoriser
					</button>
				</div>

				<p className="text-xs text-gray-500 mt-4 text-center">
					Votre position ne sera jamais partagée publiquement
				</p>
			</div>
		</div>
	);
};
