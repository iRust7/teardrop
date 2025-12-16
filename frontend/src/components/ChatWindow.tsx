import React from 'react';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';

const ChatWindow: React.FC = () => {
  const { messages, users, currentUser, typingUsers, isConnected, sendMessage, setTyping, logout, selectedUserId } = useChat();

  const handleSendMessage = async (content: string) => {
    if (selectedUserId) {
      await sendMessage(content, selectedUserId);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    setTyping(isTyping);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  // Filter messages for selected conversation
  const filteredMessages = selectedUserId 
    ? messages.filter(m => 
        (m.userId === currentUser?.id && m.userId === selectedUserId) ||
        (m.userId === selectedUserId && m.userId === currentUser?.id)
      )
    : messages;

  return (
    <div className="flex h-screen bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">💬</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Teardrop Chat</h1>
              <p className="text-sm text-gray-500">
                {isConnected ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Disconnected
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {users.filter(u => u.status === 'online').length} online
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          messages={filteredMessages}
          currentUser={currentUser}
          typingUsers={typingUsers}
        />

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={!isConnected || !selectedUserId}
        />
      </div>

      {/* User List Sidebar */}
      <UserList users={users} currentUser={currentUser} />
    </div>
  );
};

export default ChatWindow;
