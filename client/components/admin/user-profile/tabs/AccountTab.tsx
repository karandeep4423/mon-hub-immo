'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
	Settings,
	Key,
	CheckCircle2,
	XCircle,
	ShieldX,
	CreditCard,
	Calendar,
	AlertTriangle,
	Ban,
	RefreshCw,
	Euro,
} from 'lucide-react';
import { UserProfile, ConfirmAction } from '../types';
import { formatDate } from '../constants';
import { TabSectionHeader, InfoCard, StatusIndicator } from '../FormComponents';

/**
 * Get subscription status badge styling
 */
function getSubscriptionStatusStyle(status?: string) {
	switch (status) {
		case 'active':
			return {
				bg: 'bg-green-50',
				text: 'text-green-700',
				border: 'border-green-200',
				label: 'Actif',
				icon: CheckCircle2,
				iconColor: 'text-green-500',
			};
		case 'pending_cancellation':
			return {
				bg: 'bg-orange-50',
				text: 'text-orange-700',
				border: 'border-orange-200',
				label: 'Annulation programmée',
				icon: AlertTriangle,
				iconColor: 'text-orange-500',
			};
		case 'past_due':
			return {
				bg: 'bg-amber-50',
				text: 'text-amber-700',
				border: 'border-amber-200',
				label: 'Paiement en retard',
				icon: AlertTriangle,
				iconColor: 'text-amber-500',
			};
		case 'canceled':
			return {
				bg: 'bg-red-50',
				text: 'text-red-700',
				border: 'border-red-200',
				label: 'Annulé',
				icon: Ban,
				iconColor: 'text-red-500',
			};
		case 'expired':
			return {
				bg: 'bg-gray-50',
				text: 'text-gray-700',
				border: 'border-gray-200',
				label: 'Expiré',
				icon: XCircle,
				iconColor: 'text-gray-500',
			};
		default:
			return {
				bg: 'bg-gray-50',
				text: 'text-gray-600',
				border: 'border-gray-200',
				label: status || 'N/A',
				icon: XCircle,
				iconColor: 'text-gray-400',
			};
	}
}

interface AccountTabProps {
	form: UserProfile;
	user: UserProfile;
	isAgent: boolean;
	isLoading: boolean;
	setPendingAction: (action: ConfirmAction) => void;
}

