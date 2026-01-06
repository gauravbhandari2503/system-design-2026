<script setup lang="ts">
import type { Video } from '../../api/videos';

defineProps<{
  video: Video;
  compact?: boolean;
}>();

const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

const formatViews = (views: string) => {
    return views;
};
</script>

<template>
  <div class="flex gap-3 cursor-pointer group" :class="compact ? 'flex-row' : 'flex-col'">
      <!-- Thumbnail -->
      <div class="relative rounded-xl overflow-hidden aspect-video flex-shrink-0" :class="compact ? 'w-40' : 'w-full'">
          <img :src="video.thumbnail" :alt="video.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          <span class="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded font-medium">
              {{ formatDuration(video.duration) }}
          </span>
      </div>
      
      <!-- Meta -->
      <div class="flex gap-3 items-start">
          <img v-if="!compact" :src="video.author.avatar" class="w-9 h-9 rounded-full mt-0.5">
          <div>
              <h3 class="font-bold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {{ video.title }}
              </h3>
              <p class="text-sm text-gray-600">{{ video.author.name }}</p>
              <p class="text-sm text-gray-600">{{ formatViews(video.views) }} views • {{ video.uploadedAt }}</p>
          </div>
      </div>
  </div>
</template>
