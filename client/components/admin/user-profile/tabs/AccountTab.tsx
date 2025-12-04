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
} from 'lucide-react';
import { UserProfile, ConfirmAction } from '../types';
import { formatDate } from '../constants';
import { TabSectionHeader, InfoCard, StatusIndicator } from '../FormComponents';

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

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

							<div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
								<p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
									Statut abonnement
								</p>
								<p className="font-semibold text-gray-900">
									{form.subscriptionStatus || 'N/A'}
								</p>
							</div>

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
