'use client';

import { ProfileCompletion } from '@/components/auth/ProfileCompletion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function EditProfilePage() {
	return (
		<ProtectedRoute>
			<ProfileCompletion editMode={true} />
		</ProtectedRoute>
	);
}
