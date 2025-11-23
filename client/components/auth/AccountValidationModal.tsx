'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';

interface AccountValidationModalProps {
	isOpen: boolean;
	onClose?: () => void;
}

export const AccountValidationModal: React.FC<AccountValidationModalProps> = ({
	isOpen,
	onClose,
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
			<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all">
				{/* Background gradient header */}
				<div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 pt-10 pb-8">
					{/* Icon - Check Circle for validation */}
					<div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-md">
						<svg
							className="w-10 h-10 text-green-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>

					{/* Title */}
					<h2 className="text-2xl font-bold text-gray-900 text-center">
						Compte créé avec succès !
					</h2>
				</div>

				{/* Content section */}
				<div className="px-8 py-8">
					{/* Main message */}
					<div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-100">
						<p className="text-gray-700 text-base leading-relaxed">
							Votre email a été vérifié. Votre compte est maintenant
							<span className="font-semibold text-blue-700"> en attente de validation </span>
							par notre équipe.
						</p>
						<p className="text-gray-700 text-base leading-relaxed mt-3">
							Vous recevrez un <span className="font-semibold">email de confirmation</span> une fois validé.
						</p>
					</div>
				</div>

				{/* Action section */}
				<div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
					<button
						onClick={() => router.push('/')}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
					>
						Retour à l&apos;accueil
					</button>
				</div>

				{/* Auto-redirect message */}
				<div className="bg-gray-50 px-8 py-3 text-center border-t border-gray-100">
					<p className="text-sm text-gray-500">
						⏱️ Redirection automatique dans 10 secondes...
					</p>
				</div>
			</div>
		</div>
	);
};

export default AccountValidationModal;