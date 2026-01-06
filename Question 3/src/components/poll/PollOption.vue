<script setup lang="ts">
import type { PollOption } from '../../models/Poll';

defineProps<{
  option: PollOption;
  showResults: boolean;
  percentage: number;
  voting: boolean; // if true, disable interaction
  isVotedByMe: boolean; // if true, highlight this option
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();
</script>

<template>
  <button 
    class="relative w-full text-left p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden group"
    :class="[
      showResults 
        ? (isVotedByMe ? 'border-blue-500' : 'border-gray-200') 
        : 'hover:bg-gray-50 border-gray-200 hover:border-gray-300 active:scale-[0.99] cursor-pointer'
    ]"
    @click="!showResults && !voting && emit('select', option.id)"
    :disabled="showResults || voting"
  >
    <!-- Progress Bar Background (Results Mode) -->
    <div 
      class="absolute inset-y-0 left-0 bg-blue-100 transition-all duration-1000 ease-out z-0"
      :style="{ width: showResults ? `${percentage}%` : '0%' }"
    ></div>

    <!-- Content Layer -->
    <div class="relative z-10 flex items-center justification-between w-full">
      <div class="flex items-center gap-4 flex-1">
        <!-- Radio Circle (Voting Mode Only) -->
        <div 
          v-if="!showResults"
          class="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center transition-colors group-hover:border-blue-400"
        >
        </div>

        <!-- Label -->
        <span class="font-medium text-gray-900 text-lg transition-colors">
          {{ option.label }}
        </span>
        
        <!-- 'You' Badge -->
        <span 
          v-if="showResults && isVotedByMe" 
          class="text-xs bg-white/80 text-blue-700 px-2 py-0.5 rounded-full font-bold shadow-sm"
        >
          YOU
        </span>
      </div>

      <!-- Percentage (Results Mode Only) -->
      <Transition name="fade">
        <span v-if="showResults" class="font-bold text-gray-700 tabular-nums">
          {{ percentage }}%
        </span>
      </Transition>
    </div>
  </button>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease 0.2s; /* Delay fade in slightly */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
