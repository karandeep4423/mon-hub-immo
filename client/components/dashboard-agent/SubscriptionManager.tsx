'use client';

import { useState } from 'react';
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

interface SubscriptionData {
	status: string;
	plan: string;
	isPaid: boolean;
	currentPeriodStart?: string;
	currentPeriodEnd?: string;
	cancelAtPeriodEnd?: boolean;
	message?: string;
}

export const SubscriptionManager = () => {
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
		return (
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
				<div className="flex items-center justify-center py-8">
					<LoadingSpinner size="md" />
				</div>
			</div>
		);
	}

	if (error || !subscription) {
		return (
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
		return (
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
		return (
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
						Mensuel - 19€/mois
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
