'use client';

import React from 'react';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui/CustomSelect';
import type { SearchAd } from '@/types/searchAd';
import { Features } from '@/lib/constants';

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
						placeholder={
							Features.SearchAds.SEARCH_AD_PLACEHOLDERS
								.CLIENT_NAME
						}
						disabled={disabled}
					/>{' '}
					<Select
						label="Statut (particulier, investisseur, entreprise)"
						value={clientInfo.qualificationInfo?.clientStatus || ''}
						onChange={(value: string) =>
							handleNestedChange(
								'qualificationInfo',
								'clientStatus',
								value,
							)
						}
						options={[
							{ value: 'particulier', label: 'Particulier' },
							{ value: 'investisseur', label: 'Investisseur' },
							{ value: 'entreprise', label: 'Entreprise' },
						]}
						placeholder="Sélectionner..."
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
						placeholder={
							Features.SearchAds.SEARCH_AD_PLACEHOLDERS.PROFESSION
						}
						disabled={disabled}
					/>{' '}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">
							Projet réalisé en couple ou seul ?
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{/* En couple */}
							<label
								className={`
									relative overflow-hidden rounded-xl cursor-pointer h-full
									transition-all duration-300 ease-in-out
									${
										clientInfo.qualificationInfo
											?.projectType === 'couple'
											? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
											: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
									}
								`}
							>
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
									className="sr-only"
								/>
								<div
									className={`
									bg-gradient-to-br ${clientInfo.qualificationInfo?.projectType === 'couple' ? 'from-pink-50 to-rose-50' : 'from-gray-50 to-slate-50'}
									p-3 sm:p-4 transition-all duration-300 h-full
									${clientInfo.qualificationInfo?.projectType === 'couple' ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
								`}
								>
									<div className="flex items-center gap-2 h-full">
										<div className="text-xl sm:text-2xl">
											👫
										</div>
										<span
											className={`text-sm font-medium transition-colors duration-300 ${clientInfo.qualificationInfo?.projectType === 'couple' ? 'text-brand' : 'text-gray-700'}`}
										>
											Couple
										</span>
										{clientInfo.qualificationInfo
											?.projectType === 'couple' && (
											<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
												✓
											</div>
										)}
									</div>
								</div>
							</label>

							{/* Seul */}
							<label
								className={`
									relative overflow-hidden rounded-xl cursor-pointer h-full
									transition-all duration-300 ease-in-out
									${
										clientInfo.qualificationInfo
											?.projectType === 'seul'
											? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
											: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
									}
								`}
							>
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
									className="sr-only"
								/>
								<div
									className={`
									bg-gradient-to-br ${clientInfo.qualificationInfo?.projectType === 'seul' ? 'from-amber-50 to-yellow-50' : 'from-gray-50 to-slate-50'}
									p-3 sm:p-4 transition-all duration-300 h-full
									${clientInfo.qualificationInfo?.projectType === 'seul' ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
								`}
								>
									<div className="flex items-center gap-2 h-full">
										<div className="text-xl sm:text-2xl">
											👤
										</div>
										<span
											className={`text-sm font-medium transition-colors duration-300 ${clientInfo.qualificationInfo?.projectType === 'seul' ? 'text-brand' : 'text-gray-700'}`}
										>
											Seul
										</span>
										{clientInfo.qualificationInfo
											?.projectType === 'seul' && (
											<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
												✓
											</div>
										)}
									</div>
								</div>
							</label>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{/* Déjà un agent immobilier ? */}
						<label
							className={`
								relative overflow-hidden rounded-xl cursor-pointer h-full
								transition-all duration-300 ease-in-out
								${
									clientInfo.qualificationInfo
										?.hasRealEstateAgent
										? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
										: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
								}
							`}
						>
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
								className="sr-only"
							/>
							<div
								className={`
								bg-gradient-to-br ${clientInfo.qualificationInfo?.hasRealEstateAgent ? 'from-indigo-50 to-blue-50' : 'from-gray-50 to-slate-50'}
								p-3 sm:p-4 transition-all duration-300 h-full
								${clientInfo.qualificationInfo?.hasRealEstateAgent ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
							`}
							>
								<div className="flex items-center gap-2 h-full">
									<div className="text-xl sm:text-2xl">
										🧑‍💼
									</div>
									<span
										className={`text-sm font-medium transition-colors duration-300 ${clientInfo.qualificationInfo?.hasRealEstateAgent ? 'text-brand' : 'text-gray-700'}`}
									>
										Avez-vous déjà un agent immobilier ?
									</span>
									{clientInfo.qualificationInfo
										?.hasRealEstateAgent && (
										<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
											✓
										</div>
									)}
								</div>
							</div>
						</label>

						{/* Déjà visité des biens ? */}
						<label
							className={`
								relative overflow-hidden rounded-xl cursor-pointer h-full
								transition-all duration-300 ease-in-out
								${
									clientInfo.qualificationInfo
										?.hasVisitedProperties
										? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
										: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
								}
							`}
						>
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
								className="sr-only"
							/>
							<div
								className={`
								bg-gradient-to-br ${clientInfo.qualificationInfo?.hasVisitedProperties ? 'from-green-50 to-emerald-50' : 'from-gray-50 to-slate-50'}
								p-3 sm:p-4 transition-all duration-300 h-full
								${clientInfo.qualificationInfo?.hasVisitedProperties ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
							`}
							>
								<div className="flex items-center gap-2 h-full">
									<div className="text-xl sm:text-2xl">
										🔎
									</div>
									<span
										className={`text-sm font-medium transition-colors duration-300 ${clientInfo.qualificationInfo?.hasVisitedProperties ? 'text-brand' : 'text-gray-700'}`}
									>
										Avez-vous déjà visité des biens ?
									</span>
									{clientInfo.qualificationInfo
										?.hasVisitedProperties && (
										<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
											✓
										</div>
									)}
								</div>
							</div>
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
						onChange={(value: string) =>
							handleNestedChange('timelineInfo', 'urgency', value)
						}
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
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20"
							rows={3}
							placeholder={
								Features.SearchAds.SEARCH_AD_PLACEHOLDERS
									.AVAILABILITY_PREFERENCE
							}
						/>
					</div>{' '}
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
