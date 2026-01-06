import { ref } from 'vue';
import { SearchService } from '../api/search';
import type { SearchResult } from '../models/SearchResult';
import { debounce } from '../utils/debounce';

export function useSearch(debounceTime: number = 300) {
  const results = ref<SearchResult[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Simple LRU-like cache
  const cache = new Map<string, SearchResult[]>();
  const MAX_CACHE_SIZE = 50;

  const executeSearch = async (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    
    if (!trimmedQuery) {
      results.value = [];
      return;
    }

    // Check cache first
    if (cache.has(trimmedQuery)) {
      results.value = cache.get(trimmedQuery)!;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const data = await SearchService.search(query);
      results.value = data;
      
      // Update cache
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      cache.set(trimmedQuery, data);
      
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
    executeSearch
  };
}
