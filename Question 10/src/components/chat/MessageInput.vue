<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'send', payload: { text?: string; file?: File; type: 'text' | 'image' | 'file' }): void;
}>();

const text = ref('');
const showEmoji = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const send = () => {
    if (!text.value.trim()) return;
    emit('send', { text: text.value, type: 'text' });
    text.value = '';
    showEmoji.value = false;
};

const handleFile = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
        const file = files[0];
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        emit('send', { file, type, text: type === 'file' ? file.name : undefined });
    }
};

const addEmoji = (emoji: string) => {
    text.value += emoji;
};

const EMOJIS = ['😀', '😂', '😍', '👍', '🔥', '🎉', '❤️', '🤔', '😎', '🙌'];
</script>

<template>
  <div class="p-4 bg-white border-t border-gray-200 relative">
    <!-- Emoji Picker -->
    <div v-if="showEmoji" class="absolute bottom-20 left-4 bg-white shadow-xl rounded-lg border border-gray-100 p-2 grid grid-cols-5 gap-2 w-64 z-10">
        <button v-for="emoji in EMOJIS" :key="emoji" @click="addEmoji(emoji)" class="text-2xl hover:bg-gray-100 rounded p-1 transition-colors">
            {{ emoji }}
        </button>
    </div>

    <!-- Attachments -->
    <input type="file" ref="fileInput" class="hidden" @change="handleFile">

    <div class="flex items-end gap-2">
        <button 
            @click="fileInput?.click()"
            class="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Attach file"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </button>
        
        <button 
            @click="showEmoji = !showEmoji"
            class="p-3 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
            title="Add emoji"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        </button>

        <textarea 
            v-model="text"
            @keydown.enter.prevent="send"
            placeholder="Type a message..." 
            class="flex-1 bg-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none max-h-32"
            rows="1"
        ></textarea>

        <button 
            @click="send"
            class="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!text.trim()"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
    </div>
  </div>
</template>
