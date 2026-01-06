# Image Carousel (Question 6) Implementation Plan

## Goal
Design a reusable, accessible Carousel component with custom transitions and autoplay support.

## Architecture

### Components
- **Carousel.vue**: Main container handling keyboard events and slot rendering.
- **CarouselSlide.vue**: Applies Vue `<Transition>` classes based on direction.
- **CarouselControls.vue**: Navigation buttons and indicators.

### Logic (`useCarousel.ts`)
- **State**: `currentIndex`, `direction` ('left' | 'right').
- **Autoplay**: `setInterval` logic, paused on hover.

### Data Model
The component is agnostic to data, accepting arbitrary content via slots.
