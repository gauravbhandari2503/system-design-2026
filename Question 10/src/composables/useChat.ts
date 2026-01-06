import { ref, computed } from 'vue';
import type { User, Message, Conversation } from '../models/Chat';
import { ChatService } from '../api/chat';

const activeConversationId = ref<string | null>(null);
const conversations = ref<Conversation[]>([]);
const messages = ref<Message[]>([]);
const currentUser = { id: 'me', name: 'Me', avatar: 'https://via.placeholder.com/150', status: 'online' as const };
const isTyping = ref(false);

export function useChat() {
  const activeConversation = computed(() => 
    conversations.value.find(c => c.id === activeConversationId.value)
  );

  const loadConversations = async () => {
    conversations.value = await ChatService.getConversations();
    if (!activeConversationId.value && conversations.value.length > 0) {
        selectConversation(conversations.value[0].id);
    }
  };

  const selectConversation = async (id: string) => {
    activeConversationId.value = id;
    messages.value = await ChatService.getMessages(id);
    // Mark as read mock
    const convo = conversations.value.find(c => c.id === id);
    if (convo) convo.unreadCount = 0;
  };

  const sendMessage = async (payload: { text?: string; file?: File; type: 'text' | 'image' | 'file' }) => {
    if (!activeConversationId.value) return;
    
    const tempId = Date.now().toString();
    const newMsg: Message = {
        id: tempId,
        senderId: 'me',
        text: payload.text,
        fileUrl: payload.file ? URL.createObjectURL(payload.file) : undefined,
        fileName: payload.file?.name,
        type: payload.type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sending'
    };

    // Optimistic Update
    messages.value.push(newMsg);
    
    // API Call
    const sentMsg = await ChatService.sendMessage(activeConversationId.value, newMsg);
    
    // Update status
    const index = messages.value.findIndex(m => m.id === tempId);
    if (index !== -1) {
        messages.value[index] = sentMsg;
    }

    // Simulate Echo Reply
    simulateReply(activeConversationId.value);
  };

  const simulateReply = (userId: string) => {
      setTimeout(() => {
          if (activeConversationId.value === userId) {
            isTyping.value = true;
          }
          
          setTimeout(() => {
             isTyping.value = false;
             if (activeConversationId.value === userId) {
                 const reply: Message = {
                     id: Date.now().toString(),
                     senderId: userId,
                     text: 'That sounds interesting! Tell me more.',
                     type: 'text',
                     timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                     status: 'read'
                 };
                 messages.value.push(reply);
             }
          }, 2000);
      }, 1000);
  };

  return {
    currentUser,
    conversations,
    activeConversation,
    messages,
    isTyping,
    loadConversations,
    selectConversation,
    sendMessage
  };
}
