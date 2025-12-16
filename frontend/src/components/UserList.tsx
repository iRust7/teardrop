import React, { useState } from 'react';
import { User } from '../types';
import UserAvatar from './UserAvatar';
import { useChat } from '../context/ChatContext';

interface UserListProps {
  users: User[];
  currentUser: User | null;
}

const UserList: React.FC<UserListProps> = ({ users, currentUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectUser, selectedUserId } = useChat();

  const onlineUsers = users.filter(u => u.status === 'online' && u.id !== currentUser?.id);
  const offlineUsers = users.filter(u => u.status !== 'online' && u.id !== currentUser?.id);

  const handleUserClick = (userId: string) => {
    selectUser(userId);
  };

  return (
    <div className="w-64 border-l border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          Users ({users.length})
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          {/* Current User */}
          {currentUser && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 px-2 mb-2">You</div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-primary-50 border border-primary-200">
                <UserAvatar user={currentUser} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{currentUser.username}</div>
                  <div className="text-xs text-primary-600 capitalize">{currentUser.status}</div>
                </div>
              </div>
            </div>
          )}

          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 px-2 mb-2">
                Online ({onlineUsers.length})
              </div>
              <div className="space-y-1">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer ${
                      selectedUserId === user.id ? 'bg-primary-100 border border-primary-300' : ''
                    }`}
                  >
                    <UserAvatar user={user} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{user.username}</div>
                      <div className="text-xs text-green-600">Active now</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Users */}
          {offlineUsers.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 px-2 mb-2">
                Offline ({offlineUsers.length})
              </div>
              <div className="space-y-1">
                {offlineUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer opacity-60 ${
                      selectedUserId === user.id ? 'bg-primary-100 border border-primary-300' : ''
                    }`}
                  >
                    <UserAvatar user={user} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{user.username}</div>
                      <div className="text-xs text-gray-500">Offline</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserList;
