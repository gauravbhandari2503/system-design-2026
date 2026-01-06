<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVideoPlayer } from '../../composables/useVideoPlayer';
import type { Video } from '../../api/videos';

const props = defineProps<{
  video: Video;
}>();

const videoElement = ref<HTMLVideoElement | null>(null);
const { 
  isPlaying, currentTime, duration, volume, isMuted, isFullscreen,
  togglePlay, seek, setVolume, toggleMute, toggleFullscreen 
} = useVideoPlayer(videoElement);

const progress = computed(() => (currentTime.value / duration.value) * 100 || 0);

const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="relative group bg-black aspect-video rounded-xl overflow-hidden shadow-2xl">
      <video 
        ref="videoElement"
        :src="video.url"
        class="w-full h-full object-contain"
        @click="togglePlay"
      ></video>
      
      <!-- Controls Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <!-- Progress Bar -->
          <div class="mb-4 relative h-1.5 bg-gray-600 rounded cursor-pointer group/progress" @click="(e) => seek((e.offsetX / (e.target as HTMLElement).clientWidth) * duration)">
              <div class="absolute h-full bg-red-600 rounded" :style="{ width: `${progress}%` }"></div>
              <div class="absolute h-3 w-3 bg-red-600 rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover/progress:opacity-100" :style="{ left: `${progress}%` }"></div>
          </div>

          <div class="flex items-center justify-between text-white">
              <div class="flex items-center gap-4">
                  <button @click="togglePlay">
                      <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  
                  <div class="flex items-center gap-2 group/vol">
                      <button @click="toggleMute">
                           <svg v-if="isMuted || volume === 0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                           <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                      </button>
                      <input 
                        type="range" min="0" max="1" step="0.1" 
                        :value="volume" 
                        @input="(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))"
                        class="w-0 overflow-hidden group-hover/vol:w-24 transition-all h-1 bg-white rounded-lg appearance-none cursor-pointer"
                      >
                  </div>
                  
                  <span class="text-sm font-medium">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
              </div>
              
              <div>
                  <button @click="toggleFullscreen">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  </button>
              </div>
          </div>
      </div>
  </div>
</template>
