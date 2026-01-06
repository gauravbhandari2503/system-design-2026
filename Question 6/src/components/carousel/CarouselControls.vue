<script setup lang="ts">
defineProps<{
  total: number;
  current: number;
}>();

defineEmits<{
  (e: 'prev'): void;
  (e: 'next'): void;
  (e: 'goto', index: number): void;
}>();
</script>

<template>
  <!-- Prev/Next Buttons -->
  <button 
    class="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
    aria-label="Previous slide"
    @click="$emit('prev')"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  </button>

  <button 
    class="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
    aria-label="Next slide"
    @click="$emit('next')"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  </button>

  <!-- Indicators -->
  <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
    <button
      v-for="i in total"
      :key="i"
      :class="[
        'w-2.5 h-2.5 rounded-full transition-all',
        current === i - 1 ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
      ]"
      :aria-label="`Go to slide ${i}`"
      @click="$emit('goto', i - 1)"
    />
  </div>
</template>
