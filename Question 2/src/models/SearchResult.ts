export type ResultType = 'text' | 'user' | 'group' | 'page';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string; // Additional info like "@username" or "10k members"
  image?: string;    // Avatar or icon URL
  type: ResultType;
}
