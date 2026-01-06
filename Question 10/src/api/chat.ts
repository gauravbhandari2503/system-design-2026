import type { User, Message, Conversation } from '../models/Chat';

const CURRENT_USER_ID = 'me';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', status: 'online' },
  { id: 'u2', name: 'Davide Rossi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80', status: 'offline', lastSeen: '10 mins ago' },
  { id: 'u3', name: 'Emma Watson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80', status: 'online' },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'u1': [
    { id: 'm1', senderId: 'u1', text: 'Hey! How is the new project going?', type: 'text', timestamp: '10:30 AM', status: 'read' },
    { id: 'm2', senderId: 'me', text: 'It is going great! Just finishing up the chat module.', type: 'text', timestamp: '10:32 AM', status: 'read' },
    { id: 'm3', senderId: 'u1', text: 'That sounds awesome. Send me a screenshot when you can.', type: 'text', timestamp: '10:33 AM', status: 'read' },
  ],
  'u2': [
    { id: 'm4', senderId: 'u2', text: 'Are we still on for lunch?', type: 'text', timestamp: 'Yesterday', status: 'read' },
  ],
  'u3': [
      { id: 'm5', senderId: 'u3', text: 'Check out this design.', type: 'image', fileUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500', timestamp: '9:00 AM', status: 'read' }
  ]
};

export const ChatService = {
  getConversations(): Promise<Conversation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const convos: Conversation[] = MOCK_USERS.map(user => {
            const msgs = MOCK_MESSAGES[user.id] || [];
            const lastMsg = msgs[msgs.length - 1] || { id: 'x', senderId: user.id, text: 'New conversation', type: 'text', timestamp: '', status: 'read' };
            return {
                id: user.id,
                user,
                lastMessage: lastMsg,
                unreadCount: user.id === 'u3' ? 1 : 0
            };
        });
        resolve(convos);
      }, 500);
    });
  },

  getMessages(userId: string): Promise<Message[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...(MOCK_MESSAGES[userId] || [])]);
      }, 300);
    });
  },

  sendMessage(userId: string, message: Message): Promise<Message> {
      return new Promise((resolve) => {
          setTimeout(() => {
              const savedMsg = { ...message, status: 'sent' as const };
              // Simulate storing
              if (!MOCK_MESSAGES[userId]) MOCK_MESSAGES[userId] = [];
              MOCK_MESSAGES[userId].push(savedMsg);
              resolve(savedMsg);
          }, 800);
      });
  }
};
