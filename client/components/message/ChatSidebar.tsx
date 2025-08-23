'use client';

import React, { useEffect, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useSocket } from '../../context/SocketContext';

interface ChatSidebarProps {
  onClose?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
  const { users, isUsersLoading, getUsers, selectedUser, setSelectedUser, userStatuses } = useChat();
  const { onlineUsers } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    if (onClose) onClose();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getUserInitial = (user: any) => {
    if (user.firstName) {
      return user.firstName[0]?.toUpperCase() || '?';
    }
    if (user.name) {
      return user.name?.toUpperCase() || '?';
    }
    return '?';
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getUserDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.email || 'Unknown User';
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatLastMessage = (lastMessage: any) => {
    if (!lastMessage) return 'No messages yet';
    return lastMessage.text?.slice(0, 30) + (lastMessage.text?.length > 30 ? '...' : '');
  };

  const formatLastSeen = (userId: string) => {
    const status = userStatuses[userId];
    const isOnline = onlineUsers.includes(userId);
    
    if (isOnline) {
      return 'Online';
    }
    
    if (!status?.lastSeen) return 'Offline';
    
    const lastSeen = new Date(status.lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeen.toLocaleDateString();
  };

  const filteredUsers = users.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    return displayName.includes(searchQuery.toLowerCase());
  });

  if (isUsersLoading) {
    return (
      <div className="h-full bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Chats</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users list */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              const lastSeen = formatLastSeen(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {getUserInitial(user)}
                      </div>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getUserDisplayName(user)}
                        </h3>
                        {user.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(user.lastMessage.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {formatLastMessage(user.lastMessage)}
                        </p>
                        {user.unreadCount && user.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center">
                            {user.unreadCount > 99 ? '99+' : user.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">{lastSeen}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
