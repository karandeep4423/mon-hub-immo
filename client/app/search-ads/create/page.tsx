'use client';

import { CreateSearchAdForm } from '@/components/search-ads/CreateSearchAdForm';

const CreateSearchAdPage = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand/5 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<CreateSearchAdForm />
			</div>
		</div>
	);
};

export default CreateSearchAdPage;
