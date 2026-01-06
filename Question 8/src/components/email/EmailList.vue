<script setup lang="ts">
import type { Email } from '../../models/Email';

defineProps<{
  emails: Email[];
  selectedId: string | null;
  loading: boolean;
}>();

defineEmits<{
  (e: 'select', id: string): void;
}>();
</script>

<template>
  <div class="h-full flex flex-col bg-white border-r border-gray-200">
    <!-- Search Bar (Placeholder) -->
    <div class="p-4 border-b border-gray-100">
        <input 
            type="text" 
            placeholder="Search mail" 
            class="w-full bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400">
      <div class="flex flex-col items-center gap-2">
         <span class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></span>
         <span class="text-xs">Loading...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="emails.length === 0" class="flex-1 flex items-center justify-center text-gray-400 text-sm">
      No messages found.
    </div>

    <!-- Email List -->
    <div v-else class="flex-1 overflow-y-auto">
      <div 
        v-for="email in emails" 
        :key="email.id"
        @click="$emit('select', email.id)"
        :class="[
          'p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors select-none',
          selectedId === email.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent',
          !email.read ? 'font-semibold' : 'text-gray-600'
        ]"
      >
        <div class="flex justify-between items-baseline mb-1">
          <h4 :class="[
              'truncate max-w-[70%] text-sm',
              !email.read ? 'text-gray-900' : 'text-gray-700'
          ]">
            {{ email.from }}
          </h4>
          <span class="text-xs text-gray-400 shrink-0">{{ email.date }}</span>
        </div>
        <div class="text-sm mb-1 truncate" :class="!email.read ? 'text-gray-800' : 'text-gray-500'">{{ email.subject }}</div>
        <p class="text-xs text-gray-400 truncate">{{ email.body }}</p>
      </div>
    </div>
  </div>
</template>
