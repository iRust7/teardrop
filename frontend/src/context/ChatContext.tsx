import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
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

  // Define helper functions BEFORE useEffect hooks that use them
  const loadUsers = useCallback(async () => {
    try {
      console.log('[USERS] Loading users...');
      const fetchedUsers = await usersAPI.getAllUsers();
      console.log('[USERS] Fetched users:', fetchedUsers?.length || 0);
      if (fetchedUsers && Array.isArray(fetchedUsers)) {
        const mappedUsers = fetchedUsers.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          avatar: u.avatar_url,
          status: u.status || 'offline',
        }));
        setUsers(mappedUsers);
        console.log('[USERS] Users state updated');
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!currentUser) {
      console.log('[MESSAGES] No current user, skipping load');
      return;
    }
    
    try {
      console.log('[MESSAGES] Loading messages for user:', currentUser.username, 'ID:', currentUser.id);
      const fetchedMessages = await messagesAPI.getMessages(currentUser.id);
      console.log('[MESSAGES] Fetched messages:', fetchedMessages?.length || 0);
      if (fetchedMessages && Array.isArray(fetchedMessages)) {
        const mappedMessages = fetchedMessages.map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          receiverId: m.receiver_id,
          username: m.sender?.username || 'Unknown',
          content: m.content,
          timestamp: new Date(m.created_at).getTime(),
          hash: '',
          type: 'text' as const,
          isRead: m.is_read,
        }));
        console.log('[MESSAGES] Setting messages state with', mappedMessages.length, 'messages');
        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      console.log('[APP] Checking authentication...');
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const cachedUser = localStorage.getItem('cached_user');
        console.log('[APP] Token exists:', !!token);
        console.log('[APP] Cached user exists:', !!cachedUser);
        
        if (!token) {
          console.log('[APP] No token, showing login');
          localStorage.removeItem('cached_user');
          setIsLoading(false);
          return;
        }

        // Restore user from cache immediately for better UX
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            console.log('[APP] Restoring cached user:', parsedUser.username);
            setCurrentUser(parsedUser);
            setIsAuthenticated(true);
            setIsConnected(true);
          } catch (e) {
            console.error('[APP] Failed to parse cached user:', e);
          }
        }

        // Validate session with backend
        const userData = await authAPI.getSession();
        console.log('[APP] Session data:', userData);
        
        if (userData && userData.user) {
          console.log('[APP] Session valid, user authenticated:', userData.user.username);
          setCurrentUser(userData.user);
          setIsAuthenticated(true);
          setIsConnected(true);
          // Cache user data for instant restoration
          localStorage.setItem('cached_user', JSON.stringify(userData.user));
          await loadUsers();
          await loadMessages();
        } else {
          console.log('[APP] Session invalid, clearing data');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('cached_user');
          setCurrentUser(null);
          setIsAuthenticated(false);
          setIsConnected(false);
        }
      } catch (error) {
        console.error('[APP] Auth check error:', error);
        setIsAuthenticated(false);
        setIsConnected(false);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('cached_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [loadUsers, loadMessages]);

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
    if (!isAuthenticated || !currentUser) {
      console.log('[REALTIME] Not authenticated or no current user, skipping subscription');
      return;
    }

    // Initial load
    console.log('[REALTIME] Initial load for user:', currentUser.username);
    loadMessages();
    loadUsers();

    // Subscribe to new messages (messages sent TO or FROM current user)
    console.log('[REALTIME] Setting up message subscription for user:', currentUser.username);
    const messagesChannel = supabase
      .channel(`messages_channel_${currentUser.id}`)
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
        console.log('[REALTIME] Message subscription status:', status);
      });

    // Subscribe to user status changes
    const usersChannel = supabase
      .channel(`users_channel_${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('[REALTIME] User status change:', payload);
          const updatedUser = payload.new as any;
          
          setUsers((prev) =>
            prev.map((u) =>
              u.id === updatedUser.id
                ? { ...u, status: updatedUser.status, email: updatedUser.email, username: updatedUser.username }
                : u
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] User subscription status:', status);
      });

    return () => {
      console.log('[REALTIME] Cleaning up subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [isAuthenticated, currentUser, loadMessages, loadUsers]);

  const login = async (email: string, password: string) => {
    try {
      setAuthError(null);
      console.log('[LOGIN] Attempting login for:', email);
      const { user } = await authAPI.login(email, password);
      console.log('[LOGIN] Login successful, user:', user.username);
      
      // Cache user data immediately
      localStorage.setItem('cached_user', JSON.stringify(user));
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsConnected(true);
      
      console.log('[LOGIN] Loading users and messages...');
      await loadUsers();
      await loadMessages();
      
      // Request notification permission
      requestNotificationPermission();
      console.log('[LOGIN] Login complete');
    } catch (error: any) {
      console.error('[LOGIN] Login error:', error);
      const message = error.response?.data?.error || error.message || 'Login failed';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setAuthError(null);
      console.log('[REGISTER] Attempting registration for:', username);
      const { user } = await authAPI.register(username, email, password);
      console.log('[REGISTER] Registration successful, user:', user.username);
      
      // Cache user data immediately
      localStorage.setItem('cached_user', JSON.stringify(user));
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      setIsConnected(true);
      
      await loadUsers();
      await loadMessages();
      console.log('[REGISTER] Registration complete');
    } catch (error: any) {
      console.error('[REGISTER] Registration error:', error);
      const message = error.response?.data?.error || error.message || 'Registration failed';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      console.log('[LOGOUT] Logging out...');
      await authAPI.logout();
    } catch (error) {
      console.error('[LOGOUT] Logout error:', error);
    } finally {
      // Clear all data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('cached_user');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setMessages([]);
      setUsers([]);
      setIsConnected(false);
      setSelectedUserId(null);
      console.log('[LOGOUT] Logout complete');
    }
  };

  const sendMessage = async (content: string, receiverId: string) => {
    if (!currentUser || !content.trim()) return;

    console.log('[CHAT] Sending message to:', receiverId, 'Content:', content.substring(0, 50));
    try {
      const result = await messagesAPI.createMessage({
        content: content.trim(),
        receiver_id: receiverId,
      });
      console.log('[CHAT] Message sent successfully, ID:', result?.id);

      // Add optimistic update - add message immediately to UI
      const newMessage: Message = {
        id: result?.id || `temp-${Date.now()}`,
        userId: currentUser.id,
        receiverId: receiverId,
        username: currentUser.username,
        content: content.trim(),
        timestamp: Date.now(),
        hash: '',
        type: 'text' as const,
        isRead: false,
      };
      
      console.log('[CHAT] Adding message optimistically to UI');
      setMessages(prev => [...prev, newMessage]);
      
      // Reload messages to get complete data from server
      setTimeout(() => loadMessages(), 500);
    } catch (error) {
      console.error('[CHAT] Error sending message:', error);
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
