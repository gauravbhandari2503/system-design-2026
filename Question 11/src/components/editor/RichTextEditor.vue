<script setup lang="ts">
import EditorToolbar from './EditorToolbar.vue';
import EditorContent from './EditorContent.vue';
import { useEditor } from '../../composables/useEditor';
import { watch } from 'vue';

const { editorRef, content, activeFormats, exec, onInput } = useEditor();

// Connect ref
watch(editorRef, (el) => {
    // expose to composable logic if needed later
});
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      <EditorToolbar :active-formats="activeFormats" @exec="exec" />
      <EditorContent 
        ref="editorRef"
        v-model="content"
        @input="onInput"
      />
      <div class="bg-gray-50 border-t border-gray-200 p-2 text-xs text-gray-400 font-mono">
          {{ content.length }} characters
      </div>
  </div>
</template>
