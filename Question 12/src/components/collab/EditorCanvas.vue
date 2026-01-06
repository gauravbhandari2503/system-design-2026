<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const editor = ref<HTMLElement | null>(null);

const onInput = (e: Event) => {
    emit('update:modelValue', (e.target as HTMLElement).innerHTML);
};

onMounted(() => {
    if (editor.value) editor.value.innerHTML = props.modelValue;
});
</script>

<template>
  <div 
    ref="editor"
    class="w-full min-h-[500px] p-12 bg-white shadow-sm border border-gray-200 outline-none prose max-w-none cursor-text"
    contenteditable="true"
    @input="onInput"
  ></div>
</template>
