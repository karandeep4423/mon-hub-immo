import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

export interface Activity {
	id: string;
	type: 'note' | 'status_update' | 'visit' | 'document';
	title: string;
	content: string;
	author: {
		id: string;
		name: string;
		role: 'agent' | 'apporteur';
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
			console.error('Error adding note:', error);
		} finally {
			setIsAdding(false);
		}
	};

	const formatActivityTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
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
							<span>Ajouter une activité</span>
						</Button>
					)}
				</div>
			</div>

			{/* Add Activity Form */}
			{showAddForm && canAddActivity && (
				<Card className="mb-6 border border-cyan-200 bg-cyan-50">
					<div className="p-4">
						<form onSubmit={handleAddNote} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Nouvelle note
								</label>
								<textarea
									value={newNote}
									onChange={(e) => setNewNote(e.target.value)}
									placeholder="Ajouter une note sur cette collaboration..."
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
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
									Annuler
								</Button>
								<Button
									type="submit"
									variant="primary"
									size="sm"
									disabled={isAdding || !newNote.trim()}
								>
									{isAdding ? 'Ajout...' : 'Ajouter'}
								</Button>
							</div>
						</form>
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
					activities.map((activity) => (
						<div
							key={activity.id}
							className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
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
										{formatActivityTime(activity.createdAt)}
									</time>
								</div>
								<p className="text-sm text-gray-700 mb-2">
									{activity.content}
								</p>
								<div className="flex items-center space-x-2 text-xs text-gray-500">
									<span>Par {activity.author.name}</span>
									<span className="capitalize">
										({activity.author.role})
									</span>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</Card>
	);
};
