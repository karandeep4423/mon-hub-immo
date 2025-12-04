'use client';

import { EditPropertyForm } from '@/components/property';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useParams, useSearchParams } from 'next/navigation';

const EditPropertyPage = () => {
	const params = useParams();
	const searchParams = useSearchParams();
	const id = params.id as string;
	const returnPath = searchParams.get('returnPath') || undefined;

	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<EditPropertyForm id={id} returnPath={returnPath} />
				</div>
			</div>
		</ProtectedRoute>
	);
};

export default EditPropertyPage;
