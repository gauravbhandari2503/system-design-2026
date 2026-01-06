import { ref } from 'vue';
import { SearchService } from '../api/search';
import type { SearchResult } from '../models/SearchResult';
import { debounce } from '../utils/debounce';

export function useSearch(debounceTime: number = 300) {
  const results = ref<SearchResult[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const executeSearch = async (query: string) => {
    if (!query.trim()) {
      results.value = [];
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      results.value = await SearchService.search(query);
    } catch (err) {
      error.value = 'Failed to fetch results';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const debouncedSearch = debounce(executeSearch, debounceTime);

  return {
    results,
    loading,
    error,
    debouncedSearch,
    executeSearch // Exposing raw function if needed
  };
}
