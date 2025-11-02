import React from 'react';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import type { Property } from '@/lib/api/propertyApi';

interface ParticipantUser {
	_id: string;
	firstName: string;
	lastName: string;
	profileImage?: string | null;
}

interface CollaborationParticipantsProps {
	ownerUser: ParticipantUser;
	collaboratorUser: ParticipantUser;
	currentUserId: string;
	shortCollabId: string;
	property?: Property | null;
}

export const CollaborationParticipants: React.FC<
	CollaborationParticipantsProps
> = ({
	ownerUser,
	collaboratorUser,
	currentUserId,
	shortCollabId,
	property,
}) => {
	return (
		<div className="px-4 pb-4">
			<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
				<div className="flex items-center justify-between mb-3">
					<p className="text-sm font-medium text-gray-900">
						Intervenants
					</p>
					<span className="text-[10px] text-gray-500">
						ID {shortCollabId}
					</span>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{/* Owner */}
					<div className="flex items-center space-x-3">
						<ProfileAvatar
							user={{
								...ownerUser,
								profileImage:
									ownerUser.profileImage ?? undefined,
							}}
							size="sm"
							className="w-8 h-8"
						/>
						<div className="min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{ownerUser.firstName} {ownerUser.lastName}
								{ownerUser._id === currentUserId && (
									<span className="ml-1 text-[10px] text-brand">
										(Vous)
									</span>
								)}
							</p>
							<div className="flex items-center gap-2 text-xs text-gray-600">
								<span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
									Propriétaire
								</span>
								{property?.city && (
									<span className="truncate">
										📍 {property.city}
									</span>
								)}
							</div>
						</div>
					</div>
					{/* Collaborator */}
					<div className="flex items-center space-x-3">
						<ProfileAvatar
							user={{
								...collaboratorUser,
								profileImage:
									collaboratorUser.profileImage ?? undefined,
							}}
							size="sm"
							className="w-8 h-8"
						/>
						<div className="min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{collaboratorUser.firstName}{' '}
								{collaboratorUser.lastName}
								{collaboratorUser._id === currentUserId && (
									<span className="ml-1 text-[10px] text-brand">
										(Vous)
									</span>
								)}
							</p>
							<div className="flex items-center gap-2 text-xs text-gray-600">
								<span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
									Collaborateur
								</span>
								{property?.postalCode && (
									<span>📫 {property.postalCode}</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
