import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';

interface ProfileCompletionBannerProps {
	onCompleteProfile?: () => void;
}

export const ProfileCompletionBanner: React.FC<
	ProfileCompletionBannerProps
> = ({ onCompleteProfile }) => {
	const router = useRouter();

	const handleCompleteProfile = () => {
		if (onCompleteProfile) {
			onCompleteProfile();
		} else {
			router.push('/auth/complete-profile');
		}
	};

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
			<div className="bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-xl p-6 mb-6">
				<div className="flex items-start space-x-4">
					<div className="flex-shrink-0">
						<div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
							<svg
								className="w-6 h-6 text-brand"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>
					</div>
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Complétez votre profil d&apos;agent
						</h3>
						<p className="text-gray-600 mb-4">
							Pour profiter pleinement de HubImmo et collaborer
							avec d&apos;autres professionnels, veuillez
							compléter les informations de votre profil
							d&apos;agent immobilier.
						</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Button
								onClick={handleCompleteProfile}
								className="bg-brand hover:bg-brand-600 text-white"
								size="md"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								Compléter mon profil
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
