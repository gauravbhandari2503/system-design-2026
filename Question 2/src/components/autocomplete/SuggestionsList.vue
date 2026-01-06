<script setup lang="ts">
import type { SearchResult } from '../../models/SearchResult';
import SuggestionItem from './SuggestionItem.vue';

defineProps<{
  results: SearchResult[];
  loading: boolean;
  activeIndex: number;
}>();

const emit = defineEmits<{
  (e: 'select', item: SearchResult): void;
  (e: 'hover', index: number): void; // For mouse hover to sync active index
}>();
</script>

<template>
  <div class="absolute w-full top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
    <!-- Loading State -->
    <div v-if="loading" class="p-4 flex items-center justify-center text-gray-400">
      <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-sm">Searching...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="results.length === 0" class="p-4 text-center text-gray-500 text-sm">
      No results found
    </div>

    <!-- Results List -->
    <ul v-else class="py-2">
      <li 
        v-for="(item, index) in results" 
        :key="item.id"
        @mouseenter="emit('hover', index)"
        @click="emit('select', item)"
      >
        <SuggestionItem 
          :item="item" 
          :active="index === activeIndex" 
        />
      </li>
    </ul>

    <!-- Footer -->
    <div class="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
      <div class="flex gap-2">
        <span>Use</span>
        <div class="flex gap-1">
           <kbd class="bg-white px-1 border border-gray-200 rounded text-gray-500">↑</kbd>
           <kbd class="bg-white px-1 border border-gray-200 rounded text-gray-500">↓</kbd>
        </div>
        <span>to navigate</span>
      </div>
      <div class="flex gap-1">
         <span>Press</span>
         <kbd class="bg-white px-1 border border-gray-200 rounded text-gray-500">Enter</kbd>
      </div>
    </div>
  </div>
</template>
