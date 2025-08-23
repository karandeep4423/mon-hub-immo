'use client';

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { api } from '@/lib/api';

// Helper Components
const MessageBubble: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  isMyMessage: boolean;
}> = React.memo(({ message, isMyMessage }) => {
  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div className={`
        max-w-[70%] sm:max-w-[85%] rounded-lg px-4 py-2 shadow-sm
        ${isMyMessage 
          ? 'bg-blue-500 text-white rounded-br-sm' 
          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
        }
      `}>
        {/* Message Text */}
        {message.text && (
          <p className="text-sm leading-relaxed break-words">{message.text}</p>
        )}
        
        {/* Message Image */}
        {message.image && (
          <img 
            src={message.image} 
            alt="Message" 
            className="max-w-full h-auto rounded mt-2 cursor-pointer hover:opacity-90 transition-opacity" 
          />
        )}
        
        {/* Message footer with time and read status */}
        <div className="flex items-center justify-end mt-1 space-x-1">
          <span className={`text-xs ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          {/* Read receipts for sent messages */}
          {isMyMessage && (
            <div className="flex items-center space-x-1">
              {/* Single tick - message sent */}
              <svg className="w-3 h-3 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              
              {/* Double tick - message read */}
              {message.isRead && (
                <svg className="w-3 h-3 text-blue-200 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

const ChatMessages: React.FC = () => {
  const { messages, selectedUser, isMessagesLoading, getMessages, typingUsers } = useChat();
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = user?._id || user?.id;

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser?._id) {
      console.log('📱 ChatMessages: Loading messages for user:', selectedUser._id);
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark messages as read when user opens chat
  useEffect(() => {
    const markAsRead = async () => {
      if (selectedUser?._id && messages.length > 0) {
        try {
          await api.put(`/message/read/${selectedUser._id}`);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    };

    markAsRead();
  }, [selectedUser?._id, messages.length]);

  // Listen for read receipts
  useEffect(() => {
    if (!socket) return;

    const handleMessagesRead = (data: { readBy: string; senderId: string }) => {
      console.log('Messages read by:', data.readBy);
      // You can update the UI to show read receipts here
    };

    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket]);

  const renderedMessages = useMemo(() => {
    return messages.map((message) => (
      <MessageBubble
        key={message._id}
        message={message}
        isMyMessage={message.senderId === currentUserId}
      />
    ));
  }, [messages, currentUserId]);

  const isTyping = selectedUser && typingUsers.includes(selectedUser._id);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Welcome to Chat</h3>
          <p className="text-gray-500">Select a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-700 mb-1">Start the conversation</h3>
              <p className="text-sm text-gray-500">Send a message to begin chatting with {selectedUser.firstName || selectedUser.name || selectedUser.email}</p>
            </div>
          </div>
        ) : (
          <>
            {renderedMessages}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="px-4 mb-4">
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm px-4 py-2 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
