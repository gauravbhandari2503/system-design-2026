# Rich Text Editor (Chat) - Basic Idea

## 1. Role of the Rich Text Editor in Chat
An RTE in chat is **not** a document editor. It must optimize for:
*   Low latency typing.
*   Short-lived content.
*   Frequent sends & clears.
*   Mixed content (text, emoji, mentions, links, media).

**Design principle:** Fast input first, formatting second, structure always correct.

## 2. Core Architecture
**Input Surface** (UI)
↓
**Document Model** (Logical Representation)
↓
**Operations / Commands**
↓
**Serializer / Deserializer**
↓
**Transport & Rendering**

Each layer is strictly separated.

## 3. Input Surface Design

### A. Single Source of Truth
The editable surface must **not** be the source of truth.
*   DOM is just a view.
*   Internal document model holds the real state.
*   **Avoids:** Cursor jumps, corrupted formatting, browser inconsistencies.

### B. Controlled Update Loop
`User input` → `operation` → `model update` → `view patch`
*   Never directly manipulate DOM selection or innerHTML blindly.

## 4. Document Model (Critical)

### A. Structured, Not HTML
Avoid storing raw HTML internally. Preferred logical structure:
```javascript
Document
 └── Blocks
      └── Inline nodes
           ├── text
           ├── emoji
           ├── mention
           └── link
```
Each node has: `type`, `content`, `attributes` (bold, italic).

### B. Why This Matters
*   Prevents invalid nesting.
*   Enables precise cursor control.
*   Makes serialization predictable.
*   Enables undo/redo safely.

## 5. Operation-Based Editing

### A. Command Model
All edits are **operations**, not mutations.
Examples: `insert_text`, `delete_range`, `toggle_bold`, `insert_emoji`, `insert_mention`.

Operations are: **Small**, **Deterministic**, **Reversible**.

### B. Benefits
*   Easy undo/redo.
*   Easy sync with collaboration (future).
*   Minimal UI updates.

## 6. Cursor & Selection Management
**Logical Cursor:** Store cursor position as `(node_id, offset)`.
**Not:** DOM ranges.
Map logical cursor → DOM selection only when rendering.

## 7. Performance Design

### A. Avoid Full Re-Renders
*   Patch only affected nodes.
*   Avoid rebuilding entire content tree.

### B. Batch Input Events
*   Coalesce rapid keystrokes.
*   Defer formatting recalculation.

### C. IME & Mobile Support
*   Treat composition events as atomic.
*   Do not format mid-composition.

## 8. Formatting Strategy
*   **Inline Formatting:** Bold, italic, underline → inline attributes. Do not wrap repeatedly in nested tags.
*   **Block Formatting:** Paragraph, Quote, Code block. Block-level rules must be enforced strictly.

## 9. Mentions, Emoji & Autocomplete
**Token-Based Detection**
*   Detect trigger characters (`@`, `:`).
*   Track range dynamically.
*   Replace token with structured node: `@john` → `MentionNode { userId, displayName }`.
*   **Avoid:** Plain text replacement hacks.

## 10. Pasting & Sanitization
**Paste Pipeline:**
`Clipboard Input` → `Normalize` → `Sanitize` → `Convert to internal model` → `Insert`

**Rules:**
*   Strip unsupported formatting.
*   Preserve intent, not appearance.
*   Enforce chat limits.

## 11. Serialization for Transport

### Outgoing Message
Convert document model → compact format (JSON AST / Minimal markup).
**Example:**
```json
[
  { "type": "text", "value": "Hi " },
  { "type": "mention", "id": "u1", "label": "John" }
]
```

### Incoming Message Rendering
Deserialize → render-safe structure. **Never render raw user HTML.**

## 12. Limits & Guardrails
Enforce at editor level:
*   Max characters.
*   Max nodes.
*   Max depth.

## 13. Clearing & Reuse
After send: Reset model, Reset cursor, **Reuse editor instance**. Never destroy/recreate editor per message.

## 14. Accessibility & UX
*   Keyboard-first navigation.
*   Screen reader compatible.
*   Predictable shortcuts.
*   Visible focus state.

## 15. Failure Scenarios to Handle
*   Undo after failed send.
*   Restore editor state on reconnect.
*   Prevent duplicate submissions.
*   Recover from malformed content.

## 16. Common RTE Mistakes ❌
*   Using raw `contenteditable` as data.
*   Treating chat editor like Google Docs.
*   Formatting on every keystroke.
*   Letting HTML leak into transport.
*   Losing cursor position on updates.