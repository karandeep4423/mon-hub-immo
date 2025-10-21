/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { collaborationApi } from '../../lib/api/collaborationApi';
import { toast } from 'react-toastify';
import type { Property } from '@/lib/api/propertyApi';

interface ProposeCollaborationModalProps {
	isOpen: boolean;
	onClose: () => void;
	propertyId: string;
	property: Pick<
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
	onSuccess?: () => void;
}

export const ProposeCollaborationModal: React.FC<
	ProposeCollaborationModalProps
> = ({ isOpen, onClose, propertyId, property, onSuccess }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		commissionPercentage: '',
		message: '',
		agreeToTerms: false,
	});
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			// Current user becomes the collaborator automatically
			await collaborationApi.propose({
				propertyId,
				commissionPercentage: parseFloat(formData.commissionPercentage),
				message: formData.message,
			});
			toast.success('Collaboration proposée avec succès');
			onSuccess?.();
			onClose();
			setFormData({
				commissionPercentage: '',
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

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Proposer une collaboration"
		>
			<div className="p-6 space-y-6">
				{/* Property Details Section */}
				<div className="bg-gray-50 rounded-lg p-4">
					<h3 className="text-lg font-medium text-gray-900 mb-3">
						Propriété à collaborer
					</h3>
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
				</div>

				<div className="text-sm text-gray-600">
					Proposez votre collaboration sur cette propriété. Définissez
					le pourcentage de commission que vous souhaitez recevoir.
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
							{error}
						</div>
					)}

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
							max="50"
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
							Entre 1% et 50% de la commission totale
						</div>
					</div>

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
								!formData.commissionPercentage ||
								!formData.agreeToTerms
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
