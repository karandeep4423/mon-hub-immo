// hooks/useCollaborationPermissions.ts
import { useMemo } from 'react';
import { Collaboration } from '@/types/collaboration';
import type { User } from '@/types/auth';

export const useCollaborationPermissions = (
	user: User | null,
	collaboration: Collaboration | null,
) => {
	return useMemo(() => {
		if (!user || !collaboration) {
			return {
				userId: null,
				isOwner: false,
				isCollaborator: false,
				canUpdate: false,
				isActive: false,
			};
		}

		const userId = user.id || user._id;
		const isOwner =
			userId &&
			(userId === collaboration.postOwnerId?._id ||
				userId === collaboration.postOwnerId);
		const isCollaborator =
			userId &&
			(userId === collaboration.collaboratorId?._id ||
				userId === collaboration.collaboratorId);
		const canUpdate = Boolean(isOwner || isCollaborator);
		const isActive = collaboration.status === 'active';

		return {
			userId,
			isOwner,
			isCollaborator,
			canUpdate,
			isActive,
		};
	}, [user, collaboration]);
};
