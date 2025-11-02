import React from 'react';
import type {
	Collaboration,
	CollaborationActivity,
} from '@/types/collaboration';
import type { Property } from '@/lib/api/propertyApi';
import { PROGRESS_STEPS_CONFIG } from './progress-tracking/types';
import { formatDateShort } from '@/lib/utils/date';
import { Features } from '@/lib/constants';
import { getCompletionReasonDetails } from './CompletionReasonModal';

interface CompensationInfo {
	type: string;
	value: string;
}

interface CollaborationDetailsProps {
	collaboration: Collaboration;
	isOwner: boolean;
	property?: Property | null;
	postPrice: number;
	compensationInfo: CompensationInfo;
	latestActivity?: CollaborationActivity;
	completedSteps: number;
	totalSteps: number;
	currentStepConfig: (typeof PROGRESS_STEPS_CONFIG)[keyof typeof PROGRESS_STEPS_CONFIG];
}

export const CollaborationDetails: React.FC<CollaborationDetailsProps> = ({
	collaboration,
	isOwner,
	property,
	postPrice,
	compensationInfo,
	latestActivity,
	completedSteps,
	totalSteps,
	currentStepConfig,
}) => {
	return (
		<>
			{/* Progress Tracking */}
			{collaboration.status ===
				Features.Collaboration.COLLABORATION_STATUS_VALUES.ACTIVE && (
				<div className="px-4 pb-4">
					<div className="bg-brand-50 rounded-lg p-3">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm font-medium text-gray-900">
								Étape actuelle
							</p>
							<span className="text-xs text-brand">
								{completedSteps}/{totalSteps} étapes
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<span className="text-lg">
								{currentStepConfig?.icon}
							</span>
							<div>
								<p className="text-sm font-medium text-brand-800">
									{currentStepConfig?.title}
								</p>
								<p className="text-xs text-brand">
									{currentStepConfig?.description}
								</p>
							</div>
						</div>
						{/* Progress bar */}
						<div className="mt-3">
							<div className="bg-blue-200 rounded-full h-2">
								<div
									className="bg-brand h-2 rounded-full transition-all duration-300"
									style={{
										width: `${(completedSteps / totalSteps) * 100}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Compensation & Status Details */}
			<div className="px-4 pb-4">
				<div className="bg-gray-50 rounded-lg p-3">
					<div className="flex items-center justify-between mb-2">
						<div className="w-full">
							<p className="text-sm font-medium text-gray-900 mb-2">
								{compensationInfo.type}
							</p>
							{collaboration.compensationType ===
								'gift_vouchers' ||
							collaboration.compensationType ===
								'fixed_amount' ? (
								<div className="text-center py-2">
									<p className="text-lg font-bold text-brand">
										{compensationInfo.value}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{collaboration.compensationType ===
										'gift_vouchers'
											? 'Chèques cadeaux pour le collaborateur'
											: 'Montant fixe pour le collaborateur'}
									</p>
								</div>
							) : (
								<div className="flex items-center space-x-4 mt-1">
									<div className="text-center flex-1">
										<p className="text-xs text-gray-500">
											Propriétaire
										</p>
										<p className="text-sm font-semibold text-gray-900">
											{isOwner
												? compensationInfo.value
												: `${100 - collaboration.proposedCommission}%`}
										</p>
									</div>
									<div className="text-center flex-1">
										<p className="text-xs text-gray-500">
											Collaborateur
										</p>
										<p className="text-sm font-semibold text-brand">
											{isOwner
												? `${collaboration.proposedCommission}%`
												: compensationInfo.value}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="mt-2">
						{collaboration.status ===
							Features.Collaboration.COLLABORATION_STATUS_VALUES
								.PENDING && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
								⏳ En attente
							</span>
						)}
						{collaboration.status ===
							Features.Collaboration.COLLABORATION_STATUS_VALUES
								.ACCEPTED && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
								✅ Acceptée
							</span>
						)}
						{collaboration.status ===
							Features.Collaboration.COLLABORATION_STATUS_VALUES
								.ACTIVE && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
								🔄 Active
							</span>
						)}
						{collaboration.status ===
							Features.Collaboration.COLLABORATION_STATUS_VALUES
								.REJECTED && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
								❌ Refusée
							</span>
						)}
						{collaboration.status ===
							Features.Collaboration.COLLABORATION_STATUS_VALUES
								.COMPLETED && (
							<>
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
									🎯 Finalisée
								</span>
								{/* Display completion reason if available */}
								{collaboration.completionReason &&
									(() => {
										const reasonDetails =
											getCompletionReasonDetails(
												collaboration.completionReason,
											);
										if (!reasonDetails) return null;
										return (
											<div
												className="mt-3 p-2 rounded-lg border"
												style={{
													backgroundColor:
														reasonDetails.color.includes(
															'green',
														)
															? '#f0fdf4'
															: reasonDetails.color.includes(
																		'red',
																  )
																? '#fef2f2'
																: reasonDetails.color.includes(
																			'blue',
																	  )
																	? '#eff6ff'
																	: '#f9fafb',
													borderColor:
														reasonDetails.color.includes(
															'green',
														)
															? '#bbf7d0'
															: reasonDetails.color.includes(
																		'red',
																  )
																? '#fecaca'
																: reasonDetails.color.includes(
																			'blue',
																	  )
																	? '#bfdbfe'
																	: '#e5e7eb',
												}}
											>
												<div className="flex items-center">
													<span className="text-sm mr-2">
														{reasonDetails.icon}
													</span>
													<span
														className={`text-xs font-medium ${
															reasonDetails.color.includes(
																'green',
															)
																? 'text-green-700'
																: reasonDetails.color.includes(
																			'red',
																	  )
																	? 'text-red-700'
																	: reasonDetails.color.includes(
																				'blue',
																		  )
																		? 'text-brand-700'
																		: 'text-gray-700'
														}`}
													>
														{reasonDetails.label}
													</span>
												</div>
											</div>
										);
									})()}
							</>
						)}
						{collaboration.status ===
							Features.Collaboration.COLLABORATION_STATUS_VALUES
								.CANCELLED && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								🚫 Annulée
							</span>
						)}
					</div>
					{property &&
						collaboration.compensationType === 'percentage' && (
							<p className="text-xs text-gray-600 mt-2">
								Estimation commission:{' '}
								{Math.round(
									(postPrice *
										(isOwner
											? 100 -
												collaboration.proposedCommission
											: collaboration.proposedCommission)) /
										100,
								).toLocaleString('fr-FR')}{' '}
								€
							</p>
						)}
				</div>
			</div>

			{/* Message Preview */}
			{collaboration.proposalMessage && (
				<div className="px-4 pb-4">
					<p className="text-sm text-gray-600 italic truncate">
						{collaboration.proposalMessage}
					</p>
				</div>
			)}

			{/* Latest Activity */}
			{latestActivity && (
				<div className="px-4 pb-4">
					<div className="bg-gray-50 rounded-lg p-3">
						<div className="flex items-start justify-between mb-1">
							<p className="text-sm font-medium text-gray-900">
								Dernière activité
							</p>
							<span className="text-xs text-gray-500">
								{formatDateShort(latestActivity.createdAt)}
							</span>
						</div>
						<div className="flex items-start space-x-2">
							<div className="flex-shrink-0 mt-1">
								{latestActivity.type === 'proposal' && '📋'}
								{latestActivity.type === 'acceptance' && '✅'}
								{latestActivity.type === 'rejection' && '❌'}
								{latestActivity.type === 'signing' && '📝'}
								{latestActivity.type === 'status_update' &&
									'🔄'}
								{latestActivity.type ===
									'progress_step_update' && '📈'}
								{latestActivity.type === 'note' && '💬'}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-gray-700">
									{latestActivity.message}
								</p>
								{collaboration.activities.length > 1 && (
									<p className="text-xs text-brand mt-1">
										+{collaboration.activities.length - 1}{' '}
										autres activités
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Timestamps & Contract Status */}
			<div className="px-4 pb-4">
				<div className="flex justify-between items-center text-xs text-gray-500">
					<div>
						<span>
							📅 Créée le{' '}
							{formatDateShort(collaboration.createdAt)}
						</span>
						{collaboration.status !== 'pending' && (
							<span className="ml-4">
								📝 Mise à jour le{' '}
								{formatDateShort(collaboration.updatedAt)}
							</span>
						)}
					</div>
					{(collaboration.ownerSigned ||
						collaboration.collaboratorSigned) && (
						<div className="flex items-center space-x-2">
							{collaboration.ownerSigned && (
								<span className="text-green-600">
									📝 Propriétaire signé
								</span>
							)}
							{collaboration.collaboratorSigned && (
								<span className="text-green-600">
									📝 Collaborateur signé
								</span>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	);
};
