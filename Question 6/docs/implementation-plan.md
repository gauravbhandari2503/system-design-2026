# Image Carousel (Question 6) Implementation Plan

## Goal
Design a reusable, accessible Carousel component with custom transitions, autoplay support, and mobile-friendly touch interactions.

## Architecture

### Components
- **Carousel.vue**: Main container handling keyboard events, touch events (swipe), and slot rendering.
- **CarouselSlide.vue**: Applies Vue `<Transition>` classes based on direction.
- **CarouselControls.vue**: Navigation buttons and indicators.

### Logic (`useCarousel.ts`)
- **State**: `currentIndex`, `direction` ('left' | 'right').
- **Autoplay**: `setInterval` logic, paused on hover.

## Features for Phase 2 (Enhancements)

### 1. Touch & Swipe Support
- **Logic**: Use `touchstart`, `touchmove`, and `touchend` events in `Carousel.vue`.
- **Threshold**: Swipe distance must be > 50px to trigger navigation.
- **Feedback**: Optional: visual drag effect (transform: translateX) during swipe (advanced, maybe phase 3). For now, standard swipe-to-navigate.

### 2. Accessibility (ARIA)
- **Container**: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Content Slides"`.
- **Live Region**: `aria-live="polite"` to announce slide changes.
- **Controls**: `aria-label` for Next/Prev buttons, `aria-controls` pointing to the slide container.
