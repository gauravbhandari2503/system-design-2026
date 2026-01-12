# Accessibility & Internationalization - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [ARIA & Semantic HTML](#aria--semantic-html)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Screen Reader Support](#screen-reader-support)
5. [Focus Management](#focus-management)
6. [Color & Contrast](#color--contrast)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Localization (l10n)](#localization-l10n)
9. [RTL (Right-to-Left) Support](#rtl-right-to-left-support)
10. [Date, Time & Number Formatting](#date-time--number-formatting)
11. [Accessibility Testing](#accessibility-testing)
12. [Real-World Examples](#real-world-examples)
13. [Best Practices](#best-practices)

---

## Introduction

Building a global-ready application means ensuring it works for _everyone_, regardless of their physical abilities or geographical location. Accessibility (a11y) and Internationalization (i18n) are often treated as afterthoughts, but retrofitting them is painful.

### Core Principles

- **POUR**: Perceivable, Operable, Understandable, Robust (WCAG Principles).
- **Semantic First**: Use native HTML elements whenever possible. They come with built-in accessibility.
- **Separation of Content and Structure**: Keep text strings separate from code to make translation easier.

---

## ARIA & Semantic HTML

**Semantic HTML** gives meaning to your content. A `<button>` communicates "I am clickable" to assistive technology. A `<div>` says nothing.

**ARIA (Accessible Rich Internet Applications)** provides extra labels for complex widgets (like tabs, modals, sliders) that native HTML can't describe fully.

### 1. Semantic HTML First

**Rule of Thumb**: The First Rule of ARIA is "Don't use ARIA" if a native HTML element already does the job.

```html
<!-- ❌ Bad: Re-inventing the wheel without accessibility -->
<div class="button" onclick="doSomething()">Click Me</div>

<!-- ✅ Good: Native element handles keyboard focus and screen readers automatically -->
<button @click="doSomething">Click Me</button>

<!-- ❌ Bad: Meaningless structure -->
<div class="nav">
  <div class="nav-item">Home</div>
</div>

<!-- ✅ Good: Landmarks help screen reader users jump to sections -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>
```

### 2. ARIA Roles, States, and Properties

When you build a custom component (like a Tab system), you must manually tell the screen reader what it is (`role`), what state it's in (`aria-selected`), and how it relates to other elements (`aria-controls`).

```vue
<template>
  <!-- Tab Interface: A complex widget requiring manual ARIA management -->
  <div class="tabs">
    <div role="tablist" aria-label="Content sections">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :id="`tab-${tab.id}`"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="activeTab === tab.id ? 0 : -1"
        @click="activeTab = tab.id"
        @keydown="handleTabKeydown"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      v-for="tab in tabs"
      :key="tab.id"
      :id="`panel-${tab.id}`"
      role="tabpanel"
      :aria-labelledby="`tab-${tab.id}`"
      :hidden="activeTab !== tab.id"
      :tabindex="0"
    >
      {{ tab.content }}
    </div>
  </div>
</template>

<script setup>
// Keydown handler implements "Roving Tabindex"
// User presses Arrow keys to move focus between tabs
function handleTabKeydown(event) {
  // Logic to move focus...
}
</script>
```

### 3. ARIA Labels and Descriptions

Sometimes text isn't enough, or there is no text at all (icon buttons).

- `aria-label`: Overrides text content. Essential for icon-only buttons.
- `aria-labelledby`: Points to another element that serves as the label (e.g., a modal title).
- `aria-describedby`: Points to detailed help text (e.g., error messages).

```vue
<template>
  <!-- Input with error description -->
  <label for="email">Email Address</label>
  <input
    id="email"
    v-model="email"
    type="email"
    aria-required="true"
    :aria-invalid="!isEmailValid"
    :aria-describedby="emailError ? 'email-error' : undefined"
  />
  <span v-if="emailError" id="email-error" role="alert">
    {{ emailError }}
  </span>

  <!-- Icon-only button needs a label -->
  <button aria-label="Search" @click="search">
    <svg aria-hidden="true" focusable="false">
      <use href="#search-icon" />
    </svg>
  </button>
</template>
```

---

## Keyboard Navigation

Many users (motor impairments, power users) rely solely on the keyboard.

### 1. Focus Order and Tab Navigation

The "Tab" key moves focus through interactive elements. The order should be logical (usually top-left to bottom-right).

- `tabindex="0"`: Inserts a non-interactive element (like a custom card) into the tab sequence.
- `tabindex="-1"`: Removes an element from tab sequence but allows programmatic focus (e.g., for modals).

```vue
<template>
  <div class="form">
    <!-- Skip Links allow users to jump over repeated headers/nav -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <input type="text" placeholder="First" />
    <button>Submit</button>
  </div>
</template>
```

### 2. Focus Trap (Modals)

When a modal opens, focus **must** stay inside the modal. If a user presses Tab and focus drifts to the background page behind the modal, it's a critical failure.

```javascript
// composables/useFocusTrap.js
export function useFocusTrap(containerRef, isActive) {
  watch(isActive, (active) => {
    if (active) {
      // 1. Save currently focused element
      // 2. Move focus into modal
      // 3. Listen for Tab key to loop focus inside modal
    } else {
      // Restore focus to original element when closed
    }
  });
}
```

---

## Screen Reader Support

### 1. Live Regions

Dynamic content updates (like chat messages or toast notifications) happen visually, but a screen reader user doesn't know. **Live Regions** announce these changes.

- `aria-live="polite"`: Waits for the user to finish what they are doing before announcing (e.g., "Message sent").
- `aria-live="assertive"`: Interrupts the user immediately (e.g., "Connection Lost").

```vue
<template>
  <!-- Toast Notification -->
  <div role="status" aria-live="polite">
    {{ statusMessage }}
  </div>

  <!-- Critical Error -->
  <div role="alert" aria-live="assertive">
    {{ errorMessage }}
  </div>
</template>
```

### 2. Visually Hidden Content

Sometimes you want text available _only_ to screen readers, like adding context to a "Read More" button.

```css
/* Proven generic accessible hiding class */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
```

```vue
<button>
  Read More <span class="visually-hidden">about our pricing plans</span>
</button>
```

---

## Color & Contrast

### 1. Don't Rely on Color Alone

Color blindness affects ~8% of men. If an error state is only indicated by a red border, they can't see it. **Always use an icon or text label along with color.**

```vue
<!-- ❌ Bad: Color only -->
<span class="text-red-500">Active</span>

<!-- ✅ Good: Color + Icon -->
<span class="text-green-500 flex items-center">
  <IconCheck aria-hidden="true" />
  <span>Active</span>
</span>
```

### 2. High Contrast Mode

Users may override your colors with system-level high contrast themes.

```css
/* Media query to detect high contrast preference */
@media (prefers-contrast: high) {
  :focus {
    /* Use 'currentColor' to adapt to user's theme choice */
    outline: 3px solid currentColor;
  }
}
```

---

## Internationalization (i18n)

### 1. Basic Setup (Vue I18n)

Never hardcode strings. Use translation keys.

```javascript
// i18n/config.js
import { createI18n } from "vue-i18n";

const messages = {
  en: {
    welcome: "Welcome, {name}",
    notifications:
      "You have {count} notification | You have {count} notifications",
  },
  es: {
    welcome: "Bienvenido, {name}",
    notifications:
      "Tienes {count} notificación | Tienes {count} notificaciones",
  },
};

export const i18n = createI18n({
  locale: "en",
  messages,
});
```

### 2. Pluralization & Interpolation

Different languages have complex pluralization rules (e.g., Arabic has 6 plural forms). Use libraries to handle this.

```vue
<template>
  <!-- Interpolation -->
  <p>{{ $t("welcome", { name: user.name }) }}</p>

  <!-- Pluralization -->
  <p>{{ $tc("notifications", notificationCount) }}</p>
</template>
```

---

## Localization (l10n)

### 1. Date & Number Formatting

Don't format dates manually (`MM/DD/YYYY`). Use `Intl.DateTimeFormat`.

**USA**: 12/31/2023
**UK**: 31/12/2023

```javascript
// composables/useFormatter.js
export function useFormatter(locale) {
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD", // Should be dynamic based on locale
  });

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
  });

  return {
    formatCurrency: (val) => currencyFormatter.format(val),
    formatDate: (val) => dateFormatter.format(val),
  };
}
```

### 2. RTL (Right-to-Left) Support

For languages like Arabic and Hebrew, the entire layout must flip.

- `dir="rtl"` on `<html>` tag.
- Use Logical CSS Properties (`margin-inline-start` instead of `margin-left`).

```css
/* ❌ Bad: Hardcoded direction */
.card {
  margin-left: 20px;
  text-align: left;
}

/* ✅ Good: Adapts to LTR and RTL automatically */
.card {
  margin-inline-start: 20px;
  text-align: start;
}
```

```javascript
// Switching direction dynamically
function setLocale(lang) {
  const isRTL = ["ar", "he", "fa"].includes(lang);
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}
```
