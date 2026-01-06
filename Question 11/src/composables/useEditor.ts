import { ref, onMounted, onUnmounted } from 'vue';

export function useEditor() {
  const editorRef = ref<HTMLElement | null>(null);
  const content = ref('<p>Start typing...</p>');
  const activeFormats = ref<string[]>([]);

  const exec = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      editorRef.value?.focus();
      updateActiveFormats();
  };

  const updateActiveFormats = () => {
      const formats = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight'];
      activeFormats.value = formats.filter(cmd => document.queryCommandState(cmd));
  };

  const onInput = (e: Event) => {
      const target = e.target as HTMLElement;
      content.value = target.innerHTML;
  };

  onMounted(() => {
      document.addEventListener('selectionchange', updateActiveFormats);
  });

  onUnmounted(() => {
      document.removeEventListener('selectionchange', updateActiveFormats);
  });

  return {
      editorRef,
      content,
      activeFormats,
      exec,
      onInput,
      updateActiveFormats
  };
}
