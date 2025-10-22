import React from 'react';
import { SearchAd } from '@/types/searchAd';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';

interface ContactCardProps {
	searchAd: SearchAd;
	isOwner: boolean;
	hasBlockingCollab: boolean;
	blockingStatus: 'pending' | 'accepted' | 'active' | null;
	onContact: () => void;
	onCollaborate: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
	searchAd,
	isOwner,
	hasBlockingCollab,
	blockingStatus,
	onContact,
	onCollaborate,
}) => {
	return (
		<div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl shadow-md border-2 border-cyan-200">
			<div className="flex items-center gap-3 mb-5">
				<div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
					<span className="text-xl">💬</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">Contact</h3>
			</div>

			<div className="flex items-center gap-3.5 mb-5 bg-white p-3.5 rounded-xl shadow-sm">
				<ProfileAvatar
					user={searchAd.authorId}
					size="lg"
					className="w-12 h-12 ring-2 ring-cyan-200"
				/>
				<div>
					<h4 className="font-bold text-gray-900 text-base">
						{searchAd.authorId.firstName}{' '}
						{searchAd.authorId.lastName}
					</h4>
					<p className="text-xs text-gray-600 font-medium">
						{searchAd.authorType === 'agent'
							? '🏢 Agent immobilier'
							: "🤝 Apporteur d'affaires"}
					</p>
				</div>
			</div>

			<div>
				{isOwner ? (
					<div className="w-full p-3 rounded-md border bg-gray-50 text-gray-700 text-sm flex items-center justify-center mb-4">
						<span className="mr-2">🚫</span>
						Vous êtes le propriétaire de cette page, vous ne pouvez
						pas proposer une collaboration.
					</div>
				) : (
					<>
						<button
							onClick={onContact}
							className="w-full px-4 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2.5 mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
							<span>Contacter l&apos;auteur</span>
						</button>

						{hasBlockingCollab ? (
							<div className="w-full p-3 rounded-md border bg-blue-50 text-blue-800 text-sm flex items-center justify-center mb-4">
								<span className="mr-2">ℹ️</span>
								{`Annonce déjà en collaboration (${
									blockingStatus === 'pending'
										? 'en attente'
										: blockingStatus === 'accepted'
											? 'acceptée'
											: 'active'
								})`}
							</div>
						) : (
							<button
								onClick={onCollaborate}
								className="w-full px-4 py-3.5 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2.5 mb-4 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
								<span>Proposer une collaboration</span>
							</button>
						)}
					</>
				)}
			</div>

			<div className="bg-white p-3.5 rounded-xl">
				<h4 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2 text-sm">
					<span>📤</span>
					<span>Partager cette annonce</span>
				</h4>
				<button
					onClick={() => {
						if (navigator.share) {
							navigator.share({
								title: searchAd.title,
								text: `Découvrez cette recherche immobilière: ${searchAd.title}`,
								url: window.location.href,
							});
						} else {
							navigator.clipboard.writeText(window.location.href);
							alert('Lien copié dans le presse-papiers!');
						}
					}}
					className="w-full px-3.5 py-2.5 bg-white border-2 border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 text-gray-700 hover:text-cyan-700 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 group text-xs"
				>
					<svg
						className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
						/>
					</svg>
					<span>Partager le lien</span>
				</button>
			</div>
		</div>
	);
};
