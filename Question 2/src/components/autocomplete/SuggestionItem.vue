<script setup lang="ts">
import type { SearchResult } from '../../models/SearchResult';

defineProps<{
  item: SearchResult;
  active: boolean;
}>();
</script>

<template>
  <div 
    class="px-4 py-3 flex items-center gap-3 cursor-pointer transition-all"
    :class="active ? 'bg-blue-50' : 'hover:bg-gray-50'"
  >
    <!-- Icon / Avatar -->
    <div class="flex-shrink-0 w-10 flex justify-center">
      <img 
        v-if="item.image" 
        :src="item.image" 
        :alt="item.title"
        class="w-9 h-9 rounded-full object-cover border border-gray-100"
      />
      <div 
        v-else 
        class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
      >
        <svg v-if="item.type === 'text'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <svg v-else-if="item.type === 'group'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col flex-1 min-w-0">
      <span class="text-sm font-medium text-gray-900 truncate" v-html="item.title"></span>
      <span v-if="item.subtitle" class="text-xs text-gray-500 truncate">{{ item.subtitle }}</span>
    </div>
    
    <!-- Action/Arrow -->
    <div class="text-gray-300">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  </div>
</template>