export function AccountTab({
	form,
	user,
	isAgent,
	isLoading,
	setPendingAction,
}: AccountTabProps) {
	return (
		<div className="space-y-6">
			<Card className="shadow-lg border-0 ring-1 ring-gray-100 overflow-hidden">
				<div className="p-6">
					<TabSectionHeader
						icon={Settings}
						title="Informations du compte"
						description="Détails techniques et statuts"
						iconBgColor="bg-orange-50"
						iconColor="text-orange-600"
					/>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						<InfoCard
							label="Date d'inscription"
							value={
								<span className="text-lg">
									{formatDate(form.createdAt)}
								</span>
							}
						/>

						<InfoCard
							label="Profil complété"
							value={
								<StatusIndicator
									isPositive={!!form.profileCompleted}
									positiveText="Oui"
									negativeText="Non"
								/>
							}
						/>

						<InfoCard
							label="Email vérifié"
							value={
								<StatusIndicator
									isPositive={!!form.isValidated}
									positiveText="Oui"
									negativeText="Non"
								/>
							}
						/>

						<InfoCard
							label="Statut du compte"
							value={
								<StatusIndicator
									isPositive={!form.isBlocked}
									positiveText="Actif"
									negativeText="Bloqué"
									positiveIcon={CheckCircle2}
									negativeIcon={ShieldX}
								/>
							}
						/>

						{form.accessGrantedByAdmin && (
							<InfoCard
								label="Accès manuel"
								variant="purple"
								value={
									<p className="font-bold flex items-center gap-2 text-purple-900">
										<div className="p-1 bg-purple-100 rounded-full">
											<Key className="w-4 h-4 text-purple-600" />
										</div>
										Accordé par admin
									</p>
								}
							/>
						)}

						<InfoCard
							label="ID Utilisateur"
							value={
								<p className="font-mono text-xs text-gray-600 truncate bg-white p-2 rounded border border-gray-200">
									{user._id}
								</p>
							}
						/>
					</div>
				</div>
			</Card>

			{isAgent && (
				<Card className="shadow-md border-0 ring-1 ring-gray-200">
					<div className="p-6">
						<h3 className="text-lg font-semibold mb-6 flex items-center text-gray-900">
							<CreditCard
								size={20}
								className="mr-2 text-primary-600"
							/>
							Informations d&apos;abonnement
						</h3>

						{/* Payment & Subscription Status */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
							<div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
								<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
									Statut paiement
								</p>
								<p className="font-semibold flex items-center gap-2">
									{form.isPaid ? (
										<>
											<CheckCircle2 className="w-4 h-4 text-green-500" />
											<span className="text-green-700">
												Payé
											</span>
										</>
									) : (
										<>
											<XCircle className="w-4 h-4 text-amber-500" />
											<span className="text-amber-700">
												Non payé
											</span>
										</>
									)}
								</p>
							</div>

							<div
								className={`p-4 rounded-lg border ${getSubscriptionStatusStyle(form.subscriptionStatus).bg} ${getSubscriptionStatusStyle(form.subscriptionStatus).border}`}
							>
								<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
									Statut abonnement
								</p>
								<p
									className={`font-semibold flex items-center gap-2 ${getSubscriptionStatusStyle(form.subscriptionStatus).text}`}
								>
									{React.createElement(
										getSubscriptionStatusStyle(
											form.subscriptionStatus,
										).icon,
										{
											className: `w-4 h-4 ${getSubscriptionStatusStyle(form.subscriptionStatus).iconColor}`,
										},
									)}
									{
										getSubscriptionStatusStyle(
											form.subscriptionStatus,
										).label
									}
								</p>
							</div>

							<div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
								<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
									Plan
								</p>
								<p className="font-semibold text-blue-700">
									{form.subscriptionPlan === 'monthly'
										? 'Mensuel (19€/mois)'
										: 'Aucun plan'}
								</p>
							</div>
						</div>

						{/* Subscription Dates */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
							{form.subscriptionStartDate && (
								<div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
										<Calendar className="w-3 h-3" />
										Date de début
									</p>
									<p className="font-semibold text-gray-900">
										{formatDate(form.subscriptionStartDate)}
									</p>
								</div>
							)}

							{form.subscriptionEndDate && (
								<div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
										<RefreshCw className="w-3 h-3" />
										Date de renouvellement
									</p>
									<p className="font-semibold text-emerald-700">
										{formatDate(form.subscriptionEndDate)}
									</p>
								</div>
							)}

							{form.canceledAt && (
								<div className="p-4 bg-red-50 rounded-lg border border-red-100">
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
										<Ban className="w-3 h-3" />
										Annulé le
									</p>
									<p className="font-semibold text-red-700">
										{formatDate(form.canceledAt)}
									</p>
									{form.cancellationReason && (
										<p className="text-xs text-red-600 mt-1">
											Raison: {form.cancellationReason}
										</p>
									)}
								</div>
							)}
						</div>

						{/* Payment History */}
						{(form.lastPaymentDate || form.lastPaymentAmount) && (
							<div className="mb-6">
								<h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
									<Euro className="w-4 h-4 text-gray-500" />
									Dernier paiement
								</h4>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
									{form.lastPaymentDate && (
										<div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
											<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
												Date
											</p>
											<p className="font-medium text-gray-900 text-sm">
												{formatDate(
													form.lastPaymentDate,
												)}
											</p>
										</div>
									)}
									{form.lastPaymentAmount !== undefined &&
										form.lastPaymentAmount !== null && (
											<div className="p-3 bg-green-50 rounded-lg border border-green-100">
												<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
													Montant
												</p>
												<p className="font-medium text-green-700 text-sm">
													{form.lastPaymentAmount} €
												</p>
											</div>
										)}
									{form.lastInvoiceId && (
										<div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
											<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
												Facture ID
											</p>
											<p className="font-mono text-xs text-gray-600 truncate">
												{form.lastInvoiceId}
											</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Failed Payments Warning */}
						{form.failedPaymentCount !== undefined &&
							form.failedPaymentCount !== null &&
							form.failedPaymentCount > 0 && (
								<div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
									<div className="flex items-start gap-3">
										<AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
										<div>
											<p className="font-medium text-amber-800">
												Paiements échoués:{' '}
												{form.failedPaymentCount}
											</p>
											{form.lastFailedPaymentDate && (
												<p className="text-sm text-amber-700 mt-1">
													Dernier échec:{' '}
													{formatDate(
														form.lastFailedPaymentDate,
													)}
												</p>
											)}
										</div>
									</div>
								</div>
							)}

						{/* Stripe IDs */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
							{form.stripeCustomerId && (
								<div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
										ID Client Stripe
									</p>
									<p className="font-mono text-xs text-gray-700 truncate">
										{form.stripeCustomerId}
									</p>
								</div>
							)}

							{form.stripeSubscriptionId && (
								<div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
									<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
										ID Abonnement Stripe
									</p>
									<p className="font-mono text-xs text-gray-700 truncate">
										{form.stripeSubscriptionId}
									</p>
								</div>
							)}
						</div>

						{/* Manual Access Controls */}
						{!form.isPaid && (
							<div className="mt-6 pt-6 border-t border-gray-100">
								<h4 className="text-sm font-medium text-gray-900 mb-4">
									Gestion manuelle de l&apos;accès
								</h4>
								<div className="flex flex-wrap gap-3">
									{form.accessGrantedByAdmin ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setPendingAction(
													'revoke_access',
												)
											}
											disabled={isLoading}
											className="border-orange-300 text-orange-700 hover:bg-orange-50"
										>
											Révoquer accès manuel
										</Button>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setPendingAction('grant_access')
											}
											disabled={isLoading}
											className="border-purple-300 text-purple-700 hover:bg-purple-50"
										>
											Donner accès manuel
										</Button>
									)}
								</div>
							</div>
						)}
					</div>
				</Card>
			)}
		</div>
	);
}
