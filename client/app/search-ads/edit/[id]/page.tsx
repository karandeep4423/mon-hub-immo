'use client';

import { EditSearchAdForm } from '@/components/search-ads/EditSearchAdForm';
import { useParams } from 'next/navigation';

const EditSearchAdPage = () => {
	const params = useParams();
	const id = params.id as string;

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<EditSearchAdForm id={id} />
			</div>
		</div>
	);
};

export default EditSearchAdPage;
