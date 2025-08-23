// components/message/MessageInput.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, selectedUser, isSendingMessage, handleTyping, stopTyping, typingUsers } = useChat();

  useEffect(() => {
    console.log('💬 MessageInput: useEffect triggered - selectedUser:', selectedUser);
  }, [selectedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedUser) {
      console.error('❌ Cannot submit - missing data');
      return;
    }

    await sendMessage({ text: message });
    setMessage('');
    stopTyping();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleSubmit(e as any);
    }
  };

  const isTyping = selectedUser && typingUsers.includes(selectedUser._id);

  return (
    <div className="border-t bg-white">
      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2 text-sm text-gray-500 border-b">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{selectedUser?.firstName || selectedUser?.name || selectedUser?.email} is typing...</span>
          </div>
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={selectedUser ? "Type a message..." : "Select a user to start chatting"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
              disabled={!selectedUser || isSendingMessage}
              maxLength={1000}
            />
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || !selectedUser || isSendingMessage}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isSendingMessage ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>

      {/* Status */}
      <div className="text-xs text-gray-500 px-4 pb-2">
        {selectedUser ? `Ready to chat with ${selectedUser.firstName || selectedUser.name || selectedUser.email}` : 'Select a conversation to start chatting'}
      </div>
    </div>
  );
};

export default MessageInput;
