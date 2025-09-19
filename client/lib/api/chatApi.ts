// client/lib/api/chatApi.ts
import { api } from '../api';
import type {
	ChatUser as User,
	ChatMessage as Message,
	SendMessageData,
} from '@/types/chat';

export class ChatApi {
	/**
	 * Get users with existing conversations
	 */
	static async getConversationUsers(): Promise<User[]> {
		const response = await api.get('/message/users');
		return response.data;
	}

	/**
	 * Get user by ID for initiating new conversations
	 */
	static async getUserById(userId: string): Promise<User> {
		const response = await api.get(`/message/user/${userId}`);
		return response.data;
	}

	/**
	 * Get messages between current user and another user
	 */
	static async getMessages(
		userId: string,
		options?: { before?: string; limit?: number },
	): Promise<Message[]> {
		const params = new URLSearchParams();
		if (options?.before) params.append('before', options.before);
		if (options?.limit) params.append('limit', options.limit.toString());

		const response = await api.get(`/message/${userId}`, {
			params: Object.fromEntries(params),
		});
		return response.data;
	}

	/**
	 * Send a message to another user
	 */
	static async sendMessage(
		receiverId: string,
		messageData: SendMessageData,
	): Promise<Message> {
		const response = await api.post(
			`/message/send/${receiverId}`,
			messageData,
		);
		return response.data;
	}

	/**
	 * Mark messages as read
	 */
	static async markMessagesAsRead(senderId: string): Promise<void> {
		await api.put(`/message/read/${senderId}`);
	}
}
