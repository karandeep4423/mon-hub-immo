// client/lib/api/chatApi.ts
import { api } from '../api';
import type {
	ChatUser as User,
	ChatMessage as Message,
	SendMessageData,
} from '@/types/chat';
import { handleApiError } from '../utils/errorHandler';

export class ChatApi {
	/** Admin: get conversation participants from collaboration */
	static async getConversationByCollaboration(collaborationId: string): Promise<{ conversation: { _id: string; ownerId: string; collaboratorId: string; status: string } | null }> {
		try {
			const response = await api.get('/admin/chat/conversation', { params: { collaborationId } });
			return response.data;
		} catch (error) {
			throw handleApiError(error, 'chatApi.getConversationByCollaboration', 'Erreur lors de la récupération de la conversation');
		}
	}

	/** Admin: get messages between two participants */
	static async getMessagesBetween(userA: string, userB: string, limit = 100): Promise<{ messages: Message[]; count: number }> {
		try {
			const response = await api.get('/admin/chat/messages', { params: { userA, userB, limit } });
			return response.data;
		} catch (error) {
			throw handleApiError(error, 'chatApi.getMessagesBetween', 'Erreur lors de la récupération des messages');
		}
	}
	/**
	 * Get users with existing conversations
	 */
	static async getConversationUsers(): Promise<User[]> {
		try {
			const response = await api.get('/message/users');
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'chatApi.getConversationUsers',
				'Erreur lors de la récupération des conversations',
			);
		}
	}

	/**
	 * Get user by ID for initiating new conversations
	 */
	static async getUserById(userId: string): Promise<User> {
		try {
			const response = await api.get(`/message/user/${userId}`);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'chatApi.getUserById',
				"Erreur lors de la récupération de l'utilisateur",
			);
		}
	}

	/**
	 * Get messages between current user and another user
	 */
	static async getMessages(
		userId: string,
		options?: { before?: string; limit?: number },
	): Promise<Message[]> {
		try {
			const params = new URLSearchParams();
			if (options?.before) params.append('before', options.before);
			if (options?.limit)
				params.append('limit', options.limit.toString());

			const response = await api.get(`/message/${userId}`, {
				params: Object.fromEntries(params),
			});
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'chatApi.getMessages',
				'Erreur lors de la récupération des messages',
			);
		}
	}

	/**
	 * Send a message to another user
	 */
	static async sendMessage(
		receiverId: string,
		messageData: SendMessageData,
	): Promise<Message> {
		try {
			const response = await api.post(
				`/message/send/${receiverId}`,
				messageData,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'chatApi.sendMessage',
				"Erreur lors de l'envoi du message",
			);
		}
	}

	/**
	 * Upload a chat attachment (image/pdf/doc)
	 */
	static async uploadChatFile(file: File): Promise<{
		url: string;
		name: string;
		mime: string;
		size: number;
	}> {
		try {
			const form = new FormData();
			form.append('file', file);
			const resp = await api.post('/upload/chat-file', form, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return resp.data.data;
		} catch (error) {
			throw handleApiError(
				error,
				'chatApi.uploadChatFile',
				'Erreur lors du téléchargement du fichier',
			);
		}
	}

	/**
	 * Mark messages as read
	 */
	static async markMessagesAsRead(senderId: string): Promise<void> {
		try {
			await api.put(`/message/read/${senderId}`);
		} catch (error) {
			throw handleApiError(
				error,
				'chatApi.markMessagesAsRead',
				'Erreur lors du marquage des messages comme lus',
			);
		}
	}

	/**
	 * Delete a message I sent
	 */
	static async deleteMessage(messageId: string): Promise<void> {
		try {
			await api.delete(`/message/${messageId}`);
		} catch (error) {
			throw handleApiError(
				error,
				'chatApi.deleteMessage',
				'Erreur lors de la suppression du message',
			);
		}
	}
}
