'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface AccountValidationModalProps {
	isOpen: boolean;
}

export const AccountValidationModal: React.FC<AccountValidationModalProps> = ({
	isOpen,
}) => {
	const router = useRouter();

	useEffect(() => {
		if (isOpen) {
			// Auto-redirect after 10 seconds
			const timeout = setTimeout(() => {
				router.push('/');
			}, 10000);
			return () => clearTimeout(timeout);
		}
	}, [isOpen, router]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
			<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
				{/* Content */}
				<div className="p-8 text-center">
					{/* Success Icon */}
					<div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
						<svg
							className="w-10 h-10 text-green-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					{/* Title */}
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Compte créé avec succès !
					</h2>

					{/* Subtitle */}
					<p className="text-gray-500 mb-6">
						Votre email a été vérifié
					</p>

					{/* Status Card */}
					<div className="bg-brand-subtle border border-brand-200 rounded-xl p-5 mb-6 text-left">
						<div className="flex items-start gap-3">
							<div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
								<svg
									className="w-5 h-5 text-brand"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 mb-1">
									En attente de validation
								</h3>
								<p className="text-sm text-gray-600 leading-relaxed">
									Notre équipe va vérifier votre profil. Vous
									recevrez un{' '}
									<span className="font-medium text-brand">
										email de confirmation
									</span>{' '}
									une fois votre compte validé.
								</p>
							</div>
						</div>
					</div>

					{/* Info Note */}
					<div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>Délai habituel : 24 à 48 heures</span>
					</div>

					{/* CTA Button */}
					<Button
						onClick={() => router.push('/')}
						className="w-full"
						size="lg"
					>
						Retour à l&apos;accueil
					</Button>

					{/* Auto-redirect */}
					<p className="text-xs text-gray-400 mt-4">
						Redirection automatique dans 10 secondes...
					</p>
				</div>
			</div>
		</div>
	);
};

export default AccountValidationModal;
