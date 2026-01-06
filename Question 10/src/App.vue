<script setup lang="ts">
import { onMounted } from 'vue';
import Navbar from './components/common/Navbar.vue';
import ChatLayout from './components/chat/ChatLayout.vue';
import { useChat } from './composables/useChat';

const { loadConversations } = useChat();

onMounted(() => {
    loadConversations();
});
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
    <Navbar />
    <main class="flex-1 w-full max-w-screen-2xl mx-auto md:px-4 md:py-4">
        <div class="md:h-full md:rounded-2xl md:shadow-xl md:overflow-hidden md:border border-gray-200">
            <ChatLayout />
        </div>
    </main>
  </div>
</template>
