# Design System Architecture - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Design Tokens (The Foundation)](#design-tokens-the-foundation)
3. [Architecture: Headless vs. Styled](#architecture-headless-vs-styled)
4. [Component Composition Patterns](#component-composition-patterns)
5. [Theming Engine](#theming-engine)
6. [Versioning & Distribution](#versioning--distribution)
7. [Documentation Strategy](#documentation-strategy)
8. [Accessibility (A11y) at System Level](#accessibility-a11y-at-system-level)
9. [Real-World Examples](#real-world-examples)

---

## Introduction

A Design System is more than a UI library; it's the _infrastructure_ that connects design and engineering. It ensures consistency, speed, and quality across an organization's products.

### The Ecosystem

1.  **Style Guide**: Visual principles (Colors, Typography).
2.  **Component Library**: Coded implementations (Buttons, Inputs).
3.  **Pattern Library**: Combinations of components (Forms, Cards).
4.  **Governance**: Rules on how to contribute and use.

---

## Design Tokens (The Foundation)

Tokens are platform-agnostic variables that store design decisions. They are the single source of truth.

### Token Tiers

1.  **Primitive (Global)**: Raw values. `blue-500: #3b82f6`
2.  **Semantic (Alias)**: Context-based names. `color-action-primary: {blue-500}`
3.  **Component (Specific)**: Specific overrides. `button-bg-primary: {color-action-primary}`

```json
// ============================================
// tokens.json
// ============================================

{
  "global": {
    "color": {
      "blue": {
        "500": { "value": "#3b82f6" }
      },
      "red": {
        "500": { "value": "#ef4444" }
      }
    },
    "spacing": {
      "small": { "value": "8px" },
      "medium": { "value": "16px" }
    }
  },
  "semantic": {
    "primary": { "value": "{global.color.blue.500}" },
    "error": { "value": "{global.color.red.500}" },
    "radius": { "value": "{global.spacing.small}" }
  }
}
```

**Build Process**: Use tools like **Style Dictionary** to transform this JSON into:

- CSS Variables (`--color-primary: #3b82f6`)
- JS Constants (`const COLOR_PRIMARY = '#3b82f6'`)
- iOS/Android resources.

---

## Architecture: Headless vs. Styled

A major trend is separating **Behavior** (Hook/State) from **Presentation** (Styles).

### Headless Components (Logic Only)

Libraries like `Radix UI` or `Headless UI` provide the logic and a11y, leaving styling to you.

```vue
<!-- Headless Toggle (Logic) -->
<script setup>
import { SwitchRoot, SwitchThumb } from "radix-vue";
</script>

<template>
  <SwitchRoot class="toggle-root">
    <SwitchThumb class="toggle-thumb" />
  </SwitchRoot>
</template>
```

### Styled Wrapper

You wrap the headless component with your Design System's classes/styles.

```vue
<style scoped>
.toggle-root {
  @apply w-10 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-blue-600;
}
.toggle-thumb {
  @apply w-4 h-4 bg-white rounded-full transition-transform translate-x-1 data-[state=checked]:translate-x-5;
}
</style>
```

---

## Component Composition Patterns

Design systems fail when they are too rigid. Use composition to allow flexibility.

### 1. Slots / Children (Flexible Content)

```vue
<!-- ❌ Rigid -->
<Card title="Hello" content="World" />

<!-- ✅ Flexible -->
<Card>
  <template #header>
    <h1>Hello</h1>
  </template>
  <p>World</p>
  <Button>Click me</Button>
</Card>
```

### 2. Polymorphism (As Prop)

Allow a component to render as a different HTML tag.

```vue
<!-- Renders as <button> -->
<Button>Click me</Button>

<!-- Renders as <a> -->
<Button as="a" href="/link">I am a link</Button>
```

---

## Theming Engine

How to support Light/Dark mode or multiple brands (e.g., Enterprise vs Consumer).

### CSS Variables Strategy

The most performant way. Swapping the class on the `<body>` instantly repaints the page without JS calculation.

```css
/* theme-default.css */
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

/* theme-dark.css */
[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #ffffff;
}

/* usage */
.card {
  background: var(--color-bg);
  color: var(--color-text);
}
```

---

## Versioning & Distribution

### Monorepo Structure

Use a Monorepo (pnpm workspace/Turborepo) to manage multiple packages.

```
/packages
  /tokens       # Published as @sys/tokens
  /icons        # Published as @sys/icons
  /react        # Published as @sys/react (consumers use this)
  /vue          # Published as @sys/vue
/apps
  /docs         # Storybook/Documentation
```

### Changesets

Automate semantic versioning. If you change a button, `changesets` detects it, bumps the version from `1.0.1` to `1.1.0` (if feature) or `2.0.0` (if breaking), and generates the Changelog.

---

## Documentation Strategy

A component without documentation doesn't exist.

**Tools**: Storybook is the industry standard.

**What to Document:**

1.  **Playground**: Interactive knobs (change props live).
2.  **Usage Guidelines**: "Do" vs "Don't" examples.
3.  **Accessibility**: Audit badges.
4.  **Code Snippets**: Copy-paste ready code.

```typescript
// Button.stories.ts
import { Button } from "./Button";

export default {
  title: "Core/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger"],
    },
  },
};

export const Primary = {
  args: {
    variant: "primary",
    children: "Click Me",
  },
};
```

---

## Accessibility (A11y) at System Level

Solve A11y once in the system, so every consumer benefits.

1.  **Focus Management**: Built-in outline styles for all interactive elements.
2.  **Keyboard Nav**: Dropdowns/Modals handle Escape/Arrow keys automatically.
3.  **Contrast Checks**: Semantic tokens ensure that `text-on-primary` always has sufficient contrast against `bg-primary`.

---

## Real-World Examples

- **Material UI (Google)**: Highly opinionated, heavy ripple effects.
- **Chakra UI**: styled-system based, developer experience focused.
- **Radix UI**: Headless, focuses purely on accessibility and logic.
- **Tailwind UI**: Copy-paste HTML/React patterns (not a package).
