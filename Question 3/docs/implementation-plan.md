# Poll Widget (Question 3) Implementation Plan

## Goal
Create an interactive Poll Widget with optimistic UI updates and Instagram-style result transitions.

## Architecture

### Components
- **PollWidget.vue**: Main container fetching data and managing view state (Voting vs Results).
- **PollOption.vue**: Hybrid component acting as a Button (Voting state) or Progress Bar (Results state).
- **Animations**: CSS transitions for width and opacity.

### Logic (`usePoll.ts`)
- **Optimistic UI**: Immediately update local state on vote, then sync with backend.
- **Persistence**: Store vote status to prevent re-voting (simulated).

### Data Model
```typescript
interface PollOption {
  id: string;
  label: string;
  votes: number;
  percent: number; // Computed
}
```
