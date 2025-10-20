/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { collaborationApi } from '../../lib/api/collaborationApi';
import { toast } from 'react-toastify';
import type { Property } from '@/lib/api/propertyApi';
import type { SearchAd } from '@/types/searchAd';

type PostData =
	| {
			type: 'property';
			id: string;
			ownerUserType: 'agent' | 'apporteur';
			data: Pick<
				Property,
				| '_id'
				| 'title'
				| 'price'
				| 'city'
				| 'postalCode'
				| 'propertyType'
				| 'surface'
				| 'rooms'
				| 'mainImage'
			>;
	  }
	| {
			type: 'searchAd';
			id: string;
			ownerUserType: 'agent' | 'apporteur';
			data: Pick<
				SearchAd,
				| '_id'
				| 'title'
				| 'description'
				| 'location'
				| 'budget'
				| 'propertyTypes'
				| 'authorType'
			>;
	  };

interface ProposeCollaborationModalProps {
	isOpen: boolean;
	onClose: () => void;
	post: PostData;
	onSuccess?: () => void;
}

export const ProposeCollaborationModal: React.FC<
	ProposeCollaborationModalProps
> = ({ isOpen, onClose, post, onSuccess }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		commissionPercentage: '',
		compensationType: 'percentage' as
			| 'percentage'
			| 'fixed_amount'
			| 'gift_vouchers',
		compensationAmount: '',
		message: '',
		agreeToTerms: false,
	});
	const [error, setError] = useState<string | null>(null);

	// Check if post owner is apporteur
	const isApporteurPost = post.ownerUserType === 'apporteur';

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			// Validate for apporteur posts
			if (isApporteurPost) {
				if (formData.compensationType === 'percentage') {
					const percentage = parseFloat(
						formData.commissionPercentage,
					);
					if (percentage >= 50) {
						throw new Error(
							"Le pourcentage de commission doit être inférieur à 50% pour les posts d'apporteur",
						);
					}
				} else if (!formData.compensationAmount) {
					throw new Error(
						'Veuillez saisir un montant de compensation',
					);
				}
			}

			// Build request payload
			const payload: {
				propertyId?: string;
				searchAdId?: string;
				commissionPercentage?: number;
				message: string;
				compensationType?:
					| 'percentage'
					| 'fixed_amount'
					| 'gift_vouchers';
				compensationAmount?: number;
			} = {
				...(post.type === 'property'
					? { propertyId: post.id }
					: { searchAdId: post.id }),
				message: formData.message,
			};

			// Add commission percentage for percentage type or non-apporteur posts
			if (
				!isApporteurPost ||
				formData.compensationType === 'percentage'
			) {
				payload.commissionPercentage = parseFloat(
					formData.commissionPercentage,
				);
			} else {
				// For non-percentage compensation on apporteur posts, set a nominal value
				payload.commissionPercentage = 0;
			}

			// Add compensation fields for apporteur posts
			if (isApporteurPost) {
				payload.compensationType = formData.compensationType;
				if (formData.compensationType !== 'percentage') {
					payload.compensationAmount = parseFloat(
						formData.compensationAmount,
					);
				}
			}

			await collaborationApi.propose(payload);
			toast.success('Collaboration proposée avec succès');
			onSuccess?.();
			onClose();
			setFormData({
				commissionPercentage: '',
				compensationType: 'percentage',
				compensationAmount: '',
				message: '',
				agreeToTerms: false,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: 'Erreur lors de la proposition de collaboration';
			setError(message);
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const renderPostDetails = () => {
		if (post.type === 'property') {
			const property = post.data;
			return (
				<div className="flex space-x-4">
					{property.mainImage && (
						<div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
							<img
								src={
									typeof property.mainImage === 'string'
										? property.mainImage
										: property.mainImage.url
								}
								alt={property.title}
								width={80}
								height={80}
								className="w-full h-full object-cover"
							/>
						</div>
					)}
					<div className="flex-1">
						<h4 className="font-medium text-gray-900 mb-1">
							{property.title}
						</h4>
						<p className="text-sm text-gray-600 mb-1">
							{property.city}
							{property.postalCode
								? `, ${property.postalCode}`
								: ''}
						</p>
						<div className="flex items-center space-x-4 text-sm text-gray-500">
							<span>{property.propertyType}</span>
							<span>{property.surface}m²</span>
							<span>{property.rooms} pièces</span>
						</div>
						<p className="text-lg font-bold text-brand-600 mt-2">
							{property.price.toLocaleString()}€
						</p>
					</div>
				</div>
			);
		} else {
			const searchAd = post.data;
			return (
				<div className="space-y-2">
					<h4 className="font-medium text-gray-900">
						{searchAd.title}
					</h4>
					<p className="text-sm text-gray-600 line-clamp-2">
						{searchAd.description}
					</p>
					<div className="flex flex-wrap gap-2 text-sm text-gray-500">
						<span>📍 {searchAd.location.cities.join(', ')}</span>
						<span>
							💰 Budget max:{' '}
							{searchAd.budget.max.toLocaleString()}€
						</span>
					</div>
					<div className="flex items-center gap-2 text-xs">
						{searchAd.propertyTypes.map((type) => (
							<span
								key={type}
								className="px-2 py-1 bg-gray-100 rounded-full"
							>
								{type}
							</span>
						))}
					</div>
				</div>
			);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Proposer une collaboration"
		>
			<div className="p-6 space-y-6">
				{/* Post Details Section */}
				<div className="bg-gray-50 rounded-lg p-4">
					<h3 className="text-lg font-medium text-gray-900 mb-3">
						{post.type === 'property'
							? 'Propriété à collaborer'
							: 'Annonce de recherche à collaborer'}
					</h3>
					{renderPostDetails()}
				</div>

				<div className="text-sm text-gray-600">
					Proposez votre collaboration sur{' '}
					{post.type === 'property'
						? 'cette propriété'
						: 'cette annonce de recherche'}
					.{' '}
					{isApporteurPost
						? "Choisissez votre mode de compensation pour l'apporteur d'affaire."
						: 'Définissez le pourcentage de commission que vous souhaitez recevoir.'}
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
							{error}
						</div>
					)}

					{/* Compensation Type Selection for Apporteur Posts */}
					{isApporteurPost && (
						<div className="space-y-3">
							<label className="block text-sm font-medium text-gray-700">
								Type de compensation pour l&apos;apporteur
								d&apos;affaire
							</label>
							<div className="space-y-2">
								<label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										name="compensationType"
										value="percentage"
										checked={
											formData.compensationType ===
											'percentage'
										}
										onChange={(e) =>
											handleInputChange(
												'compensationType',
												e.target.value,
											)
										}
										className="text-cyan-600 focus:ring-cyan-500"
									/>
									<span className="flex-1 text-sm text-gray-700">
										Pourcentage de commission (&lt; 50%)
									</span>
								</label>
								<label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										name="compensationType"
										value="fixed_amount"
										checked={
											formData.compensationType ===
											'fixed_amount'
										}
										onChange={(e) =>
											handleInputChange(
												'compensationType',
												e.target.value,
											)
										}
										className="text-cyan-600 focus:ring-cyan-500"
									/>
									<span className="flex-1 text-sm text-gray-700">
										Montant fixe en euros (€)
									</span>
								</label>
								<label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										name="compensationType"
										value="gift_vouchers"
										checked={
											formData.compensationType ===
											'gift_vouchers'
										}
										onChange={(e) =>
											handleInputChange(
												'compensationType',
												e.target.value,
											)
										}
										className="text-cyan-600 focus:ring-cyan-500"
									/>
									<span className="flex-1 text-sm text-gray-700">
										Chèques cadeaux
									</span>
								</label>
							</div>
						</div>
					)}

					{/* Percentage Commission Field */}
					{(!isApporteurPost ||
						formData.compensationType === 'percentage') && (
						<div>
							<label
								htmlFor="commissionPercentage"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Pourcentage de commission (%)
							</label>
							<Input
								id="commissionPercentage"
								type="number"
								min="1"
								max={isApporteurPost ? '49' : '50'}
								step="0.1"
								value={formData.commissionPercentage}
								onChange={(e) =>
									handleInputChange(
										'commissionPercentage',
										e.target.value,
									)
								}
								placeholder="25"
								required
							/>
							<div className="text-xs text-gray-500 mt-1">
								{isApporteurPost
									? "Maximum 49% pour les posts d'apporteur"
									: 'Entre 1% et 50% de la commission totale'}
							</div>
						</div>
					)}

					{/* Compensation Amount Field for Apporteur Posts */}
					{isApporteurPost &&
						formData.compensationType !== 'percentage' && (
							<div>
								<label
									htmlFor="compensationAmount"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									{formData.compensationType ===
									'fixed_amount'
										? 'Montant en euros (€)'
										: 'Nombre de chèques cadeaux'}
								</label>
								<Input
									id="compensationAmount"
									type="number"
									min="1"
									step={
										formData.compensationType ===
										'fixed_amount'
											? '0.01'
											: '1'
									}
									value={formData.compensationAmount}
									onChange={(e) =>
										handleInputChange(
											'compensationAmount',
											e.target.value,
										)
									}
									placeholder={
										formData.compensationType ===
										'fixed_amount'
											? '500'
											: '2'
									}
									required
								/>
								<div className="text-xs text-gray-500 mt-1">
									{formData.compensationType ===
									'fixed_amount'
										? 'Montant fixe en euros'
										: 'Nombre de chèques cadeaux à offrir'}
								</div>
							</div>
						)}

					<div>
						<label
							htmlFor="message"
							className="block text-sm font-medium text-gray-700 mb-2"
						>
							Message (optionnel)
						</label>
						<textarea
							id="message"
							rows={4}
							value={formData.message}
							onChange={(e) =>
								handleInputChange('message', e.target.value)
							}
							placeholder="Expliquez pourquoi cette collaboration serait bénéfique..."
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
							maxLength={500}
						/>
						<div className="text-xs text-gray-500 mt-1">
							{formData.message.length}/500 caractères
						</div>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<label className="flex items-start space-x-3 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.agreeToTerms}
								onChange={(e) =>
									handleInputChange(
										'agreeToTerms',
										e.target.checked,
									)
								}
								className="mt-1 rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-offset-0 focus:ring-cyan-200 focus:ring-opacity-50"
							/>
							<span className="text-sm text-gray-700 leading-relaxed">
								Je contribue à une collaboration saine et
								équitable entre membres de MonHubimmo. En cas de
								non-respect, mon accès pourra être suspendu sans
								remboursement.
							</span>
						</label>
					</div>

					<div className="flex justify-end space-x-3 pt-4">
						<Button
							type="button"
							variant="secondary"
							onClick={onClose}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							disabled={
								isLoading ||
								!formData.agreeToTerms ||
								(isApporteurPost &&
								formData.compensationType !== 'percentage'
									? !formData.compensationAmount
									: !formData.commissionPercentage)
							}
						>
							{isLoading
								? 'Envoi...'
								: 'Proposer la collaboration'}
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
};
