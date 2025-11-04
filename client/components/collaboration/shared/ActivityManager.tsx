import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { FormProvider } from '@/context/FormContext';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { logger } from '@/lib/utils/logger';
import { formatDateTimeShort } from '@/lib/utils/date';
import { Features, Components } from '@/lib/constants';

export interface Activity {
	id: string;
	type: 'note' | 'status_update' | 'visit' | 'document';
	title: string;
	content: string;
	author: {
		id: string;
		name: string;
		role: 'agent' | 'apporteur';
		profileImage?: string | null;
	};
	createdAt: string;
	metadata?: {
		oldStatus?: string;
		newStatus?: string;
		documentName?: string;
	};
}

interface ActivityManagerProps {
	collaborationId: string;
	activities: Activity[];
	canAddActivity: boolean;
	onAddActivity: (content: string, type?: Activity['type']) => Promise<void>;
	onRefresh?: () => void;
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({
	activities,
	canAddActivity,
	onAddActivity,
	onRefresh,
}) => {
	const [newNote, setNewNote] = useState('');
	const [isAdding, setIsAdding] = useState(false);
	const [showAddForm, setShowAddForm] = useState(false);

	// Helper function to get gradient color for notes
	const getNoteGradient = (userRole: string, noteIndex: number) => {
		// Warm gradients for agent (owner)
		const warmGradients = [
			'bg-gradient-to-br from-orange-50 to-amber-50',
			'bg-gradient-to-br from-red-50 to-pink-50',
			'bg-gradient-to-br from-yellow-50 to-orange-50',
			'bg-gradient-to-br from-pink-50 to-rose-50',
			'bg-gradient-to-br from-amber-50 to-yellow-50',
			'bg-gradient-to-br from-rose-50 to-orange-50',
		];

		// Cool gradients for apporteur (collaborator)
		const coolGradients = [
			'bg-gradient-to-br from-blue-50 to-cyan-50',
			'bg-gradient-to-br from-indigo-50 to-blue-50',
			'bg-gradient-to-br from-cyan-50 to-teal-50',
			'bg-gradient-to-br from-purple-50 to-indigo-50',
			'bg-gradient-to-br from-teal-50 to-emerald-50',
			'bg-gradient-to-br from-sky-50 to-blue-50',
		];

		// Determine if user is agent or apporteur
		const isAgentNote = userRole === 'agent';
		const gradients = isAgentNote ? warmGradients : coolGradients;

		// Use note index to select gradient (cycling through available gradients)
		return gradients[noteIndex % gradients.length];
	};

	const handleAddNote = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newNote.trim()) return;

		setIsAdding(true);
		try {
			await onAddActivity(newNote.trim(), 'note');
			setNewNote('');
			setShowAddForm(false);
			onRefresh?.();
		} catch (error) {
			logger.error('Error adding note:', error);
		} finally {
			setIsAdding(false);
		}
	};

	const getActivityIcon = (type: Activity['type']) => {
		switch (type) {
			case 'note':
				return '📝';
			case 'status_update':
				return '🔄';
			case 'visit':
				return '🏠';
			case 'document':
				return '📄';
			default:
				return '📝';
		}
	};

	const getActivityTitle = (activity: Activity) => {
		if (activity.type === 'status_update' && activity.metadata?.newStatus) {
			return `Statut mis à jour: ${activity.metadata.newStatus}`;
		}
		return activity.title;
	};

	return (
		<Card className="p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-medium text-gray-900">
					📋 Activités ({activities.length})
				</h3>
				<div className="flex items-center space-x-2">
					{canAddActivity && (
						<Button
							onClick={() => setShowAddForm(!showAddForm)}
							variant="primary"
							size="sm"
							className="flex items-center space-x-2"
						>
							<span>➕</span>
							<span>{Components.UI.BUTTON_TEXT.addActivity}</span>
						</Button>
					)}
				</div>
			</div>

			{/* Add Activity Form */}
			{showAddForm && canAddActivity && (
				<Card className="mb-6 border border-brand-200 bg-brand-50">
					<div className="p-1">
						<FormProvider
							isSubmitting={isAdding}
							onSubmit={handleAddNote}
							className="space-y-2"
						>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nouvelle note
								</label>
								<Textarea
									value={newNote}
									onChange={(e) => setNewNote(e.target.value)}
									placeholder={
										Features.Collaboration
											.COLLABORATION_FORM_PLACEHOLDERS
											.ACTIVITY_NOTE
									}
									rows={3}
									required
								/>
							</div>
							<div className="flex space-x-3">
								<Button
									type="button"
									onClick={() => {
										setShowAddForm(false);
										setNewNote('');
									}}
									variant="outline"
									size="sm"
									disabled={isAdding}
								>
									{Components.UI.BUTTON_TEXT.cancel}
								</Button>
								<Button
									type="submit"
									variant="primary"
									size="sm"
									loading={isAdding}
									disabled={!newNote.trim()}
								>
									{Components.UI.BUTTON_TEXT.add}
								</Button>
							</div>
						</FormProvider>
					</div>
				</Card>
			)}

			{/* Activities Timeline */}
			<div className="space-y-4">
				{activities.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<p>Aucune activité pour le moment</p>
						<p className="text-sm">
							Les mises à jour apparaîtront ici
						</p>
					</div>
				) : (
					activities.map((activity, activityIndex) => (
						<div
							key={activity.id}
							className={`flex items-start space-x-3 p-4 rounded-lg border border-transparent ${getNoteGradient(activity.author.role, activityIndex)}`}
						>
							<div className="flex-shrink-0">
								<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
									{getActivityIcon(activity.type)}
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-1">
									<h4 className="text-sm font-medium text-gray-900">
										{getActivityTitle(activity)}
									</h4>
									<time className="text-xs text-gray-500">
										{formatDateTimeShort(
											activity.createdAt,
										)}
									</time>
								</div>
								{activity.content && (
									<p className="text-sm text-gray-700 mb-3">
										{activity.content}
									</p>
								)}
								<div className="flex items-center space-x-2">
									<ProfileAvatar
										user={{
											_id: activity.author.id,
											firstName:
												activity.author.name.split(
													' ',
												)[0] || '',
											lastName:
												activity.author.name
													.split(' ')
													.slice(1)
													.join(' ') || '',
											profileImage:
												activity.author.profileImage ||
												undefined,
										}}
										size="xs"
									/>
									<div className="flex items-center space-x-1 text-xs text-gray-600">
										<span>{activity.author.name}</span>
										<span>•</span>
										<span className="capitalize">
											{activity.author.role === 'agent'
												? 'Agent propriétaire'
												: 'Agent apporteur'}
										</span>
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</Card>
	);
};
