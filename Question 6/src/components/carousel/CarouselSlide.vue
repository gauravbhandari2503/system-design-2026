<script setup lang="ts">
import { Transition } from 'vue';

defineProps<{
  index: number;
  currentIndex: number;
  direction: 'left' | 'right';
}>();
</script>

<template>
  <Transition :name="direction === 'right' ? 'slide-right' : 'slide-left'">
    <div 
      v-show="currentIndex === index"
      class="absolute inset-0 w-full h-full"
    >
      <slot />
    </div>
  </Transition>
</template>

<style scoped>
/* Slide Right (Next) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.5s ease-in-out;
}
.slide-right-enter-from { transform: translateX(100%); }
.slide-right-leave-to { transform: translateX(-100%); }

/* Slide Left (Prev) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.5s ease-in-out;
}
.slide-left-enter-from { transform: translateX(-100%); }
.slide-left-leave-to { transform: translateX(100%); }
</style>
