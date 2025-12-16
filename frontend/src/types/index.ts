export interface Message {
  id: string;
  userId: string;
  receiverId: string;
  username: string;
  content: string;
  timestamp: number;
  hash: string;
  type: 'text' | 'file';
  fileData?: FileData;
  isRead?: boolean;
}

export interface FileData {
  name: string;
  size: number;
  type: string;
  url: string;
  hash: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: number;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ChatState {
  messages: Message[];
  users: User[];
  currentUser: User | null;
  typingUsers: TypingIndicator[];
  isConnected: boolean;
}
