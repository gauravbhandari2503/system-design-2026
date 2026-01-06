<script setup lang="ts">
import type { Conversation } from '../../models/Chat';

defineProps<{
  conversations: Conversation[];
  activeId: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();
</script>

<template>
  <div class="h-full bg-white border-r border-gray-200 flex flex-col">
    <div class="p-4 border-b border-gray-100">
        <h2 class="text-xl font-bold text-gray-800">Messages</h2>
    </div>
    
    <div class="flex-1 overflow-y-auto">
        <button 
            v-for="chat in conversations" 
            :key="chat.id"
            @click="emit('select', chat.id)"
            class="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-50"
            :class="{ 'bg-blue-50 hover:bg-blue-50 border-l-4 border-l-blue-500': activeId === chat.id }"
        >
            <div class="relative">
                <img :src="chat.user.avatar" :alt="chat.user.name" class="w-12 h-12 rounded-full object-cover">
                <span 
                    v-if="chat.user.status === 'online'" 
                    class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                ></span>
            </div>
            
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-baseline mb-1">
                    <h3 class="font-semibold text-gray-900 truncate">{{ chat.user.name }}</h3>
                    <span class="text-xs text-gray-500">{{ chat.lastMessage?.timestamp }}</span>
                </div>
                <p class="text-sm text-gray-500 truncate" :class="{ 'font-semibold text-gray-800': chat.unreadCount > 0 }">
                    {{ chat.lastMessage?.type === 'image' ? 'Sent a photo' : chat.lastMessage?.text }}
                </p>
            </div>

            <div v-if="chat.unreadCount > 0" class="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {{ chat.unreadCount }}
            </div>
        </button>
    </div>
  </div>
</template>
