'use client';

import { Suspense } from 'react';
import { ChatPageContent } from './ChatPageContent';

const ChatPageRoute = () => {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen bg-gray-50">
					<div className="animate-pulse bg-gray-100 w-1/4 border-r"></div>
					<div className="animate-pulse bg-gray-100 flex-1"></div>
				</div>
			}
		>
			<ChatPageContent />
		</Suspense>
	);
};

export default ChatPageRoute;
