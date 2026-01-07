# Modal Component - Basic Idea

## Core UX Principles

### Use Modals Sparingly
Modals interrupt user flow. Only use when:
*   Requiring immediate attention (confirmation, error)
*   Capturing focused input without losing context
*   Displaying supplementary content (image lightbox, video)
*   Preventing destructive actions

**Don't use modals for**:
*   Content that could be inline
*   Long forms (use dedicated pages)
*   Non-critical notifications (use toasts instead)

### Clear Purpose
Users should immediately understand why the modal appeared and what action is expected.

### Easy Dismissal
Provide multiple ways to close:
*   X button (top-right corner)
*   Cancel button
*   Click outside modal (backdrop click)
*   Escape key
*   Back gesture on mobile

Make closing obvious and predictable.

## Accessibility (Critical!)

### Focus Management
This is **THE most important aspect**:
1.  When modal opens, move focus to first focusable element (or modal container).
2.  Trap focus inside modal—Tab/Shift+Tab should cycle only within modal.
3.  When modal closes, return focus to element that triggered it.

### Keyboard Navigation
*   `Escape` key closes modal.
*   `Tab` cycles through interactive elements.
*   `Enter`/`Space` activates focused button.
*   Arrow keys for radio groups/lists.

### ARIA Attributes
```html
<div role="dialog" 
     aria-modal="true"
     aria-labelledby="modal-title"
     aria-describedby="modal-description">
  <h2 id="modal-title">Confirm Delete</h2>
  <p id="modal-description">This action cannot be undone.</p>
</div>
```

### Screen Reader Announcements
*   Announce modal opening with `aria-live`.
*   Provide descriptive labels.
*   Announce modal closure.

### Prevent Background Scrolling
Lock body scroll when modal is open. Users shouldn't accidentally scroll page behind modal.

## Visual Design

### Backdrop/Overlay
*   Semi-transparent dark overlay (`rgba(0,0,0,0.5)` typical).
*   Signals that underlying content is inactive.
*   Clicking backdrop should close modal (with exceptions for critical actions).

### Z-index Management
Modals need high z-index to appear above all content. Consider stacking context when nesting modals.

### Size & Positioning
*   Centered vertically and horizontally (most common).
*   Responsive sizing: max-width on desktop, near full-width on mobile.
*   Leave breathing room around edges.
*   Don't make modals taller than viewport (should scroll internally if needed).

### Animation
*   Fade in backdrop + scale/fade in modal (300ms).
*   Exit animation on close.
*   Smooth, not jarring.
*   Respect `prefers-reduced-motion`.

### Visual Hierarchy
*   Clear title/header.
*   Content area with adequate padding.
*   Footer with action buttons (right-aligned typically).
*   Close button always visible.

## Interaction Patterns

### Confirmation Dialogs
For destructive actions (delete, logout):
*   Clear warning message.
*   Primary action button (danger color for destructive).
*   Secondary cancel button.
*   Consider requiring typing confirmation for critical actions.

### Form Modals
*   Keep forms short (3-5 fields max).
*   Show validation errors inline.
*   Disable submit until valid.
*   Consider multi-step for longer forms.
*   Auto-focus first input field.

### Loading States
When modal performs async operation:
*   Show loading spinner.
*   Disable action buttons.
*   Prevent closing during operation.
*   Show success/error states.

### Alert/Notification Modals
*   Single action button (OK, Got it).
*   Auto-close option for non-critical alerts.
*   Icon indicating type (success, warning, error).

## Mobile Considerations

### Full-screen on Mobile
Small screens often work better with full-screen modals that slide up from bottom.

### Bottom Sheet Pattern
Mobile-friendly alternative: sheet that slides up from bottom, partially covering screen.

### Touch Gestures
*   Swipe down to dismiss.
*   Avoid accidental closures.
*   Larger touch targets (48x48px minimum).

### Safe Areas
Respect device safe areas (notches, rounded corners, home indicators).

### Keyboard Handling
Modal should adjust when keyboard appears, ensuring form fields remain visible.

## Performance Optimization

### Lazy Rendering
Don't render modal content until opened. Mount/unmount or show/hide based on use case.

### Portal Rendering
Use React Portal (or equivalent like Vue Teleport) to render modal at document root, avoiding z-index conflicts.

### Animation Performance
Use `transform` and `opacity` for animations (GPU-accelerated). Avoid animating layout properties.

### Event Delegation
For click-outside detection, use single listener on backdrop rather than multiple listeners.

### Memory Management
Clean up event listeners when modal closes. Remove focus traps, scroll locks.

## State Management

### Track Modal State
*   `isOpen`: boolean
*   `content`: dynamic content to display
*   `onClose` callback
*   `zIndex` (for nested modals)
*   `closeOnBackdrop`: boolean
*   `closeOnEscape`: boolean

