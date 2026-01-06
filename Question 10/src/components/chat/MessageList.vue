<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Message, User } from '../../models/Chat';

const props = defineProps<{
  messages: Message[];
  currentUser: User;
}>();

const container = ref<HTMLElement | null>(null);

watch(() => props.messages.length, async () => {
    await nextTick();
    if (container.value) {
        container.value.scrollTop = container.value.scrollHeight;
    }
});
</script>

<template>
  <div ref="container" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
    <div 
        v-for="msg in messages" 
        :key="msg.id" 
        class="flex flex-col max-w-[70%]"
        :class="msg.senderId === 'me' ? 'self-end items-end' : 'self-start items-start'"
    >
        <!-- Text Bubble -->
        <div 
            v-if="msg.type === 'text'"
            class="px-4 py-2 rounded-2xl shadow-sm text-sm"
            :class="msg.senderId === 'me' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'"
        >
            {{ msg.text }}
        </div>

        <!-- Image Bubble -->
        <div 
            v-else-if="msg.type === 'image'"
            class="rounded-xl overflow-hidden shadow-sm border border-gray-100 max-w-sm"
        >
            <img :src="msg.fileUrl" alt="Attachment" class="w-full h-auto">
        </div>

        <!-- File Bubble -->
        <div 
            v-else-if="msg.type === 'file'"
            class="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
        >
            <div class="bg-gray-100 p-2 rounded-lg text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            </div>
            <div class="text-sm">
                <p class="font-medium text-gray-900 line-clamp-1">{{ msg.fileName || 'Document' }}</p>
                <p class="text-xs text-gray-500">Attachment</p>
            </div>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-1 mt-1 px-1">
             <span class="text-[10px] text-gray-400">{{ msg.timestamp }}</span>
             <span v-if="msg.senderId === 'me'" class="text-[10px]" :class="msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'">
                 {{ msg.status === 'read' ? 'Read' : msg.status === 'sent' ? 'Sent' : '...' }}
             </span>
        </div>
    </div>
  </div>
</template>
