<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'input', event: Event): void;
}>();

const editor = ref<HTMLElement | null>(null);

defineExpose({ editor });

const onInput = (e: Event) => {
    emit('update:modelValue', (e.target as HTMLElement).innerHTML);
    emit('input', e);
};

onMounted(() => {
    if (editor.value) {
        editor.value.innerHTML = props.modelValue;
    }
});
</script>

<template>
  <div 
    ref="editor"
    class="flex-1 p-8 outline-none prose max-w-none overflow-y-auto"
    contenteditable="true"
    @input="onInput"
  ></div>
</template>

<style scoped>
/* Prose overrides for better editor feel */
:deep(p) { margin-top: 0.5em; margin-bottom: 0.5em; }
:deep(ul), :deep(ol) { margin-top: 0; margin-bottom: 0; }
</style>
