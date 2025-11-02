'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Collaboration } from '@/types/collaboration';

interface CollaborationTimelineProps {
	collaboration: Collaboration;
}

export const CollaborationTimeline: React.FC<CollaborationTimelineProps> = ({
	collaboration,
}) => {
	return (
		<Card className="p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				⏰ Chronologie
			</h3>
			<div className="space-y-3">
				<div>
					<span className="text-sm text-gray-600">Créée le:</span>
					<p className="font-medium">
						{new Date(collaboration.createdAt).toLocaleDateString(
							'fr-FR',
							{
								day: 'numeric',
								month: 'long',
								year: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							},
						)}
					</p>
				</div>
				<div>
					<span className="text-sm text-gray-600">
						Dernière mise à jour:
					</span>
					<p className="font-medium">
						{new Date(collaboration.updatedAt).toLocaleDateString(
							'fr-FR',
							{
								day: 'numeric',
								month: 'long',
								year: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							},
						)}
					</p>
				</div>
				<div>
					<span className="text-sm text-gray-600">
						Étape actuelle:
					</span>
					<p className="font-medium capitalize">
						{collaboration.currentProgressStep.replace('_', ' ')}
					</p>
				</div>
			</div>
		</Card>
	);
};
