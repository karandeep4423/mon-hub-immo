'use client';

import React from 'react';
import { Input, Select, NumberInput } from '@/components/ui';
import type { Property } from '@/lib/api/propertyApi';

interface ClientInfoFormProps {
	clientInfo: Property['clientInfo'];
	onChange: (clientInfo: Property['clientInfo']) => void;
	disabled?: boolean;
}

export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
	clientInfo = {},
	onChange,
	disabled = false,
}) => {
	const handleNestedChange = (
		section: 'commercialDetails' | 'propertyHistory' | 'ownerInfo',
		field: string,
		value: string | number | boolean,
	) => {
		onChange({
			...clientInfo,
			[section]: {
				...clientInfo[section],
				[field]: value,
			},
		});
	};

	return (
		<div className="space-y-8">
			{/* Section 1: Détails commerciaux utiles */}
			<div className="border border-gray-200 rounded-lg p-6 bg-white">
				<div className="flex items-center mb-4">
					<span className="text-2xl mr-2">💡</span>
					<h3 className="text-lg font-semibold text-gray-900">
						Détails commerciaux utiles
					</h3>
				</div>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Quels sont les points forts à mettre en avant selon
							le vendeur ?
						</label>
						<textarea
							value={
								clientInfo.commercialDetails?.strengths || ''
							}
							onChange={(e) =>
								handleNestedChange(
									'commercialDetails',
									'strengths',
									e.target.value,
								)
							}
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20"
							rows={3}
							placeholder="Lumière naturelle, proximité transports, rénovation récente..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Quels sont les points faibles connus (nuisance,
							travaux à prévoir, vis-à-vis, etc.)
						</label>
						<textarea
							value={
								clientInfo.commercialDetails?.weaknesses || ''
							}
							onChange={(e) =>
								handleNestedChange(
									'commercialDetails',
									'weaknesses',
									e.target.value,
								)
							}
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20"
							rows={3}
							placeholder="Travaux à prévoir, nuisances sonores..."
						/>
					</div>

					<Select
						label="Le bien est-il encore occupé ou déjà vide ?"
						value={
							clientInfo.commercialDetails?.occupancyStatus || ''
						}
						onChange={(value) =>
							handleNestedChange(
								'commercialDetails',
								'occupancyStatus',
								value,
							)
						}
						name="occupancyStatus"
						options={[
							{ value: '', label: 'Sélectionner...' },
							{ value: 'occupied', label: 'Occupé' },
							{ value: 'vacant', label: 'Vide' },
						]}
					/>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="openToLowerOffers"
							checked={
								clientInfo.commercialDetails
									?.openToLowerOffers || false
							}
							onChange={(e) =>
								handleNestedChange(
									'commercialDetails',
									'openToLowerOffers',
									e.target.checked,
								)
							}
							disabled={disabled}
							className="h-4 w-4 text-brand focus:ring-brand/20 border-gray-300 rounded"
						/>
						<label
							htmlFor="openToLowerOffers"
							className="text-sm font-medium text-gray-700"
						>
							Le propriétaire est-il ouvert à une offre &quot;coup
							de coeur&quot; même si elle est un peu en dessous du
							prix affiché ?
						</label>
					</div>
				</div>
			</div>

			{/* Section 2: Informations liées à l'historique du bien */}
			<div className="border border-gray-200 rounded-lg p-6 bg-white">
				<div className="flex items-center mb-4">
					<span className="text-2xl mr-2">📅</span>
					<h3 className="text-lg font-semibold text-gray-900">
						Informations liées à l&apos;historique du bien
					</h3>
				</div>

				<div className="space-y-4">
					<Input
						label="Date de mise en vente"
						type="text"
						value={clientInfo.propertyHistory?.listingDate || ''}
						onChange={(e) =>
							handleNestedChange(
								'propertyHistory',
								'listingDate',
								e.target.value,
							)
						}
						name="listingDate"
						placeholder="JJ/MM/AAAA"
						disabled={disabled}
					/>

					<Input
						label="Date de la dernière visite"
						type="text"
						value={clientInfo.propertyHistory?.lastVisitDate || ''}
						onChange={(e) =>
							handleNestedChange(
								'propertyHistory',
								'lastVisitDate',
								e.target.value,
							)
						}
						name="lastVisitDate"
						placeholder="JJ/MM/AAAA"
						disabled={disabled}
					/>

					<NumberInput
						label="Nombre total de visites déjà réalisées"
						value={clientInfo.propertyHistory?.totalVisits || 0}
						onChange={(value) =>
							handleNestedChange(
								'propertyHistory',
								'totalVisits',
								value ?? 0,
							)
						}
						name="totalVisits"
						placeholder="0"
						min={0}
					/>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Retour des précédents visiteurs (objections, freins
							éventuels)
						</label>
						<textarea
							value={
								clientInfo.propertyHistory?.visitorFeedback ||
								''
							}
							onChange={(e) =>
								handleNestedChange(
									'propertyHistory',
									'visitorFeedback',
									e.target.value,
								)
							}
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20"
							rows={3}
							placeholder="Retours des visiteurs précédents..."
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Historique des baisses de prix ou ajustements
						</label>
						<textarea
							value={
								clientInfo.propertyHistory?.priceReductions ||
								''
							}
							onChange={(e) =>
								handleNestedChange(
									'propertyHistory',
									'priceReductions',
									e.target.value,
								)
							}
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20"
							rows={3}
							placeholder="Historique des modifications de prix..."
						/>
					</div>
				</div>
			</div>

			{/* Section 3: Informations sur les propriétaires */}
			<div className="border border-gray-200 rounded-lg p-6 bg-white">
				<div className="flex items-center mb-4">
					<span className="text-2xl mr-2">🤝</span>
					<h3 className="text-lg font-semibold text-gray-900">
						Informations sur les propriétaires
					</h3>
				</div>

				<div className="space-y-4">
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="urgentToSell"
							checked={
								clientInfo.ownerInfo?.urgentToSell || false
							}
							onChange={(e) =>
								handleNestedChange(
									'ownerInfo',
									'urgentToSell',
									e.target.checked,
								)
							}
							disabled={disabled}
							className="h-4 w-4 text-brand focus:ring-brand/20 border-gray-300 rounded"
						/>
						<label
							htmlFor="urgentToSell"
							className="text-sm font-medium text-gray-700"
						>
							Sont-ils pressés de vendre ou non ?
						</label>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="openToNegotiation"
							checked={
								clientInfo.ownerInfo?.openToNegotiation || false
							}
							onChange={(e) =>
								handleNestedChange(
									'ownerInfo',
									'openToNegotiation',
									e.target.checked,
								)
							}
							disabled={disabled}
							className="h-4 w-4 text-brand focus:ring-brand/20 border-gray-300 rounded"
						/>
						<label
							htmlFor="openToNegotiation"
							className="text-sm font-medium text-gray-700"
						>
							Sont-ils ouverts à la négociation ? (et si oui, dans
							quelle mesure ?)
						</label>
					</div>

					<Select
						label="Y a-t-il un mandat exclusif, simple ou partagé ?"
						value={clientInfo.ownerInfo?.mandateType || ''}
						onChange={(value) =>
							handleNestedChange(
								'ownerInfo',
								'mandateType',
								value,
							)
						}
						name="mandateType"
						options={[
							{ value: '', label: 'Sélectionner...' },
							{ value: 'exclusive', label: 'Exclusif' },
							{ value: 'simple', label: 'Simple' },
							{ value: 'shared', label: 'Partagé' },
						]}
					/>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Raisons de la vente (personnelle, financière,
							succession, etc.)
						</label>
						<textarea
							value={clientInfo.ownerInfo?.saleReasons || ''}
							onChange={(e) =>
								handleNestedChange(
									'ownerInfo',
									'saleReasons',
									e.target.value,
								)
							}
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20"
							rows={3}
							placeholder="Raisons de la vente..."
						/>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="presentDuringVisits"
							checked={
								clientInfo.ownerInfo?.presentDuringVisits ||
								false
							}
							onChange={(e) =>
								handleNestedChange(
									'ownerInfo',
									'presentDuringVisits',
									e.target.checked,
								)
							}
							disabled={disabled}
							className="h-4 w-4 text-brand focus:ring-brand/20 border-gray-300 rounded"
						/>
						<label
							htmlFor="presentDuringVisits"
							className="text-sm font-medium text-gray-700"
						>
							Est-ce qu&apos;ils sont présents pendant les visites
							?
						</label>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="flexibleSchedule"
							checked={
								clientInfo.ownerInfo?.flexibleSchedule || false
							}
							onChange={(e) =>
								handleNestedChange(
									'ownerInfo',
									'flexibleSchedule',
									e.target.checked,
								)
							}
							disabled={disabled}
							className="h-4 w-4 text-brand focus:ring-brand/20 border-gray-300 rounded"
						/>
						<label
							htmlFor="flexibleSchedule"
							className="text-sm font-medium text-gray-700"
						>
							Sont-ils souples sur les horaires de visite ?
						</label>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="acceptConditionalOffers"
							checked={
								clientInfo.ownerInfo?.acceptConditionalOffers ||
								false
							}
							onChange={(e) =>
								handleNestedChange(
									'ownerInfo',
									'acceptConditionalOffers',
									e.target.checked,
								)
							}
							disabled={disabled}
							className="h-4 w-4 text-brand focus:ring-brand/20 border-gray-300 rounded"
						/>
						<label
							htmlFor="acceptConditionalOffers"
							className="text-sm font-medium text-gray-700"
						>
							Acceptent-ils les propositions d&apos;achat avec
							conditions (vente en cascade, financer un nouvel
							achat, etc.)
						</label>
					</div>
				</div>
			</div>
		</div>
	);
};
