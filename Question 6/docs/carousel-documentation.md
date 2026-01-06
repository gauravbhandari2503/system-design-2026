# Image Carousel Component Documentation

## Overview
The Image Carousel is a reusable, accessible, and responsive component built with Vue 3 and Tailwind CSS. It is designed to be content-agnostic, using slots to render any type of slide content (images, video, text).

## Architecture

### Directory Structure
```
src/
├── components/
│   ├── carousel/
│   │   ├── Carousel.vue        # Main Container & State Orchestrator
│   │   ├── CarouselSlide.vue   # Transition Handler
│   │   └── CarouselControls.vue # Navigation UI
├── composables/
│   └── useCarousel.ts          # Logic (State, Auto-play, Direction)
```

### 1. Logic Layer: `useCarousel`
The state logic is decoupled from the UI using a Vue Composable.
- **State**: `currentIndex`, `direction` ('left' | 'right').
- **Methods**: `next()`, `prev()`, `goto(index)`, `startAutoplay()`, `stopAutoplay()`.
- **Logic**: Handles cyclic indexing (looping from last to first) and determines transition direction based on navigation.

### 2. UI Layer: `Carousel.vue`
The container component that consumes the composable.
- **Props**:
  - `count`: Total number of slides (Required).
  - `interval`: Auto-play speed in ms (Default: 5000).
  - `autoplay`: Enable/Disable auto-play (Default: true).
- **Slots**:
  - `default`: Scoped slot exposing `currentIndex` and `direction`.
- **Accessibility**: Support for Keyboard Arrow keys and ARIA labels.

### 3. Transition Layer: `CarouselSlide.vue`
A wrapper component that handles the CSS transitions. It uses Vue's `<Transition>` to apply `transform` animations based on the `direction` content.

## Usage Example

```vue
<script setup>
import Carousel from './components/carousel/Carousel.vue';
import CarouselSlide from './components/carousel/CarouselSlide.vue';

const items = ['Slide 1', 'Slide 2'];
</script>

<template>
  <Carousel :count="items.length" :interval="3000">
    <template #default="{ currentIndex, direction }">
      <CarouselSlide 
        v-for="(item, index) in items" 
        :key="index"
        :index="index"
        :current-index="currentIndex"
        :direction="direction"
      >
        <div class="slide-content">{{ item }}</div>
      </CarouselSlide>
    </template>
  </Carousel>
</template>
```

## Accessibility Features
- **Keyboard Navigation**: Left/Right Arrow keys to navigate.
- **Focus Management**: The container is focusable (`tabindex="0"`).
- **Auto-play Control**: Pauses on hover to allow reading content without interruption.
