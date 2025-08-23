// hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from './useAuth';
import { chatStore } from '@/store/chatStore';

export const useChat = () => {
  const [state, setState] = useState(chatStore.getState());
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to store changes
  useEffect(() => {
    console.log('🔌 useChat: Subscribing to chatStore');
    const unsubscribe = chatStore.subscribe(() => {
      const newState = chatStore.getState();
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('Socket not connected yet, isConnected:', isConnected);
      return;
    }

    console.log('🔌 Subscribing to socket events in useChat');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onNewMessage = (msg: any) => {
      console.log('📨 Received newMessage in useChat:', msg);
      const currentUser = user?._id || user?.id;
      const selectedUserId = state.selectedUser?._id;

      // Add message to store
      chatStore.addMessage(msg);

      // If message is from selected user, mark as read immediately
      if (msg.senderId === selectedUserId && msg.receiverId === currentUser && selectedUserId) {
        markMessagesAsRead(selectedUserId);
      }
    };

    const onUserTyping = (data: { senderId: string; isTyping: boolean }) => {
      console.log('⌨️ User typing event:', data);
      if (data.senderId === state.selectedUser?._id) {
        chatStore.setUserTyping(data.senderId, data.isTyping);
      }
    };

    const onUserStatusUpdate = (data: { userId: string; status: string; lastSeen: string }) => {
      console.log('👤 User status update:', data);
      chatStore.updateUserStatus(data.userId, {
        isOnline: data.status === 'online',
        lastSeen: data.lastSeen,
      });
    };

    // Handle read receipts
    const onMessagesRead = (data: { readBy: string; senderId: string }) => {
      console.log('✅ Messages read by:', data.readBy);
      const currentUser = user?._id || user?.id;
      if (data.senderId === currentUser) {
        chatStore.markMessagesAsRead(data.readBy);
      }
    };

    socket.on('newMessage', onNewMessage);
    socket.on('userTyping', onUserTyping);
    socket.on('userStatusUpdate', onUserStatusUpdate);
    socket.on('messagesRead', onMessagesRead);

    return () => {
      socket.off('newMessage', onNewMessage);
      socket.off('userTyping', onUserTyping);
      socket.off('userStatusUpdate', onUserStatusUpdate);
      socket.off('messagesRead', onMessagesRead);
    };
  }, [socket, isConnected, state.selectedUser?._id, user]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (senderId: string) => {
    try {
      await chatStore.markMessagesAsRead(senderId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  // Typing functionality
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!socket || !state.selectedUser) return;

    socket.emit('typing', {
      receiverId: state.selectedUser._id,
      isTyping,
    });
  }, [socket, state.selectedUser]);

  const handleTyping = useCallback(() => {
    sendTypingStatus(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  }, [sendTypingStatus]);

  const stopTyping = useCallback(() => {
    sendTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [sendTypingStatus]);

  const getUsers = useCallback(() => chatStore.getUsers(), []);
  const getMessages = useCallback((userId: string) => chatStore.getMessages(userId), []);
  const sendMessage = useCallback((messageData: { text?: string; image?: string }) =>
    chatStore.sendMessage(messageData), []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setSelectedUser = useCallback((user: any) => chatStore.setSelectedUser(user), []);

  return {
    ...state,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    handleTyping,
    stopTyping,
    markMessagesAsRead,
  };
};
