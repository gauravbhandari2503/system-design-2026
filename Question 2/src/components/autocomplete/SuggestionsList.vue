<script setup lang="ts">
import type { SearchResult } from '../../models/SearchResult';
import SuggestionItem from './SuggestionItem.vue';

const props = defineProps<{
  results: SearchResult[];
  loading: boolean;
  activeIndex: number;
  query: string;
}>();

const emit = defineEmits<{
  (e: 'select', item: SearchResult): void;
  (e: 'hover', index: number): void;
}>();

import { computed } from 'vue';

const groupedResults = computed(() => {
  const groups: Record<string, SearchResult[]> = {
    'Suggestions': [],
    'People': [],
    'Groups': []
  };
  
  props.results.forEach(item => {
    if (item.type === 'user') groups['People'].push(item);
    else if (item.type === 'group') groups['Groups'].push(item);
    else groups['Suggestions'].push(item);
  });
  
  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, items]) => items.length > 0)
  );
});

// Helper to find absolute index in the flat results array
const getOriginalIndex = (item: SearchResult) => {
  return props.results.findIndex(r => r.id === item.id);
};
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

    <!-- Results List (Grouped) -->
    <div 
      v-else 
      class="py-2 max-h-[400px] overflow-y-auto"
      role="listbox"
    >
      <template v-for="(group, groupName) in groupedResults" :key="groupName">
        <!-- Group Header (if mixed types) -->
        <div v-if="Object.keys(groupedResults).length > 1 && group.length > 0" class="px-4 py-1 text-xs font-semibold text-gray-400 bg-gray-50/50 uppercase tracking-wider">
          {{ groupName }}
        </div>
        
        <ul>
          <li 
            v-for="(item, index) in group" 
            :key="item.id"
            @mouseenter="emit('hover', getOriginalIndex(item))"
            @click="emit('select', item)"
            role="option"
            :aria-selected="getOriginalIndex(item) === activeIndex"
            :id="`suggestion-${getOriginalIndex(item)}`"
          >
            <SuggestionItem 
              :item="item" 
              :query="query"
              :active="getOriginalIndex(item) === activeIndex" 
            />
          </li>
        </ul>
      </template>
    </div>

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
