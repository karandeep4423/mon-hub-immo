'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { ChatApi } from '@/lib/api/chatApi';
import { useEffect, useState } from 'react';
import type { ChatMessage } from '@/types/chat';

export default function AdminChatPage() {
	const params = useSearchParams();
	const collaborationId = params.get('collaborationId') || '';
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [userMap, setUserMap] = useState<Record<string, { firstName?: string; lastName?: string; avatarUrl?: string }>>({});

	useEffect(() => {
		const load = async () => {
			if (!collaborationId) return;
			setLoading(true);
			try {
				const conv = await ChatApi.getConversationByCollaboration(collaborationId);
				if (conv?.conversation?.ownerId && conv.conversation.collaboratorId) {
					const ownerId = conv.conversation.ownerId;
					const collaboratorId = conv.conversation.collaboratorId;
					// Fetch messages
					const msgs = await ChatApi.getMessagesBetween(ownerId, collaboratorId, 100);
					const allMessages = msgs.messages || [];
					setMessages(allMessages);
					// Collect unique sender IDs (include owner & collaborator explicitly)
					const uniqueIds = Array.from(new Set([
						ownerId,
						collaboratorId,
						...allMessages.map(m => m.senderId),
					]));
					// Fetch user details for every unique id (parallel)
					try {
						const users = await Promise.all(uniqueIds.map(id => ChatApi.getUserById(id)));
						setUserMap(prev => {
							const next = { ...prev };
							users.forEach((u, idx) => {
								const id = uniqueIds[idx];
								if (!next[id]) {
									next[id] = {
										firstName: u.firstName,
										lastName: u.lastName,
										avatarUrl: u.avatarUrl,
									};
								} else {
									next[id] = {
										...next[id],
										firstName: next[id].firstName || u.firstName,
										lastName: next[id].lastName || u.lastName,
										avatarUrl: next[id].avatarUrl || u.avatarUrl,
									};
								}
							});
							return next;
						});
					} catch (userErr) {
						console.warn('[AdminChatPage] user fetch error', userErr);
					}
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
					<ul className="space-y-3">
						{messages.map(m => {
							const hasAttachments = Array.isArray(m.attachments) && m.attachments.length > 0;
							const userInfo = userMap[m.senderId];
							const fullName = userInfo ? (`${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 'Inconnu') : 'Inconnu';
							const initials = (userInfo && ((userInfo.firstName || '').charAt(0) + (userInfo.lastName || '').charAt(0)).toUpperCase().trim()) || (fullName.charAt(0) || '?').toUpperCase();
							return (
								<li key={m._id} className="flex items-start gap-3">
									{userInfo?.avatarUrl ? (
											<div className="relative w-9 h-9 rounded-full overflow-hidden" title={fullName} aria-label={fullName}>
												<Image src={userInfo.avatarUrl} alt={fullName} fill className="object-cover" unoptimized />
											</div>
										) : (
											<div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold" title={fullName} aria-label={fullName}>
												{initials}
											</div>
										)}
									<div className="flex-1 min-w-0">
										<p className="text-[11px] text-gray-500 mb-0.5">{new Date(m.createdAt).toLocaleString('fr-FR')}</p>
										<p className="text-xs font-semibold text-gray-700 mb-1">{fullName}</p>
										{m.text && <p className="text-sm text-gray-900 whitespace-pre-line mb-1">{m.text}</p>}
										{hasAttachments && (
											<div className="flex flex-col gap-2">
												{m.attachments!.map(att => {
													const isImage = att.type === 'image' || att.mime.startsWith('image/');
													return (
														<div key={att.url} className="group border rounded-md p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
															<div className="flex items-start gap-3">
																{isImage ? (
																	<a href={att.url} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 overflow-hidden rounded-md bg-white shadow-sm relative">
																		<Image src={att.thumbnailUrl || att.url} alt={att.name} fill className="object-cover" unoptimized />
																	</a>
																) : (
																	<div className="w-10 h-10 flex items-center justify-center rounded bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 text-xs font-medium">
																		{att.type === 'pdf' ? 'PDF' : att.type === 'doc' || att.type === 'docx' ? 'DOC' : 'FILE'}
																	</div>
																)}
																<div className="flex-1 min-w-0">
																	<p className="text-xs font-medium text-gray-800 truncate" title={att.name}>{att.name}</p>
																	<p className="text-[11px] text-gray-500">{(att.size / 1024).toFixed(1)} Ko · {att.mime}</p>
																	<a href={att.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-[11px] text-blue-600 hover:text-blue-700 hover:underline">Ouvrir</a>
																</div>
															</div>
														</div>
													);
												})}
										</div>
									)}
								</div>
							</li>
						);
					})}
					</ul>
				</div>
			</div>
		</AdminLayout>
	);
}
