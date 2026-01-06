<script setup lang="ts">
defineProps<{
  currentFolder: string;
}>();

defineEmits<{
  (e: 'select', folder: string): void;
}>();

const folders = [
  { id: 'inbox', label: 'Inbox', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'sent', label: 'Sent', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
  { id: 'trash', label: 'Trash', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' }
];
</script>

<template>
  <div class="h-full bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-2">
    <button 
      @click="$emit('select', 'compose')"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg mb-4 flex items-center gap-2 transition-colors shadow-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>Compose</span>
    </button>

    <button
      v-for="folder in folders"
      :key="folder.id"
      :class="[
        'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
        currentFolder === folder.id 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-200'
      ]"
      @click="$emit('select', folder.id)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path :d="folder.icon" />
      </svg>
      {{ folder.label }}
    </button>
  </div>
</template>
