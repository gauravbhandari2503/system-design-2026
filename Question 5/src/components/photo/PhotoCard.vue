<script setup lang="ts">
import { computed } from 'vue';
import type { Photo } from '../../models/Photo';

const props = defineProps<{
  photo: Photo;
}>();

const emit = defineEmits<{
  (e: 'like', id: string): void;
}>();

const handleDoubleClick = () => {
    if (!props.photo.isLiked) {
        emit('like', props.photo.id);
    }
};

const formatTime = (iso: string) => {
    const date = new Date(iso);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        -Math.round((Date.now() - date.getTime()) / (1000 * 60)), 
        'minute'
    );
};
</script>

<template>
  <article class="bg-white border-b border-gray-200 pb-4 mb-4">
    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-3">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-500 p-[2px]">
            <img :src="photo.author.avatar" class="w-full h-full rounded-full border-2 border-white object-cover" alt="Avatar">
        </div>
        <span class="font-semibold text-sm text-gray-900">{{ photo.author.username }}</span>
      </div>
      <button class="text-gray-500 hover:text-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    </div>

    <!-- Image -->
    <div 
        class="w-full aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
        @dblclick="handleDoubleClick"
    >
      <img 
        :src="photo.url" 
        loading="lazy"
        class="w-full h-full object-cover transition-opacity duration-300" 
        alt="Post"
      />
      <!-- Heart Animation Overlay could go here -->
    </div>

    <!-- Actions -->
    <div class="px-3 py-3">
      <div class="flex items-center gap-4 mb-2">
        <button @click="emit('like', photo.id)" class="hover:opacity-60 transition-opacity">
            <svg v-if="photo.isLiked" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
        <button class="hover:opacity-60 transition-opacity transform -rotate-90">
             <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button class="hover:opacity-60 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>

      <!-- Likes -->
      <div class="font-bold text-sm text-gray-900 mb-1">{{ photo.likes }} likes</div>

      <!-- Caption -->
      <div class="text-sm text-gray-900 mb-2">
        <span class="font-bold mr-2">{{ photo.author.username }}</span>
        <span>{{ photo.caption }}</span>
      </div>

      <!-- Comments -->
      <div class="text-gray-500 text-sm mb-1 cursor-pointer">View all {{ photo.comments.length + 12 }} comments</div>
      <div class="text-xs text-gray-400 uppercase tracking-wide mt-2">Just now</div>
    </div>
  </article>
</template>
