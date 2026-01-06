<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue';
import { useScrollLock } from '../../composables/useScrollLock';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>(), {
  size: 'md',
  title: ''
});

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'close'): void;
}>();

const { lock, unlock } = useScrollLock();

const close = () => {
  emit('update:isOpen', false);
  emit('close');
};

// Handle Scroll Lock
watch(() => props.isOpen, (val) => {
  if (val) lock();
  else unlock();
});

// Handle ESC key
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  if (props.isOpen) lock();
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  unlock();
});

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          @click="close"
          aria-hidden="true"
        ></div>

        <!-- Modal Panel -->
        <div 
          class="relative w-full bg-white rounded-xl shadow-2xl transform transition-all flex flex-col max-h-[90vh] overflow-hidden"
          :class="sizeClasses[size]"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">
              <slot name="header">{{ title }}</slot>
            </h3>
            <button 
              @click="close"
              class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 overflow-y-auto">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
             <slot name="footer" :close="close" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .transform,
.fade-leave-active .transform {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from .transform {
  transform: scale(0.95) translateY(10px);
}
.fade-leave-to .transform {
  transform: scale(0.95) translateY(10px);
}
</style>
