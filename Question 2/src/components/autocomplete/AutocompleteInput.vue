<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSearch } from '../../composables/useSearch';
import SuggestionsList from './SuggestionsList.vue';
import type { SearchResult } from '../../models/SearchResult';

const props = defineProps<{
  placeholder?: string;
  autofocus?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', item: SearchResult): void;
}>();

const query = ref('');
const activeIndex = ref(-1);
const isFocused = ref(false);
const showSuggestions = ref(false); // To handle blur/focus behavior properly

const { results, loading, error, debouncedSearch } = useSearch();

// Watch query for search
watch(query, (newQuery) => {
  if (newQuery.trim().length > 0) {
    debouncedSearch(newQuery);
    showSuggestions.value = true;
    activeIndex.value = -1; // Reset active index on new search
  } else {
    showSuggestions.value = false;
  }
});

// Watch results to reset active index if needed
watch(results, () => {
  activeIndex.value = -1;
});

const handleSelect = (item: SearchResult) => {
  query.value = item.title;
  showSuggestions.value = false;
  emit('select', item);
  // Optional: refocus or blur
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!showSuggestions.value || results.value.length === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % results.value.length;
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeIndex.value = activeIndex.value <= 0 ? results.value.length - 1 : activeIndex.value - 1;
      break;
    case 'Enter':
      e.preventDefault();
      if (activeIndex.value >= 0) {
        handleSelect(results.value[activeIndex.value]);
      }
      break;
    case 'Escape':
      showSuggestions.value = false;
      break;
  }
};

const handleBlur = () => {
  // Small delay to allow click events on suggestions to register before closing
  setTimeout(() => {
    isFocused.value = false;
    showSuggestions.value = false;
  }, 200);
};

const handleFocus = () => {
  isFocused.value = true;
  if (query.value.trim().length > 0) {
    showSuggestions.value = true;
  }
};
</script>

<template>
  <div class="relative w-full max-w-2xl mx-auto" @keydown="handleKeydown">
    <!-- Search Input -->
    <div 
      class="relative flex items-center w-full h-14 rounded-2xl bg-white border-2 transition-all duration-300 shadow-sm"
      :class="isFocused ? 'border-blue-500 shadow-lg ring-4 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300'"
    >
      <!-- Search Icon -->
      <div class="pl-5 pr-3 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>

      <input
        v-model="query"
        type="text"
        :placeholder="placeholder || 'Search for anything...'"
        class="w-full h-full bg-transparent outline-none text-lg text-gray-800 placeholder-gray-400"
        :autofocus="autofocus"
        @focus="handleFocus"
        @blur="handleBlur"
        autocomplete="off"
      />

      <!-- Clear Button (visible when query exists) -->
      <button 
        v-if="query" 
        @click="query = ''; showSuggestions = false;"
        class="pr-4 text-gray-300 hover:text-gray-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
      </button>
    </div>

    <!-- Suggestions Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <SuggestionsList 
        v-if="showSuggestions && (loading || results.length > 0 || error)"
        :results="results"
        :loading="loading"
        :active-index="activeIndex"
        @select="handleSelect"
        @hover="(idx) => activeIndex = idx"
      />
    </Transition>
  </div>
</template>
