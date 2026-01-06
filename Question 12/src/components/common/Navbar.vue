<script setup lang="ts">
import type { User } from '../../composables/useCollaboration';
import PresenceHeader from '../collab/PresenceHeader.vue';

defineProps<{
  users: User[];
}>();
</script>

<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
            <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
                <h1 class="text-sm font-semibold text-gray-900">Untitled Document</h1>
                <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <span>Help</span>
                    <span class="text-gray-300">|</span>
                    <span>Last edit was seconds ago</span>
                </div>
            </div>
        </div>
        
        <div class="flex items-center gap-4">
             <PresenceHeader :users="users" />
             <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 Share
             </button>
        </div>
    </div>
  </nav>
</template>
