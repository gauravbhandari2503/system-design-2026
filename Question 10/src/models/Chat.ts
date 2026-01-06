export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing';
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  fileUrl?: string;
  fileName?: string;
  type: 'text' | 'image' | 'file';
  timestamp: string; // ISO 8601 or formatted time string
  status: 'sending' | 'sent' | 'read';
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}
