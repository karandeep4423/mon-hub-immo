import { api } from '@/lib/api';
import { toast } from 'react-toastify';

interface User {
  firstName?: string;
  lastName?: string;
  _id: string;
  name?: string;
  email: string;
  lastMessage?: {
    text: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount?: number;
  isOnline?: boolean;
  lastSeen?: string;
  isTyping?: boolean;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  isRead?: boolean;
  readAt?: string;
}

interface ChatState {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSendingMessage: boolean;
  typingUsers: string[];
  userStatuses: Record<string, { isOnline: boolean; lastSeen: string }>;
}

class ChatStore {
  private state: ChatState = {
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSendingMessage: false,
    typingUsers: [],
    userStatuses: {},
  };

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  getState() {
    return this.state;
  }

  setSelectedUser(user: User | null) {
    console.log('📝 ChatStore: Setting selected user:', user);
    this.state = { ...this.state, selectedUser: user };
    if (user) {
      this.state = { ...this.state, messages: [] };
    }
    this.notify();
  }

  private sortUsersByRecentActivity(users: User[]): User[] {
    return users.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime; // Most recent first
    });
  }

  setUsers(users: User[]) {
    const sortedUsers = this.sortUsersByRecentActivity(users);
    this.state = { ...this.state, users: sortedUsers };
    this.notify();
  }

  setMessages(messages: Message[]) {
    this.state = { ...this.state, messages };
    this.notify();
  }

  addMessage(message: Message) {
    const existingMessage = this.state.messages.find(msg => msg._id === message._id);
    if (existingMessage) {
      console.log('Message already exists, skipping:', message._id);
      return;
    }

    this.state = {
      ...this.state,
      messages: [...this.state.messages, message],
    };

    // Update user's last message for sidebar reordering
    this.updateUserLastMessage(message.senderId, message);
    this.notify();
  }

  updateUserLastMessage(userId: string, message: Message) {
    const updatedUsers = this.state.users.map(user => {
      if (user._id === userId) {
        return {
          ...user,
          lastMessage: {
            text: message.text || '',
            createdAt: message.createdAt,
            senderId: message.senderId
          }
        };
      }
      return user;
    });
    
    this.setUsers(updatedUsers);
  }

  // Update message read status
  markMessagesAsRead(senderId: string) {
    const updatedMessages = this.state.messages.map(message => {
      if (message.senderId === senderId && !message.isRead) {
        return { ...message, isRead: true, readAt: new Date().toISOString() };
      }
      return message;
    });

    this.state = { ...this.state, messages: updatedMessages };
    this.notify();
  }

  setUserTyping(userId: string, isTyping: boolean) {
    if (isTyping) {
      this.state = {
        ...this.state,
        typingUsers: [...this.state.typingUsers.filter(id => id !== userId), userId],
      };
    } else {
      this.state = {
        ...this.state,
        typingUsers: this.state.typingUsers.filter(id => id !== userId),
      };
    }
    this.notify();
  }

  updateUserStatus(userId: string, status: { isOnline: boolean; lastSeen: string }) {
    this.state = {
      ...this.state,
      userStatuses: {
        ...this.state.userStatuses,
        [userId]: status,
      },
    };
    this.notify();
  }

  setUsersLoading(loading: boolean) {
    this.state = { ...this.state, isUsersLoading: loading };
    this.notify();
  }

  setMessagesLoading(loading: boolean) {
    this.state = { ...this.state, isMessagesLoading: loading };
    this.notify();
  }

  setSendingMessage(loading: boolean) {
    this.state = { ...this.state, isSendingMessage: loading };
    this.notify();
  }

  async getUsers() {
    console.log('🔍 ChatStore: Fetching users...');
    this.setUsersLoading(true);
    try {
      const res = await api.get('/message/users');
      console.log('✅ ChatStore: Users fetched:', res.data);
      this.setUsers(res.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ ChatStore: Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Error fetching users');
    } finally {
      this.setUsersLoading(false);
    }
  }

  async getMessages(userId: string) {
    console.log('🔍 ChatStore: Fetching messages for user:', userId);
    this.setMessagesLoading(true);
    try {
      const res = await api.get(`/message/${userId}`);
      console.log('✅ ChatStore: Messages fetched:', res.data);
      this.setMessages(res.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ ChatStore: Error fetching messages:', error);
      toast.error(error.response?.data?.message || 'Error fetching messages');
    } finally {
      this.setMessagesLoading(false);
    }
  }

  async sendMessage(messageData: { text?: string; image?: string }) {
    if (!this.state.selectedUser) {
      console.error('❌ ChatStore: No selected user');
      return;
    }

    console.log('📤 ChatStore: Sending message:', messageData, 'to:', this.state.selectedUser._id);
    this.setSendingMessage(true);
    try {
      const res = await api.post(`/message/send/${this.state.selectedUser._id}`, messageData);
      console.log('✅ ChatStore: Message sent:', res.data);
      toast.success('Message sent!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ ChatStore: Error sending message:', error);
      toast.error(error.response?.data?.message || 'Error sending message');
    } finally {
      this.setSendingMessage(false);
    }
  }
}

export const chatStore = new ChatStore();
