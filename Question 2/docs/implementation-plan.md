# Autocomplete Component (Question 2) Implementation Plan

## Goal
Design a reusable Autocomplete/Typeahead component with debouncing, keyboard navigation, rich results, caching, grouping, and accessibility support.

## Architecture

### Components
- **AutocompleteInput.vue**: Smart input handling focus, keydown events, and debounce logic.
- **SuggestionsList.vue**: Renders the dropdown with Loading/Empty states and Group headers.
- **SuggestionItem.vue**: Polymorphic component rendering different templates based on result type (User vs Group vs Text).

### Logic (`useSearch.ts`)
- **Debounce**: 300ms delay on input.
- **Caching**: Simple Map-based cache to store results for previously executed queries to reduce API calls.
- **State**: `query`, `results`, `isLoading`, `selectedIndex`.

### Data Model
```typescript
type SearchResult = 
  | { type: 'user', id: string, name: string, avatar: string, subtitle?: string }
  | { type: 'group', id: string, name: string, memberCount: number, subtitle?: string }
  | { type: 'text', id: string, text: string, subtitle?: string };
```

## Features for Phase 2 (Enhancements)

### 1. Client-Side Caching
- **Logic**: In `useSearch.ts`, check a `cache` Map before calling `SearchService`.
- **Key**: Lowercase trimmed query string.
- **Limit**: Store up to 50 recent queries (LRU-like).

### 2. Highlighting
- **Logic**: Use a helper function `highlightMatch(text, query)` in `SuggestionItem.vue`.
- **Implementation**: Replace standard text rendering with `v-html` that wraps matching substrings in `<b>` tags. Sanitize input to prevent XSS.

### 3. Result Grouping
- **Logic**: Group the flat `results` array by `type` before rendering in `SuggestionsList.vue`.
- **Order**: Text suggestions first, then specific entities (Users, Groups).

### 4. Accessibility (ARIA)
- **Input**: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded="true/false"`, `aria-activedescendant="result-id"`.
- **List**: `role="listbox"`.
- **Option**: `role="option"`, `aria-selected="true/false"`.
