# Autocomplete Component (Question 2) Implementation Plan

## Goal
Design a reusable Autocomplete/Typeahead component with debouncing, keyboard navigation, and rich results.

## Architecture

### Components
- **AutocompleteInput.vue**: Smart input handling focus, keydown events, and debounce logic.
- **SuggestionsList.vue**: Renders the dropdown with Loading/Empty states.
- **SuggestionItem.vue**: Polymorphic component rendering different templates based on result type (User vs Group vs Text).

### Logic (`useSearch.ts`)
- **Debounce**: 300ms delay on input.
- **State**: `query`, `results`, `isLoading`, `selectedIndex`.

### Data Model
```typescript
type SearchResult = 
  | { type: 'user', id: string, name: string, avatar: string }
  | { type: 'group', id: string, name: string, memberCount: number }
  | { type: 'text', id: string, text: string };
```
