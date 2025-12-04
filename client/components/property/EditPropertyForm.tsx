'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProperty } from '@/hooks/useProperties';
import { PropertyForm } from './PropertyForm';
import { PageLoader } from '../ui/LoadingSpinner';

interface EditPropertyFormProps {
	id: string;
	returnPath?: string;
}

export const EditPropertyForm: React.FC<EditPropertyFormProps> = ({
	id,
	returnPath,
}) => {
	const router = useRouter();
	const { data: property, isLoading } = useProperty(id);

	const initialData = useMemo(() => {
		if (!property) return undefined;
		return property;
	}, [property]);

	if (isLoading) {
		return <PageLoader message="Chargement de l'annonce..." />;
	}

	if (!property) {
		return (
			<div className="text-center py-12">
				<p className="text-red-500">
					Impossible de charger l&apos;annonce
				</p>
			</div>
		);
	}

	const handleSubmit = async () => {
		// PropertyForm handles the actual API call
		// After success, redirect
		if (returnPath) {
			router.push(returnPath);
		} else {
			router.back();
		}
	};

	const handleCancel = () => {
		if (returnPath) {
			router.push(returnPath);
		} else {
			router.back();
		}
	};

	return (
		<div className="w-full">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Modifier l&apos;annonce
				</h1>
				<p className="text-gray-600">
					Mettez à jour les informations de votre bien immobilier
				</p>
			</div>

			<PropertyForm
				onSubmit={handleSubmit}
				initialData={initialData}
				isEditing={true}
				onCancel={handleCancel}
			/>
		</div>
	);
};
