<script setup lang="ts">
import type { User } from '../../composables/useCollaboration';

defineProps<{
  users: User[];
}>();
</script>

<template>
  <div class="flex items-center -space-x-2">
      <div 
        v-for="user in users" 
        :key="user.id"
        class="relative inline-block border-2 border-white rounded-full ring-2 ring-white hover:z-10 transition-transform hover:scale-110"
        :title="user.name"
      >
          <img :src="user.avatar" :alt="user.name" class="w-8 h-8 rounded-full">
          <span 
            class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400" 
          ></span>
      </div>
      
      <button class="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-xs font-bold hover:bg-gray-200 transition-colors">
          +
      </button>
  </div>
</template>
