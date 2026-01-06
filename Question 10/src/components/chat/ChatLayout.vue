<script setup lang="ts">
import { ref } from 'vue';
import { useChat } from '../../composables/useChat';
import ConversationList from './ConversationList.vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import CallOverlay from './CallOverlay.vue';

const { currentUser, conversations, activeConversation, messages, isTyping, selectConversation, sendMessage } = useChat();

const showSidebar = ref(true); // For mobile toggle
const activeCall = ref<{ isVideo: boolean } | null>(null);

const handleSelect = (id: string) => {
    selectConversation(id);
    if (window.innerWidth < 768) showSidebar.value = false;
};

const startCall = (video: boolean) => {
    activeCall.value = { isVideo: video };
};
</script>

<template>
  <div class="flex h-[calc(100vh-4rem)] bg-white overflow-hidden relative">
      <!-- Call Overlay -->
      <transition 
        enter-active-class="transition duration-300 ease-out" 
        enter-from-class="opacity-0 scale-95" 
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in" 
        leave-from-class="opacity-100 scale-100" 
        leave-to-class="opacity-0 scale-95"
      >
        <CallOverlay 
            v-if="activeCall && activeConversation" 
            :user="activeConversation.user"
            :is-video="activeCall.isVideo"
            @end="activeCall = null"
        />
      </transition>

      <!-- Sidebar -->
      <div 
        class="w-full md:w-80 border-r border-gray-200 flex-shrink-0 absolute md:relative z-20 h-full transition-transform duration-300 transform bg-white"
        :class="showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
      >
          <ConversationList 
            :conversations="conversations" 
            :active-id="activeConversation?.id || null"
            @select="handleSelect"
          />
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col min-w-0 bg-white relative z-10">
          <!-- Chat Header -->
          <div v-if="activeConversation" class="h-16 border-b border-gray-100 flex items-center justify-between px-4 bg-white/80 backdrop-blur">
             <div class="flex items-center gap-3">
                 <button @click="showSidebar = true" class="md:hidden p-2 -ml-2 text-gray-600">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                 </button>
                 <img :src="activeConversation.user.avatar" class="w-10 h-10 rounded-full object-cover">
                 <div>
                     <h3 class="font-bold text-gray-900 leading-tight">{{ activeConversation.user.name }}</h3>
                     <p v-if="isTyping" class="text-xs text-blue-500 font-medium animate-pulse">Typing...</p>
                     <p v-else class="text-xs text-gray-500">{{ activeConversation.user.status === 'online' ? 'Active now' : activeConversation.user.lastSeen || 'Offline' }}</p>
                 </div>
             </div>

             <div class="flex items-center gap-2">
                 <button @click="startCall(false)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Voice Call">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                 </button>
                 <button @click="startCall(true)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Video Call">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                 </button>
                 <button class="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors md:block hidden">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                 </button>
             </div>
          </div>

          <!-- Empty State -->
          <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50">
              <div class="bg-white p-6 rounded-full shadow-sm mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </div>
              <h3 class="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p>Choose a person from the sidebar to start chatting.</p>
          </div>

          <!-- Message Area -->
          <template v-if="activeConversation">
              <MessageList :messages="messages" :current-user="currentUser" />
              <MessageInput @send="sendMessage" />
          </template>
      </div>
  </div>
</template>
