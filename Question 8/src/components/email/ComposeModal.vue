<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'send', payload: { to: string, subject: string, body: string }): void;
}>();

const to = ref('');
const subject = ref('');
const body = ref('');
const sending = ref(false);

const handleSend = async () => {
    if (!to.value || !subject.value || !body.value) return;
    
    sending.value = true;
    // Simulate network delay for UX
    await new Promise(r => setTimeout(r, 600));
    
    emit('send', { to: to.value, subject: subject.value, body: body.value });
    
    // Reset
    to.value = '';
    subject.value = '';
    body.value = '';
    sending.value = false;
    emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/40 pointer-events-auto" @click="$emit('close')"></div>

    <!-- Modal Window -->
    <div class="bg-white w-full sm:w-[600px] h-[500px] shadow-2xl rounded-t-xl sm:rounded-xl flex flex-col pointer-events-auto relative transform transition-transform animate-slide-up sm:animate-zoom-in">
        
        <!-- Header -->
        <div class="bg-gray-900 text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
            <h3 class="font-semibold">New Message</h3>
            <button @click="$emit('close')" class="hover:bg-gray-700 p-1 rounded transition-colors" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>

        <!-- Body -->
        <div class="flex-1 flex flex-col p-4 gap-4">
            <input 
                v-model="to" 
                type="email" 
                placeholder="To" 
                class="border-b border-gray-200 py-2 outline-none focus:border-blue-500"
                autofocus
            >
            <input 
                v-model="subject" 
                type="text" 
                placeholder="Subject" 
                class="border-b border-gray-200 py-2 outline-none focus:border-blue-500 font-medium"
            >
            <textarea 
                v-model="body" 
                class="flex-1 resize-none outline-none mt-2" 
                placeholder="Type your message..."
            ></textarea>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-100 flex justify-end gap-2">
            <button @click="$emit('close')" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">Discard</button>
            <button 
                @click="handleSend" 
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="sending || !to || !subject"
            >
                <span v-if="sending">Sending...</span>
                <span v-else>Send</span>
                <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
.animate-slide-up {
    animation: slide-up 0.3s ease-out;
}
</style>
