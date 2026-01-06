# Chat Application (Question 10) Implementation Plan

Design a responsive chat interface supporting multiple conversations, real-time message flow simulation, and optimistic updates.

## User Review Required
- **Real-time**: I will simulate "partner typing" and "reply" behaviors using `setTimeout`.
- **Persistence**: Messages will be stored in-memory for the session (reset on reload).

## Proposed Changes

### System Architecture
```
src/
├── components/
│   ├── chat/
│   │   ├── ChatLayout.vue     # Split view (Sidebar + ChatWindow)
│   │   ├── ConversationList.vue # Sidebar user list
│   │   ├── MessageList.vue    # Scrollable message area
│   │   └── MessageInput.vue   # Textarea + Send button
│   └── common/
│       └── Navbar.vue
├── api/
│   └── chat.ts               # Mock Service (Conversations, Messages)
├── composables/
│   └── useChat.ts            # State (activeThread, sendMessage, receiveMessage)
```

### Data Model
```typescript
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'read';
}

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing';
}
```
