<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { User } from '../../models/Chat';

defineProps<{
  user: User;
  isVideo: boolean;
}>();

const emit = defineEmits<{
  (e: 'end'): void;
}>();

const isConnected = ref(false);
const duration = ref(0);

onMounted(() => {
    setTimeout(() => {
        isConnected.value = true;
        setInterval(() => {
            duration.value++;
        }, 1000);
    }, 1500);
});

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <!-- Background Blur effect -->
      <img :src="user.avatar" class="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl">
      
      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center gap-6">
          <div class="relative">
              <img :src="user.avatar" class="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl">
              <div v-if="!isConnected" class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-gray-900 bg-green-500 animate-pulse"></div>
          </div>
          
          <div class="text-center">
              <h2 class="text-3xl font-bold mb-2">{{ user.name }}</h2>
              <p class="text-lg text-white/50 font-medium">
                  {{ isConnected ? formatTime(duration) : (isVideo ? 'Video Calling...' : 'Voice Calling...') }}
              </p>
          </div>
          
          <div class="flex items-center gap-6 mt-12">
              <button class="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
              
              <button 
                @click="emit('end')"
                class="p-6 rounded-full bg-red-500 hover:bg-red-600 shadow-xl scale-110 hover:scale-125 transition-all text-white"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>
              </button>
              
              <button class="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </button>
          </div>
      </div>
  </div>
</template>
