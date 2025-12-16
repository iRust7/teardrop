import React from 'react';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';

const ChatWindow: React.FC = () => {
  const { messages, users, currentUser, typingUsers, isConnected, sendMessage, setTyping, logout, selectedUserId } = useChat();
  const [isSending, setIsSending] = React.useState(false);

  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;

  const handleSendMessage = async (content: string) => {
    if (selectedUserId && !isSending) {
      try {
        setIsSending(true);
        await sendMessage(content, selectedUserId);
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsSending(false);
      }
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
    ? messages.filter(m => {
        // Show messages where current user is sender and selected user is receiver
        // OR selected user is sender and current user is receiver
        const isFromCurrentToSelected = m.userId === currentUser?.id && m.receiverId === selectedUserId;
        const isFromSelectedToCurrent = m.userId === selectedUserId && m.receiverId === currentUser?.id;
        return isFromCurrentToSelected || isFromSelectedToCurrent;
      })
    : [];

  return (
    <div className="flex h-screen bg-white">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-2xl">💬</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Teardrop Chat</h1>
              {selectedUser ? (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>Chatting with</span>
                  <span className="font-semibold text-primary-600">{selectedUser.username}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    selectedUser.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <span className="text-xs">{selectedUser.status}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  {isConnected ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Connected - Select a user to chat
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      Disconnected
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              👥 {users.filter(u => u.status === 'online').length} online
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
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
          disabled={!isConnected || !selectedUserId || isSending}
          isSending={isSending}
        />
      </div>

      {/* User List Sidebar */}
      <UserList users={users} currentUser={currentUser} />
    </div>
  );
};

export default ChatWindow;
