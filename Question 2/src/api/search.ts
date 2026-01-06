import type { SearchResult } from '../models/SearchResult';

// Mock Data
const DATA: SearchResult[] = [
  { id: '1', title: 'Google', subtitle: 'Search Engine', type: 'text' },
  { id: '2', title: 'Google Maps', subtitle: 'Navigation', type: 'text' },
  { id: '3', title: 'Google Drive', subtitle: 'Cloud Storage', type: 'text' },
  { id: '4', title: 'Gaurav Gupta', subtitle: '@gaurav', image: 'https://i.pravatar.cc/150?u=1', type: 'user' },
  { id: '5', title: 'Frontend Systems', subtitle: 'Global Group • 12k members', image: 'https://picsum.photos/seed/tech/200', type: 'group' },
  { id: '6', title: 'System Design', subtitle: 'Course', type: 'text' },
  { id: '7', title: 'Vue.js Developers', subtitle: 'Community • 50k members', image: 'https://picsum.photos/seed/vue/200', type: 'group' },
  { id: '8', title: 'Alice Smith', subtitle: '@alice', image: 'https://i.pravatar.cc/150?u=2', type: 'user' },
  { id: '9', title: 'React vs Vue', subtitle: 'Article', type: 'text' },
  { id: '10', title: 'Design Patterns', subtitle: 'Book', type: 'text' },
];

export const SearchService = {
  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) return [];

    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const results = DATA.filter(item => 
          item.title.toLowerCase().includes(lowerQuery) || 
          (item.subtitle && item.subtitle.toLowerCase().includes(lowerQuery))
        );
        resolve(results);
      }, 400); // Simulate network latency
    });
  }
};
