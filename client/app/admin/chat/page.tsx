'use client';

import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { ChatApi } from '@/lib/api/chatApi';
import { useEffect, useState } from 'react';

export default function AdminChatPage() {
	const params = useSearchParams();
	const collaborationId = params.get('collaborationId') || '';
	const [participants, setParticipants] = useState<{ ownerId: string; collaboratorId: string } | null>(null);
	const [messages, setMessages] = useState<Array<{ _id: string; senderId: string; text?: string; createdAt: string }>>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const load = async () => {
			if (!collaborationId) return;
			setLoading(true);
			try {
				const conv = await ChatApi.getConversationByCollaboration(collaborationId);
				if (conv?.conversation?.ownerId && conv.conversation.collaboratorId) {
					setParticipants({ ownerId: conv.conversation.ownerId, collaboratorId: conv.conversation.collaboratorId });
					const msgs = await ChatApi.getMessagesBetween(conv.conversation.ownerId, conv.conversation.collaboratorId, 100);
					setMessages(msgs.messages || []);
				}
			} catch (e) {
				console.error('[AdminChatPage] load error', e);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [collaborationId]);

	return (
		<AdminLayout>
			<div className="space-y-4 sm:space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historique des échanges</h1>
					<p className="text-xs sm:text-sm text-gray-600">Collaboration: {collaborationId || '-'}</p>
				</div>

				<div className="bg-white rounded-lg border p-3 sm:p-4">
					{loading && <p className="text-sm text-gray-600">Chargement…</p>}
					{!loading && messages.length === 0 && (
						<p className="text-sm text-gray-600">Aucun message pour cette collaboration.</p>
					)}
					<ul className="space-y-2">
						{messages.map(m => (
							<li key={m._id} className="flex items-start gap-2">
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{m.senderId?.slice(-2)}</div>
								<div>
									<p className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString('fr-FR')}</p>
									<p className="text-sm text-gray-900">{m.text || ''}</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</AdminLayout>
	);
}
