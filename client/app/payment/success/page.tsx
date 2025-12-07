'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { logger } from '@/lib/utils/logger';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

const unlockedFeatures = [
	'Publication de biens immobiliers',
	'Collaboration avec les apporteurs',
	'Messagerie en temps réel',
	'Gestion des rendez-vous',
];

export default function PaymentSuccessPage() {
	const searchParams = useSearchParams();
	const { refreshUser } = useAuth();
	const [verifying, setVerifying] = useState(true);

	useEffect(() => {
		const sessionId = searchParams.get('session_id');

		const verifyPayment = async () => {
			if (!sessionId) {
				setVerifying(false);
				return;
			}

			try {
				const response = await api.get(
					`/payment/verify-session?session_id=${sessionId}`,
				);

				if (response.data.success) {
					await refreshUser();
				}
			} catch (error) {
				logger.error(
					'[PaymentSuccess] Error verifying session:',
					error,
				);
			} finally {
				setVerifying(false);
			}
		};

		verifyPayment();
	}, [searchParams, refreshUser]);

	if (verifying) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="text-center">
					<LoadingSpinner size="lg" />
					<p className="mt-4 text-gray-600">
						Vérification de votre paiement...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section with Brand Gradient */}
			<div className="bg-brand-gradient relative overflow-hidden">
				{/* Decorative Background Pattern */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
				</div>

				<div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
					{/* Success Icon */}
					<div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
						<div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
							<FiCheck className="w-8 h-8 text-brand" />
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
						Paiement réussi !
					</h1>
					<p className="text-lg text-brand-100">
						Votre abonnement est maintenant actif
					</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-16">
				<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
					{/* Description */}
					<div className="px-8 pt-8 pb-6 text-center">
						<p className="text-gray-600">
							Vous avez maintenant accès à toutes les
							fonctionnalités de MonHubImmo.
						</p>
					</div>

					{/* Features unlocked */}
					<div className="px-8 pb-6">
						<div className="bg-brand-50 rounded-xl p-5">
							<h3 className="font-semibold text-brand-dark mb-3">
								Fonctionnalités débloquées :
							</h3>
							<ul className="space-y-2">
								{unlockedFeatures.map((feature, index) => (
									<li
										key={index}
										className="flex items-center text-sm text-gray-700"
									>
										<div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center mr-3 flex-shrink-0">
											<FiCheck className="w-3 h-3 text-brand" />
										</div>
										{feature}
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* CTA */}
					<div className="px-8 pb-8">
						<Link
							href="/dashboard"
							className="flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand-dark text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-brand hover:shadow-brand-lg"
						>
							<span>Accéder au tableau de bord</span>
							<FiArrowRight className="w-5 h-5" />
						</Link>
					</div>

					{/* Help text */}
					<div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
						<p className="text-xs text-gray-500 text-center">
							Vous recevrez un email de confirmation avec les
							détails de votre abonnement.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
