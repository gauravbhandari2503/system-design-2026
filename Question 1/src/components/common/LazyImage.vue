<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  src: string;
  alt: string;
  placeholder?: string;
}>();

const imgRef = ref<HTMLImageElement | null>(null);
const isLoaded = ref(false);
const hasError = ref(false);
const currentSrc = ref(props.placeholder || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'); // Transparent 1x1 GIF

let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!imgRef.value) return;

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadImage();
        observer?.disconnect();
      }
    });
  }, {
    rootMargin: '200px' // Load when image is 200px away from viewport
  });

  observer.observe(imgRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});

const loadImage = () => {
  const img = new Image();
  img.src = props.src;
  
  img.onload = () => {
    currentSrc.value = props.src;
    isLoaded.value = true;
  };
  
  img.onerror = () => {
    hasError.value = true;
  };
};
</script>

<template>
  <div class="relative w-full h-full bg-gray-100 overflow-hidden">
    <!-- Placeholder / Blur effect -->
    <div 
        v-if="!isLoaded && !hasError" 
        class="absolute inset-0 bg-gray-200 animate-pulse"
    ></div>

    <img 
      ref="imgRef"
      :src="currentSrc" 
      :alt="alt"
      class="w-full h-full object-cover transition-opacity duration-500 will-change-opacity"
      :class="{ 'opacity-0': !isLoaded, 'opacity-100': isLoaded }"
    >
    
    <!-- Error State -->
    <div v-if="hasError" class="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    </div>
  </div>
</template>
