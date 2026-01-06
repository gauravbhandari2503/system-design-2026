<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = withDefaults(defineProps<{
  loading: boolean;
  hasMore: boolean;
  threshold?: number;
}>(), {
  threshold: 0.1
});

const emit = defineEmits<{
  (e: 'load-more'): void
}>();

const observerTarget = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && props.hasMore && !props.loading) {
        emit('load-more');
      }
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: props.threshold,
    }
  );

  if (observerTarget.value) {
    observer.observe(observerTarget.value);
  }
};

onMounted(() => {
  setupObserver();
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});

// Re-observe if target changes or component updates significantly
watch(() => props.hasMore, (newVal) => {
  if (newVal && observerTarget.value && observer) {
    // Ensuring observer is active
    observer.unobserve(observerTarget.value);
    observer.observe(observerTarget.value);
  }
});
</script>

<template>
  <div class="infinite-scroll-container">
    <!-- List Content -->
    <slot></slot>

    <!-- Observer Target & States -->
    <div ref="observerTarget" class="py-4 flex justify-center">
      <slot name="loading" v-if="loading">
        <div class="flex items-center gap-2 text-gray-500">
          <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Loading more...</span>
        </div>
      </slot>
      
      <slot name="no-more" v-else-if="!hasMore">
        <div class="text-gray-400 text-sm">
          No more items to load.
        </div>
      </slot>
    </div>
  </div>
</template>
