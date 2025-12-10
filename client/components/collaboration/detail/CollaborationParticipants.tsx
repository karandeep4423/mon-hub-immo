'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Collaboration } from '@/types/collaboration';

interface CollaborationParticipantsProps {
	collaboration: Collaboration;
}

export const CollaborationParticipants: React.FC<
	CollaborationParticipantsProps
> = ({ collaboration }) => {
	const owner =
		typeof collaboration.postOwnerId === 'object'
			? collaboration.postOwnerId
			: null;
	const collaborator =
		typeof collaboration.collaboratorId === 'object'
			? collaboration.collaboratorId
			: null;

	return (
		<Card className="p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				👥 Participants
			</h3>
			<div className="space-y-4">
				{/* Owner */}
				{owner && (
					<div className="flex items-center space-x-3">
						<ProfileAvatar
							user={{
								...owner,
								profileImage: owner.profileImage || undefined,
							}}
							size="md"
						/>
						<div className="flex-1 min-w-0">
							<p className="font-medium text-gray-900 truncate">
								{owner.firstName} {owner.lastName}
							</p>
							<p className="text-sm text-gray-600">
								Propriétaire
							</p>
						</div>
					</div>
				)}

				{/* Collaborator */}
				{collaborator && (
					<div className="flex items-center space-x-3">
						<ProfileAvatar
							user={{
								...collaborator,
								profileImage:
									collaborator.profileImage || undefined,
							}}
							size="md"
						/>
						<div className="flex-1 min-w-0">
							<p className="font-medium text-gray-900 truncate">
								{collaborator.firstName} {collaborator.lastName}
							</p>
							<p className="text-sm text-gray-600">
								Collaborateur
							</p>
						</div>
					</div>
				)}
			</div>
		</Card>
	);
};
