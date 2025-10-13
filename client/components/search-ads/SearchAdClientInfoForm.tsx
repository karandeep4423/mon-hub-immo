'use client';

import React from 'react';
import { Input, Select } from '@/components/ui';
import type { SearchAd } from '@/types/searchAd';

interface SearchAdClientInfoFormProps {
	clientInfo: SearchAd['clientInfo'];
	onChange: (clientInfo: SearchAd['clientInfo']) => void;
	disabled?: boolean;
}

export const SearchAdClientInfoForm: React.FC<SearchAdClientInfoFormProps> = ({
	clientInfo = {},
	onChange,
	disabled = false,
}) => {
	const handleNestedChange = (
		section: 'qualificationInfo' | 'timelineInfo',
		field: string,
		value: string | boolean,
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
			{/* Section 1: Informations de qualification */}
			<div className="border border-gray-200 rounded-lg p-6 bg-white">
				<div className="flex items-center mb-4">
					<span className="text-2xl mr-2">👤</span>
					<h3 className="text-lg font-semibold text-gray-900">
						Informations de qualification
					</h3>
				</div>

				<div className="space-y-4">
					<Input
						label="Nom / Prénom"
						type="text"
						value={clientInfo.qualificationInfo?.clientName || ''}
						onChange={(e) =>
							handleNestedChange(
								'qualificationInfo',
								'clientName',
								e.target.value,
							)
						}
						name="clientName"
						placeholder="Nom et prénom du client"
						disabled={disabled}
					/>

					<Select
						label="Statut (particulier, investisseur, entreprise)"
						value={clientInfo.qualificationInfo?.clientStatus || ''}
						onChange={(value) =>
							handleNestedChange(
								'qualificationInfo',
								'clientStatus',
								value,
							)
						}
						name="clientStatus"
						options={[
							{ value: '', label: 'Sélectionner...' },
							{ value: 'particulier', label: 'Particulier' },
							{ value: 'investisseur', label: 'Investisseur' },
							{ value: 'entreprise', label: 'Entreprise' },
						]}
						disabled={disabled}
					/>

					<Input
						label="Profession / Situation professionnelle"
						type="text"
						value={clientInfo.qualificationInfo?.profession || ''}
						onChange={(e) =>
							handleNestedChange(
								'qualificationInfo',
								'profession',
								e.target.value,
							)
						}
						name="profession"
						placeholder="Profession du client"
						disabled={disabled}
					/>

					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							Projet réalisé en couple ou seul ?
						</label>
						<div className="flex items-center space-x-6">
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="projectType"
									value="couple"
									checked={
										clientInfo.qualificationInfo
											?.projectType === 'couple'
									}
									onChange={(e) =>
										handleNestedChange(
											'qualificationInfo',
											'projectType',
											e.target.value,
										)
									}
									disabled={disabled}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
								/>
								<span className="text-sm text-gray-700">
									Couple
								</span>
							</label>
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="projectType"
									value="seul"
									checked={
										clientInfo.qualificationInfo
											?.projectType === 'seul'
									}
									onChange={(e) =>
										handleNestedChange(
											'qualificationInfo',
											'projectType',
											e.target.value,
										)
									}
									disabled={disabled}
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
								/>
								<span className="text-sm text-gray-700">
									Seul
								</span>
							</label>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="hasRealEstateAgent"
							checked={
								clientInfo.qualificationInfo
									?.hasRealEstateAgent || false
							}
							onChange={(e) =>
								handleNestedChange(
									'qualificationInfo',
									'hasRealEstateAgent',
									e.target.checked,
								)
							}
							disabled={disabled}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label
							htmlFor="hasRealEstateAgent"
							className="text-sm font-medium text-gray-700"
						>
							Avez-vous déjà un agent immobilier ?
						</label>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="hasVisitedProperties"
							checked={
								clientInfo.qualificationInfo
									?.hasVisitedProperties || false
							}
							onChange={(e) =>
								handleNestedChange(
									'qualificationInfo',
									'hasVisitedProperties',
									e.target.checked,
								)
							}
							disabled={disabled}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
						/>
						<label
							htmlFor="hasVisitedProperties"
							className="text-sm font-medium text-gray-700"
						>
							Avez-vous déjà visité des biens ?
						</label>
					</div>
				</div>
			</div>

			{/* Section 2: Délai et disponibilité */}
			<div className="border border-gray-200 rounded-lg p-6 bg-white">
				<div className="flex items-center mb-4">
					<span className="text-2xl mr-2">⏰</span>
					<h3 className="text-lg font-semibold text-gray-900">
						Délai et disponibilité
					</h3>
				</div>

				<div className="space-y-4">
					<Select
						label="Urgence du projet ? (immédiat / 3 mois / 6 mois / pas pressé)"
						value={clientInfo.timelineInfo?.urgency || ''}
						onChange={(value) =>
							handleNestedChange('timelineInfo', 'urgency', value)
						}
						name="urgency"
						options={[
							{ value: '', label: 'Sélectionner...' },
							{ value: 'immediat', label: 'Immédiat' },
							{ value: '3_mois', label: '3 mois' },
							{ value: '6_mois', label: '6 mois' },
							{ value: 'pas_presse', label: 'Pas pressé' },
						]}
						disabled={disabled}
					/>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Disponibilités pour les visites ?
						</label>
						<textarea
							value={
								clientInfo.timelineInfo?.visitAvailability || ''
							}
							onChange={(e) =>
								handleNestedChange(
									'timelineInfo',
									'visitAvailability',
									e.target.value,
								)
							}
							disabled={disabled}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							rows={3}
							placeholder="Ex: En semaine après 18h, le samedi toute la journée..."
						/>
					</div>

					<Input
						label="Date idéale d'emménagement ?"
						type="text"
						value={clientInfo.timelineInfo?.idealMoveInDate || ''}
						onChange={(e) =>
							handleNestedChange(
								'timelineInfo',
								'idealMoveInDate',
								e.target.value,
							)
						}
						name="idealMoveInDate"
						placeholder="MM/YYYY"
						disabled={disabled}
					/>
				</div>
			</div>
		</div>
	);
};