### Multiple Modals
If allowing stacked modals:
*   Increase z-index for each layer.
*   Darken backdrop progressively.
*   Only top modal is interactive.
*   Closing top reveals previous.

### URL Sync (Optional)
For some modals (image galleries, detail views), sync state with URL:
*   Deep-linkable.
*   Browser back button closes modal.
*   Shareable modal state.

## Common Patterns

### Confirmation Modal
```
Title: "Delete Account?"
Content: "This action cannot be undone. All your data will be permanently deleted."
Actions: [Cancel] [Delete Account]
```

### Alert Modal
```
Title: "Success!"
Content: "Your changes have been saved."
Actions: [OK]
```

### Form Modal
```
Title: "Add New Contact"
Content: [Name input] [Email input] [Phone input]
Actions: [Cancel] [Save Contact]
```

### Lightbox Modal
```
Content: [Full-size image]
Controls: [Previous] [Next] [Close]
Interactions: Click outside, escape, arrow keys
```

### Progressive Disclosure
```
Step 1: Basic info → [Next]
Step 2: Details → [Back] [Next]
Step 3: Confirm → [Back] [Submit]
```

## Edge Cases & Error Handling

### Nested Modals
Generally avoid, but if necessary:
*   Each modal has own backdrop.
*   Focus trap applies to topmost modal.
*   Close modals in reverse order (LIFO).

### Long Content
If content exceeds viewport:
*   Scroll within modal body.
*   Keep header/footer sticky.
*   Show scroll indicators.

### Rapid Open/Close
Debounce or queue modal actions to prevent animation glitches.

### Modal Already Open
Handle attempts to open modal when it's already open gracefully.

### Network Errors
If modal loads data that fails:
*   Show error state within modal.
*   Provide retry option.
*   Allow closing modal.

## Anti-patterns (What NOT to Do)

*   **Modal Inception**: Avoid modal opening another modal opening another modal. Redesign flow instead.
*   **Auto-opening Modals**: Never auto-open modals on page load (especially marketing popups). Users hate this.
*   **No Way to Close**: Always provide clear exit path. Never trap users.
*   **Tiny Click Targets**: Close button should be easy to click/tap (minimum 44x44px).
*   **Background Scrolling**: Not locking body scroll creates confusing experience.
*   **Vague Action Labels**: "OK" and "Cancel" are often unclear. Use descriptive labels: "Delete Account" vs "Cancel".
*   **Critical Content in Modals**: Don't hide important info in modals that might be missed.
*   **Poor Mobile Experience**: Desktop-only modal implementations that break on mobile.

## Technical Implementation

### Focus Trap Implementation
```javascript
function trapFocus(modal) {
  const focusableElements = modal.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}
```

### Scroll Lock
```javascript
function lockScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${getScrollbarWidth()}px`; // Prevent layout shift
}

function unlockScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}
```

### Click Outside Handler
```javascript
function handleBackdropClick(e) {
  if (e.target === backdrop && closeOnBackdrop) {
    closeModal();
  }
}
```

## Context-Specific Variants

### Drawer/Sidebar
Slides in from side instead of centering. Good for navigation, filters, settings.

### Bottom Sheet
Mobile-native pattern. Slides up from bottom. Great for action menus, sharing options.

### Popover
Attached to trigger element. Used for tooltips, dropdowns, context menus. Less intrusive than modal.

### Toast/Snackbar
Non-blocking notifications. Don't require user action. Auto-dismiss.

### Fullscreen Modal
Takes entire viewport. Used for complex workflows, media viewers, mobile forms.

## Analytics & Optimization

### Track Modal Metrics
*   Open rate (how often opened).
*   Conversion rate (for action modals).
*   Abandonment rate (closed without action).
*   Time spent in modal.
*   Error rates in modal forms.

### A/B Testing
*   Different copy/messaging.
*   Button placement/styling.
*   Modal size/layout.
*   Timing (if triggered automatically).

### User Feedback
*   Heatmaps on modal interactions.
*   Session recordings.
*   User complaints about modal UX.

## Performance Metrics
*   **Modal Opening Speed**: Should feel instant (<100ms from trigger to visible).
    *   Backdrop fade: 150-300ms.
    *   Modal animation: 200-300ms.
*   **Memory Footprint**:
    *   Unmount modal content when closed (React/Vue).
    *   Remove event listeners.
    *   Clear references to prevent leaks.
*   **Interaction Responsiveness**:
    *   Button clicks should respond immediately.
    *   Form inputs should feel native.
    *   No janky animations.

---

**The Golden Rules**:
1.  Modals are interruptions - use them thoughtfully.
2.  Accessibility is non-negotiable - focus management, keyboard support, ARIA.
3.  Always provide clear exit - multiple ways to close.
4.  Mobile-first design - most users are on mobile.
5.  Respect user preferences - reduced motion, font sizes.
6.  Test with real users - especially accessibility testing.
7.  Performance matters - smooth animations, fast loading.