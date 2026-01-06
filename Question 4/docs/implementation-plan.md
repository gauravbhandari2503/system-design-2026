# Travel Booking Website (Question 4) Implementation Plan

## Goal
Implement a property search and booking flow, handling "Double Booking" race conditions via distributed lock simulation.

## Architecture

### Components
- **SearchBar.vue**: Floating header with Location, Date, Guests inputs.
- **PropertyList.vue**: Grid display of properties.
- **PropertyCard.vue**: Interactive card with Image Carousel and "Book" button.

### Logic (`useProperties.ts`)
- **Concurrency Handling**: 
  - `bookProperty()` calls API.
  - API simulates random `409 Conflict` (someone else booked it).
  - UI displays specific error message for conflicts.
- **Search**: Client-side filtering for demo purposes.

### Data Model
```typescript
interface Property {
  id: string;
  title: string;
  price: number;
  available: boolean;
  images: string[];
}
```
