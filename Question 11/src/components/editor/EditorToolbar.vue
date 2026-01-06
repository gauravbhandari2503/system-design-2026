<script setup lang="ts">
defineProps<{
  activeFormats: string[];
}>();

const emit = defineEmits<{
  (e: 'exec', command: string, value?: string): void;
}>();

const buttons = [
  { icon: 'B', command: 'bold', label: 'Bold', class: 'font-bold' },
  { icon: 'I', command: 'italic', label: 'Italic', class: 'italic' },
  { icon: 'U', command: 'underline', label: 'Underline', class: 'underline' },
  { type: 'separator' },
  { icon: 'H1', command: 'formatBlock', value: 'H1', label: 'Heading 1', class: 'font-bold text-sm' },
  { icon: 'H2', command: 'formatBlock', value: 'H2', label: 'Heading 2', class: 'font-bold text-xs' },
  { type: 'separator' },
  { icon: '•', command: 'insertUnorderedList', label: 'Bullet List', class: 'text-lg' },
  { icon: '1.', command: 'insertOrderedList', label: 'Ordered List', class: 'text-xs' },
  { type: 'separator' },
  { icon: '←', command: 'justifyLeft', label: 'Align Left' },
  { icon: '↔', command: 'justifyCenter', label: 'Align Center' },
  { icon: '→', command: 'justifyRight', label: 'Align Right' },
];
</script>

<template>
  <div class="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
    <template v-for="(btn, i) in buttons" :key="i">
        <div v-if="btn.type === 'separator'" class="w-px h-6 bg-gray-300 mx-1"></div>
        
        <button 
            v-else
            @click="emit('exec', btn.command!, btn.value)"
            class="p-2 rounded hover:bg-white hover:shadow-sm min-w-[32px] flex items-center justify-center transition-all"
            :class="[
                activeFormats.includes(btn.command!) ? 'bg-white shadow text-blue-600' : 'text-gray-600',
                btn.class
            ]"
            :title="btn.label"
        >
            {{ btn.icon }}
        </button>
    </template>
  </div>
</template>
