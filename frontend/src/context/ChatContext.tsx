import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Message, User, ChatState } from '../types';
import { authAPI, usersAPI, messagesAPI } from '../utils/api';
import { supabase } from '../utils/supabase';
import { playNotificationSound, requestNotificationPermission } from '../utils/notifications';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      console.log('[APP] Checking authentication...');
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        console.log('[APP] Token exists:', !!token);
        
        if (!token) {
          console.log('[APP] No token, showing login');
          setIsLoading(false);
          return;
        }

        const userData = await authAPI.getSession();
        console.log('[APP] Session data:', userData);
        
        if (userData && userData.user) {
          console.log('[APP] User authenticated:', userData.user.username);
          setCurrentUser(userData.user);
          setIsAuthenticated(true);
          setIsConnected(true);
          await loadUsers();
          await loadMessages();
        } else {
          console.log('[APP] No user data, clearing token');
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('[APP] Auth check error:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Heartbeat to keep user status online
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    // Send heartbeat every 30 seconds to update last_seen
    const heartbeatInterval = setInterval(async () => {
      try {
        await usersAPI.updateStatus('online');
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [isAuthenticated, currentUser]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    // Initial load
    loadMessages();
    loadUsers();

    // Subscribe to new messages (messages sent TO or FROM current user)
    console.log('[REALTIME] Setting up message subscription for user:', currentUser.username);
    const messagesChannel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('[REALTIME] New message received!', payload);
          const newMessage = payload.new as any;
          
          // Only add if message involves current user
          if (newMessage.user_id === currentUser.id || newMessage.receiver_id === currentUser.id) {
            console.log('[REALTIME] Message is for current user, reloading...');
            
            // Play notification sound if message is from someone else
            if (newMessage.user_id !== currentUser.id) {
              console.log('[REALTIME] Playing notification sound');
              playNotificationSound();
            }
            
            // Immediately reload messages to get complete data
            loadMessages();
            // Also reload users to update last seen
            loadUsers();
          } else {
            console.log('[REALTIME] Message not for current user, ignoring');
          }
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Subscription status:', status);
      });

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
      console.log('[USERS] Loading users...');
      const fetchedUsers = await usersAPI.getAllUsers();
      console.log('[USERS] Fetched users:', fetchedUsers?.length || 0);
      if (fetchedUsers && Array.isArray(fetchedUsers)) {
        setUsers(fetchedUsers.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          avatar: u.avatar_url,
          status: u.status || 'offline', // Default offline, akan ter-update dari database
        })));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async () => {
    if (!currentUser) return;
    
    try {
      console.log('[MESSAGES] Loading messages for user:', currentUser.username);
      const fetchedMessages = await messagesAPI.getMessages(currentUser.id);
      console.log('[MESSAGES] Fetched messages:', fetchedMessages?.length || 0);
      if (fetchedMessages && Array.isArray(fetchedMessages)) {
        setMessages(fetchedMessages.map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          receiverId: m.receiver_id,
          username: m.sender?.username || 'Unknown',
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
      // Request notification permission
      requestNotificationPermission();
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

    console.log('[CHAT] Sending message to:', receiverId);
    try {
      const result = await messagesAPI.createMessage({
        content: content.trim(),
        receiver_id: receiverId,
      });
      console.log('[CHAT] Message sent successfully:', result);

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
        isLoading,
      } as any}
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
