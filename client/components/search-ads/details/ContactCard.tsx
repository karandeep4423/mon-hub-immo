import React from 'react';
import { SearchAd } from '@/types/searchAd';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { shareContent } from '@/lib/utils/share';
import { Features } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

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
	const { user } = useAuth();
	const author = searchAd.authorId ?? {
		_id: '',
		firstName: 'Anonyme',
		lastName: '',
		userType: 'utilisateur',
	};
	const isAgent = user?.userType === 'agent';

	return (
		<div className="bg-gradient-to-br from-brand-50 to-brand-100 p-5 rounded-xl shadow-md border-2 border-brand-200">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-600 rounded-xl flex items-center justify-center shadow-md">
					<span className="text-xl">💬</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">Contact</h3>
			</div>

			<div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl shadow-sm">
				<ProfileAvatar
					user={author}
					size="lg"
					className="w-12 h-12 ring-2 ring-brand-200"
				/>
				<div>
					<h4 className="font-bold text-gray-900 text-base">
						{author.firstName} {author.lastName}
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
					<div className="w-full p-3 rounded-lg border bg-gray-50 text-gray-700 text-sm flex items-center justify-center mb-3">
						<span className="mr-2">🚫</span>
						Vous êtes le propriétaire de cette page, vous ne pouvez
						pas proposer une collaboration.
					</div>
				) : (
					<>
						<button
							onClick={onContact}
							className="w-full px-4 py-3 bg-brand hover:bg-brand-600 text-white rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 mb-3 shadow-md hover:shadow-lg text-sm"
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
							<div className="w-full p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800 text-sm flex items-center justify-center mb-3">
								<span className="mr-2">ℹ️</span>
								{`Annonce déjà en collaboration (${blockingStatus ? Features.Collaboration.COLLABORATION_STATUS_CONFIG[blockingStatus]?.label || blockingStatus : 'En attente'})`}
							</div>
						) : isAgent ? (
							<button
								onClick={onCollaborate}
								className="w-full px-4 py-3 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 mb-3 text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
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
						) : (
							<div className="w-full p-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-800 text-sm flex items-center justify-center mb-3">
								<span className="mr-2">🚫</span>
								Seuls les agents peuvent proposer des
								collaborations
							</div>
						)}
					</>
				)}
			</div>

			<div className="bg-white p-3 rounded-xl">
				<h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
					<span>📤</span>
					<span>Partager cette annonce</span>
				</h4>
				<button
					onClick={() =>
						shareContent({
							title: searchAd.title,
							text: `Découvrez cette recherche immobilière: ${searchAd.title}`,
							successMessage:
								'Lien copié dans le presse-papiers!',
						})
					}
					className="w-full px-3 py-2.5 bg-white border-2 border-gray-300 hover:border-brand hover:bg-brand-50 text-gray-700 hover:text-brand-700 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 group text-sm"
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
