'use client';

import { useRouter } from 'next/navigation';
import {
	useSearchAdForm,
	type SearchAdFormData,
} from '@/hooks/useSearchAdForm';
import { SearchAdClientInfoForm } from './SearchAdClientInfoForm';
import {
	BasicInfoSection,
	PropertyCriteriaSection,
	LocationSection,
	BudgetSection,
	PropertyDetailsSection,
	PrioritiesSection,
	BadgesSection,
} from './form-sections';
import { Button } from '../ui/Button';
import { Features, Components } from '@/lib/constants';
import { Select } from '@/components/ui/Select';

export const CreateSearchAdForm = () => {
	const router = useRouter();
	const {
		values,
		isSubmitting,
		setFieldValue,
		handleSubmit,
		handleArrayChange,
		errors,
	} = useSearchAdForm('create');

	return (
		<div className="w-full">
			<div className="mb-10 text-center relative">
				<div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-brand/10 to-brand/5 blur-3xl -z-10" />
				<h1 className="text-4xl font-bold bg-gradient-to-r from-brand to-brand/70 bg-clip-text  mb-3">
					Créer une annonce de recherche
				</h1>
				<p className="text-gray-600 text-lg">
					Décrivez les critères de recherche de votre client pour
					trouver le bien idéal
				</p>
			</div>

			<form onSubmit={handleSubmit} className="w-full space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-2  gap-6">
					{/* Basic Information */}
					<BasicInfoSection
						title={values.title}
						description={values.description}
						onTitleChange={(value) => setFieldValue('title', value)}
						onDescriptionChange={(value) =>
							setFieldValue('description', value)
						}
						errors={errors}
					/>

					{/* Property Search Criteria */}
					<PropertyCriteriaSection
						propertyTypes={values.propertyTypes}
						propertyState={values.propertyState}
						projectType={values.projectType}
						onPropertyTypesChange={(type, checked) =>
							handleArrayChange(type, checked, 'propertyTypes')
						}
						onPropertyStateChange={(state, checked) =>
							handleArrayChange(state, checked, 'propertyState')
						}
						onProjectTypeChange={(value) =>
							setFieldValue('projectType', value)
						}
						errors={errors}
					/>

					{/* Location */}
					<LocationSection
						cities={values.cities}
						maxDistance={values.maxDistance}
						openToOtherAreas={values.openToOtherAreas}
						onCitiesChange={(value) =>
							setFieldValue('cities', value)
						}
						onMaxDistanceChange={(value) =>
							setFieldValue('maxDistance', value)
						}
						onOpenToOtherAreasChange={(checked) =>
							setFieldValue('openToOtherAreas', checked)
						}
					/>

					{/* Budget & Financing */}
					<BudgetSection
						budgetMax={values.budgetMax}
						budgetIdeal={values.budgetIdeal}
						financingType={values.financingType}
						isSaleInProgress={values.isSaleInProgress}
						hasBankApproval={values.hasBankApproval}
						onBudgetMaxChange={(value) =>
							setFieldValue('budgetMax', value)
						}
						onBudgetIdealChange={(value) =>
							setFieldValue('budgetIdeal', value)
						}
						onFinancingTypeChange={(value) =>
							setFieldValue('financingType', value)
						}
						onSaleInProgressChange={(value) =>
							setFieldValue('isSaleInProgress', value)
						}
						onBankApprovalChange={(value) =>
							setFieldValue('hasBankApproval', value)
						}
					/>

					{/* Property Characteristics */}
					<PropertyDetailsSection
						minRooms={values.minRooms}
						minBedrooms={values.minBedrooms}
						minSurface={values.minSurface}
						hasExterior={values.hasExterior}
						hasParking={values.hasParking}
						acceptedFloors={values.acceptedFloors}
						desiredState={values.desiredState}
						onMinRoomsChange={(value) =>
							setFieldValue('minRooms', value)
						}
						onMinBedroomsChange={(value) =>
							setFieldValue('minBedrooms', value)
						}
						onMinSurfaceChange={(value) =>
							setFieldValue('minSurface', value)
						}
						onHasExteriorChange={(value) =>
							setFieldValue('hasExterior', value)
						}
						onHasParkingChange={(value) =>
							setFieldValue('hasParking', value)
						}
						onAcceptedFloorsChange={(value) =>
							setFieldValue('acceptedFloors', value)
						}
						onDesiredStateChange={(state, checked) =>
							handleArrayChange(state, checked, 'desiredState')
						}
					/>

					{/* Personal Priorities */}
					<PrioritiesSection
						mustHaves={values.mustHaves}
						niceToHaves={values.niceToHaves}
						dealBreakers={values.dealBreakers}
						onMustHavesChange={(priority, checked) =>
							handleArrayChange(priority, checked, 'mustHaves')
						}
						onNiceToHavesChange={(priority, checked) =>
							handleArrayChange(priority, checked, 'niceToHaves')
						}
						onDealBreakersChange={(priority, checked) =>
							handleArrayChange(priority, checked, 'dealBreakers')
						}
					/>
				</div>
				{/* Badges Section - Full width */}
				<BadgesSection
					badges={values.badges}
					onBadgesChange={(badge, checked) =>
						handleArrayChange(badge, checked, 'badges')
					}
				/>
				{/* Client Information - Full width */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<div className="mb-4">
						<h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
							🔒 Informations sur le client
						</h3>
						<p className="text-sm text-gray-600">
							Ces informations sont confidentielles et ne seront
							visibles que par vous lors de la gestion de cette
							recherche.
						</p>
					</div>
					<SearchAdClientInfoForm
						clientInfo={values.clientInfo || {}}
						onChange={(clientInfo) =>
							setFieldValue('clientInfo', clientInfo)
						}
					/>
				</div>{' '}
				{/* Status Field and Actions */}
				<div className="bg-white p-6 rounded-lg shadow-sm border">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
						{/* Status Section */}
						<div>
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Statut de publication
							</h3>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Statut de la recherche
								</label>
								<Select
									value={values.status}
									onChange={(value) =>
										setFieldValue(
											'status',
											e.target
												.value as SearchAdFormData['status'],
										)
									}
									options={[
										{ value: 'active', label: 'Actif' },
										{ value: 'paused', label: 'En pause' },
										{
											value: 'fulfilled',
											label: 'Réalisé',
										},
										{ value: 'sold', label: 'Vendu' },
										{ value: 'rented', label: 'Loué' },
										{ value: 'archived', label: 'Archivé' },
									]}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Changez le statut pour mettre à jour la
									visibilité de votre recherche.
								</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
							<Button
								type="button"
								onClick={() =>
									router.push(
										Features.Dashboard.DASHBOARD_ROUTES
											.BASE,
									)
								}
								variant="outline"
								className="order-2 sm:order-1"
							>
								{Components.UI.BUTTON_TEXT.cancel}
							</Button>
							<Button
								type="submit"
								loading={isSubmitting}
								className="order-1 sm:order-2"
							>
								Créer l&apos;annonce
							</Button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};
