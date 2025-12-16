import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Message, User, ChatState } from '../types';
import { authAPI, usersAPI, messagesAPI } from '../utils/api';
import { supabase } from '../utils/supabase';

interface ChatContextType extends ChatState {
  sendMessage: (content: string, receiverId: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectUser: (userId: string) => void;
  isAuthenticated: boolean;
  authError: string | null;
  selectedUserId: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const typingUsers: any[] = [];
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getSession();
        if (userData && userData.user) {
          setCurrentUser(userData.user);
          setIsAuthenticated(true);
          setIsConnected(true);
          await loadUsers();
          await loadMessages();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Real-time subscription for messages
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    // Initial load
    loadMessages();
    loadUsers();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${currentUser.id},receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log('Message change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as any;
            setMessages((prev) => [...prev, {
              id: newMessage.id,
              userId: newMessage.user_id,
              username: 'User', // Will be updated on next load
              content: newMessage.content,
              timestamp: new Date(newMessage.created_at).getTime(),
              hash: '',
              type: 'text',
              isRead: newMessage.is_read,
            }]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as any;
            setMessages((prev) => 
              prev.map((m) => 
                m.id === updatedMessage.id 
                  ? { ...m, isRead: updatedMessage.is_read }
                  : m
              )
            );
          }
          
          // Reload to get complete data with usernames
          loadMessages();
        }
      )
      .subscribe();

    // Subscribe to user status changes
    const usersChannel = supabase
      .channel('users_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('User status change:', payload);
          const updatedUser = payload.new as any;
          
          setUsers((prev) =>
            prev.map((u) =>
              u.id === updatedUser.id
                ? { ...u, status: updatedUser.status }
                : u
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [isAuthenticated, currentUser]);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await usersAPI.getAllUsers();
      if (fetchedUsers && Array.isArray(fetchedUsers)) {
        setUsers(fetchedUsers.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          avatar: u.avatar_url,
          status: u.status || 'online',
        })));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async () => {
    if (!currentUser) return;
    
    try {
      const fetchedMessages = await messagesAPI.getMessages(currentUser.id);
      if (fetchedMessages && Array.isArray(fetchedMessages)) {
        setMessages(fetchedMessages.map((m: any) => ({
          id: m.id,
          userId: m.user_id || m.sender_id,
          username: m.users?.username || m.sender?.username || 'Unknown',
          content: m.content,
          timestamp: new Date(m.created_at).getTime(),
          hash: '',
          type: 'text',
          isRead: m.is_read,
        })));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const { user } = await authAPI.login(email, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsConnected(true);
      await loadUsers();
      await loadMessages();
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setAuthError(null);
      const { user } = await authAPI.register(username, email, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsConnected(true);
      await loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Registration failed';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setMessages([]);
      setUsers([]);
      setIsConnected(false);
    }
  };

  const sendMessage = async (content: string, receiverId: string) => {
    if (!currentUser || !content.trim()) return;

    try {
      await messagesAPI.createMessage({
        content: content.trim(),
        sender_id: currentUser.id,
        receiver_id: receiverId,
      });

      // Reload messages immediately
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const setTyping = (isTyping: boolean) => {
    // TODO: Implement typing indicator
    console.log('Typing:', isTyping);
  };

  const selectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        currentUser,
        typingUsers,
        isConnected,
        isAuthenticated,
        authError,
        sendMessage,
        setTyping,
        login,
        register,
        logout,
        selectUser,
        selectedUserId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
