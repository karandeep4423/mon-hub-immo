'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/utils/errorHandler';
import { toast } from 'react-toastify';
import { useFetch } from '@/hooks/useFetch';
import {
	FiCreditCard,
	FiCalendar,
	FiExternalLink,
	FiAlertCircle,
	FiCheckCircle,
	FiClock,
} from 'react-icons/fi';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type PlanType = 'monthly' | 'annual' | 'free_admin_granted' | 'none';

interface SubscriptionData {
	status: string;
	plan: PlanType;
	isPaid: boolean;
	currentPeriodStart?: string;
	currentPeriodEnd?: string;
	cancelAtPeriodEnd?: boolean;
	message?: string;
}

const getPlanLabel = (plan: PlanType): string => {
	switch (plan) {
		case 'annual':
			return `Annuel - ${process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE || '28.80'}€/an`;
		case 'monthly':
		default:
			return `Mensuel - ${process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE || '2.40'}€/mois`;
	}
};

interface SubscriptionManagerProps {
	compact?: boolean;
}

export const SubscriptionManager = ({
	compact = true,
}: SubscriptionManagerProps) => {
	const [portalLoading, setPortalLoading] = useState(false);

	const {
		data: subscription,
		loading,
		error,
		refetch,
	} = useFetch<SubscriptionData>(
		() => api.get('/payment/subscription').then((res) => res.data),
		{ showErrorToast: false },
	);

	// Refetch subscription when returning from Stripe portal
	useEffect(() => {
		const handleFocus = () => {
			refetch();
		};
		window.addEventListener('focus', handleFocus);
		return () => window.removeEventListener('focus', handleFocus);
	}, [refetch]);

	const handleManageSubscription = async () => {
		setPortalLoading(true);
		try {
			const response = await api.post('/payment/create-portal-session');
			const { url } = response.data;

			if (url) {
				window.location.href = url;
			}
		} catch (error) {
			const apiError = handleApiError(
				error,
				'SubscriptionManager',
				"Erreur lors de l'ouverture du portail",
			);
			logger.error('[SubscriptionManager] Portal error:', apiError);
			toast.error(apiError.message);
		} finally {
			setPortalLoading(false);
		}
	};

	const getStatusBadge = (status: string, cancelAtPeriodEnd?: boolean) => {
		if (status === 'active' && cancelAtPeriodEnd) {
			return (
				<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
					<FiClock className="w-3 h-3" />
					Annulation programmée
				</span>
			);
		}

		switch (status) {
			case 'active':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
						<FiCheckCircle className="w-3 h-3" />
						Actif
					</span>
				);
			case 'past_due':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
						<FiAlertCircle className="w-3 h-3" />
						Paiement en retard
					</span>
				);
			case 'canceled':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						Annulé
					</span>
				);
			case 'free_admin_granted':
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
						<FiCheckCircle className="w-3 h-3" />
						Accès gratuit
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						{status}
					</span>
				);
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	if (loading) {
		return compact ? (
			<div className="flex items-center justify-center py-4">
				<LoadingSpinner size="sm" />
			</div>
		) : (
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<div className="flex items-center justify-center py-8">
					<LoadingSpinner size="md" />
				</div>
			</div>
		);
	}

	if (error || !subscription) {
		return compact ? (
			<div className="text-center py-4">
				<p className="text-sm text-gray-600 mb-2">
					Erreur de chargement
				</p>
				<button
					onClick={() => refetch()}
					className="text-sm text-brand hover:text-brand-dark font-medium"
				>
					Réessayer
				</button>
			</div>
		) : (
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<div className="text-center py-8">
					<FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600">
						Impossible de charger les informations d&apos;abonnement
					</p>
					<button
						onClick={() => refetch()}
						className="mt-4 text-brand hover:text-brand-dark font-medium"
					>
						Réessayer
					</button>
				</div>
			</div>
		);
	}

	// No subscription
	if (subscription.status === 'none') {
		return compact ? (
			<div>
				<div className="flex items-center gap-2 mb-3">
					<div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg">
						<FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
					</div>
					<h4 className="text-sm sm:text-md font-semibold text-gray-900">
						Mon abonnement
					</h4>
					<span className="ml-auto inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
						Inactif
					</span>
				</div>
				<a
					href="/payment"
					className="w-full flex items-center justify-center gap-2 bg-brand text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-brand-dark transition-colors shadow-brand text-sm sm:text-base"
				>
					<FiCreditCard className="w-4 h-4" />
					Activer mon abonnement
				</a>
			</div>
		) : (
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Mon abonnement
				</h3>
				<div className="text-center py-8">
					<FiCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600 mb-4">
						Vous n&apos;avez pas d&apos;abonnement actif
					</p>
					<a
						href="/payment"
						className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors shadow-brand"
					>
						<FiCreditCard className="w-4 h-4" />
						Souscrire un abonnement
					</a>
				</div>
			</div>
		);
	}

	// Admin granted free access
	if (subscription.plan === 'free_admin_granted') {
		return compact ? (
			<div>
				<div className="flex items-center gap-2 mb-3">
					<div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
						<FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
					</div>
					<h4 className="text-sm sm:text-md font-semibold text-gray-900">
						Mon abonnement
					</h4>
					<span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
						<FiCheckCircle className="w-3 h-3" />
						Accès gratuit
					</span>
				</div>
				<div className="bg-brand-50 rounded-lg p-3 sm:p-4">
					<p className="text-sm text-brand-dark">
						{subscription.message ||
							'Votre accès a été accordé gratuitement par un administrateur.'}
					</p>
				</div>
			</div>
		) : (
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Mon abonnement
				</h3>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-gray-600">Statut</span>
						{getStatusBadge('free_admin_granted')}
					</div>
					<div className="bg-brand-50 rounded-lg p-4">
						<p className="text-sm text-brand-dark">
							{subscription.message ||
								'Votre accès a été accordé gratuitement par un administrateur.'}
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Active subscription - compact view for profile card
	if (compact) {
		return (
			<div>
				<div className="flex items-center gap-2 mb-3 sm:mb-4">
					<div className="p-1.5 sm:p-2 bg-brand-50 rounded-lg">
						<FiCreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
					</div>
					<h4 className="text-sm sm:text-md font-semibold text-gray-900">
						Mon abonnement
					</h4>
				</div>

				{/* Desktop: Side by side layout | Mobile: Stacked */}
				<div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
					{/* Left: Subscription Info */}
					<div className="flex-1 space-y-3">
						{/* Status + Plan Row */}
						<div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
							<div className="flex items-center gap-3 flex-1">
								{getStatusBadge(
									subscription.status,
									subscription.cancelAtPeriodEnd,
								)}
								<div className="h-6 w-px bg-gray-200 hidden sm:block" />
								<div className="flex-1">
									<p className="text-xs text-gray-500">
										Formule
									</p>
									<p className="text-sm sm:text-base font-semibold text-gray-900">
										{getPlanLabel(subscription.plan)}
									</p>
								</div>
							</div>
							{/* Next renewal on same row for desktop */}
							{subscription.status === 'active' &&
								!subscription.cancelAtPeriodEnd &&
								subscription.currentPeriodEnd && (
									<div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
										<p className="text-xs text-gray-500">
											Prochain renouvellement
										</p>
										<p className="text-sm sm:text-base font-medium text-gray-700">
											{formatDate(
												subscription.currentPeriodEnd,
											)}
										</p>
									</div>
								)}
						</div>

						{/* Show end date when subscription is canceled but still active */}
						{subscription.cancelAtPeriodEnd &&
							subscription.currentPeriodEnd && (
								<div className="bg-yellow-50 rounded-xl p-3 sm:p-4 border border-yellow-100">
									<p className="text-sm text-yellow-800">
										Votre accès reste actif jusqu&apos;au{' '}
										<span className="font-semibold">
											{formatDate(
												subscription.currentPeriodEnd,
											)}
										</span>
									</p>
								</div>
							)}

						{/* Warning for past due */}
						{subscription.status === 'past_due' && (
							<div className="bg-red-50 rounded-lg p-4">
								<p className="text-sm text-red-700">
									Votre paiement a échoué. Veuillez mettre à
									jour votre moyen de paiement.
								</p>
							</div>
						)}
					</div>

					{/* Right: Action Button */}
					<div className="mt-4 lg:mt-0 lg:w-auto flex flex-col items-center lg:items-end">
						<button
							onClick={handleManageSubscription}
							disabled={portalLoading}
							className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 text-sm sm:text-base font-medium shadow-sm hover:shadow-md"
						>
							{portalLoading ? (
								<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
							) : (
								<>
									<FiExternalLink className="w-4 h-4" />
									Gérer mon abonnement
								</>
							)}
						</button>
						<p className="text-[10px] sm:text-xs text-gray-500 mt-2 text-center lg:text-right">
							Paiement, factures ou annulation
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Full standalone view (when used outside profile card)

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Mon abonnement
			</h3>

			<div className="space-y-4">
				{/* Status */}
				<div className="flex items-center justify-between">
					<span className="text-gray-600">Statut</span>
					{getStatusBadge(
						subscription.status,
						subscription.cancelAtPeriodEnd,
					)}
				</div>

				{/* Plan */}
				<div className="flex items-center justify-between">
					<span className="text-gray-600">Formule</span>
					<span className="font-medium text-gray-900">
						{getPlanLabel(subscription.plan)}
					</span>
				</div>

				{/* Next billing date */}
				{subscription.currentPeriodEnd && (
					<div className="flex items-center justify-between">
						<span className="text-gray-600">
							{subscription.cancelAtPeriodEnd
								? "Accès jusqu'au"
								: 'Prochain renouvellement'}
						</span>
						<span className="flex items-center gap-2 font-medium text-gray-900">
							<FiCalendar className="w-4 h-4 text-gray-400" />
							{formatDate(subscription.currentPeriodEnd)}
						</span>
					</div>
				)}

				{/* Warning for canceled subscription */}
				{subscription.cancelAtPeriodEnd && (
					<div className="bg-yellow-50 rounded-lg p-4 mt-4">
						<p className="text-sm text-yellow-700">
							Votre abonnement a été annulé. Vous conserverez
							l&apos;accès jusqu&apos;au{' '}
							{formatDate(subscription.currentPeriodEnd)}.
						</p>
					</div>
				)}

				{/* Warning for past due */}
				{subscription.status === 'past_due' && (
					<div className="bg-red-50 rounded-lg p-4 mt-4">
						<p className="text-sm text-red-700">
							Votre paiement a échoué. Veuillez mettre à jour
							votre moyen de paiement pour conserver l&apos;accès.
						</p>
					</div>
				)}

				{/* Manage button */}
				<div className="pt-4 border-t">
					<button
						onClick={handleManageSubscription}
						disabled={portalLoading}
						className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
					>
						{portalLoading ? (
							<LoadingSpinner size="sm" />
						) : (
							<>
								<FiExternalLink className="w-4 h-4" />
								Gérer mon abonnement
							</>
						)}
					</button>
					<p className="text-xs text-gray-500 text-center mt-2">
						Modifier le moyen de paiement, consulter les factures ou
						annuler
					</p>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionManager;
