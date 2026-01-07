# Rich Text Editor (Question 11) Implementation Plan

## Goal
Implement an extensible WYSIWYG editor for chat applications, optimized for speed and structure, while documenting the limitations of the current POC compared to a production-grade editor.

## Proposed Changes (Gap Analysis)
We track what is implemented in the Frontend POC vs what a Real Production System requires.

| Feature | Frontend POC (Current) | Production Requirement |
| :--- | :--- | :--- |
| **Data Model** | HTML String (`innerHTML`). | **Structured Model (AST)**: Tree of Nodes (Blocks, Inline). Never raw HTML. |
| **Editing API** | `document.execCommand` (Deprecated). | **Custom Operation Engine**: `insert_text`, `split_block`, `toggle_mark`. |
| **Selection** | DOM Selection / Range APIs. | **Logical Cursor**: `(nodeId, offset)` mapped to DOM selection. |
| **Serialization** | None (Raw HTML output). | **JSON Serialization**: Compact transport format (e.g. `{"type": "doc", ...}`). |
| **Collaboration** | Not supported. | **CRDT / OT**: Handling concurrent edits (Y.js, Automerge). |
| **Safety** | None (XSS Vulnerability). | **Sanitization**: Strict filtering of pasted content. |

## Architecture

### Components
- **RichTextEditor.vue**: Wrapper component.
- **EditorToolbar.vue**: Buttons for `bold`, `italic`, etc.
- **EditorContent.vue**: The `contenteditable` div.

### Logic (`useEditor.ts`)
- **State**: `content` (HTML string), `activeFormats` (Array of active tags).
- **Execution**: Uses `document.execCommand` for formatting.
- **Sync**: Listen to `selectionchange` to update toolbar state.

## Implemented Features
- [x] **Basic Formatting**: Bold, Italic, Lists.
- [x] **Toolbar State**: Buttons highlight based on current selection.
- [x] **Input Handling**: Updates `content` ref on `input` event.

## Missing / Future Backend Requirements (Not in POC)
1.  **Custom Document Model**: Relying on `contenteditable` behavior means the browser controls the DOM structure, leading to inconsistency (e.g., Chrome vs Firefox handling of `Enter` key). A real editor (ProseMirror, Slate) maintains its own model.
2.  **Mentions & HashTags**: Requires a "Decorations" layer to detect patterns like `@name` in real-time.
3.  **Paste Handling**: Pasting from Word/Docs often inserts garbage HTML. We need a sanitizer pipeline.
4.  **Limits**: No character or node limits implemented.
