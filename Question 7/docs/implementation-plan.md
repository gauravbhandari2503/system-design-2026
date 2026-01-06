# Modal/Dialog Component (Question 7) Implementation Plan

## Goal
Implement a production-grade Modal component handling stacking, scrolling, and focus management.

## Architecture

### Components
- **Modal.vue**: 
  - Uses `Teleport` to `body`.
  - Manages `z-index` stacking.
  - Listeners for `ESC` key and Backdrop click.
  - Slots: `header`, `default` (body), `footer`.

### Logic (`useScrollLock.ts`)
- **Scroll Locking**: Toggles `overflow: hidden` on `document.body` when modal is open to prevent background scrolling.

### Props
- `isOpen`: boolean
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `title`: string (optional)
