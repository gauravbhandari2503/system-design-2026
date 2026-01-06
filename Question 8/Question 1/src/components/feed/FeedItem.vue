<script setup lang="ts">
import { computed } from 'vue';
import type { Post } from '../../models/Post';

const props = defineProps<{
  post: Post
}>();

const emit = defineEmits<{
  (e: 'like', id: string): void
}>();

const timeAgo = computed(() => {
  const date = new Date(props.post.timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return Math.floor(seconds) + "s";
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img 
          :src="post.author.avatar" 
          :alt="post.author.name" 
          class="w-10 h-10 rounded-full object-cover border border-gray-100"
        />
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <span class="font-semibold text-gray-900">{{ post.author.name }}</span>
            <span class="text-xs text-gray-400">• {{ timeAgo }}</span>
          </div>
          <span class="text-sm text-gray-500">{{ post.author.handle }}</span>
        </div>
      </div>
      
      <button class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    </div>

    <!-- Content -->
    <div class="px-4 pb-3">
      <p class="text-gray-800 leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
    </div>

    <!-- Image Attachment -->
    <div v-if="post.image" class="w-full bg-gray-50">
      <img 
        :src="post.image" 
        :alt="post.content" 
        class="w-full h-auto max-h-[500px] object-cover"
        loading="lazy"
      />
    </div>

    <!-- Actions Bar -->
    <div class="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <!-- Like Button -->
        <button 
          @click="emit('like', post.id)"
          class="flex items-center gap-2 transition-colors group"
          :class="post.hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'"
        >
          <div class="p-2 rounded-full group-hover:bg-red-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" :fill="post.hasLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <span class="text-sm font-medium">{{ post.likes }}</span>
        </button>

        <!-- Comment Button -->
        <button class="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
          <div class="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span class="text-sm font-medium">{{ post.comments }}</span>
        </button>

        <!-- Share Button -->
        <button class="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group">
          <div class="p-2 rounded-full group-hover:bg-green-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
