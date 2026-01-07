# Desktop Email Client (Question 8) Implementation Plan

## Goal
Implement a 3-pane email client simulation (Sidebar, List, View) with optimistic UI updates and responsive design, while documenting the backend complexity required for a production system.

## Proposed Changes (Gap Analysis)
We track what is implemented in the Frontend POC vs what a Real Production System requires.

| Feature | Frontend POC (Current) | Production Backend Requirement |
| :--- | :--- | :--- |
| **Data Storage** | In-memory array (`MOCK_EMAILS`). Resets on reload. | **SQLite/IndexedDB**: Local persistence. **Mail Server**: IMAP/POP3 storage. |
| **Search** | UI Input only (Non-functional). | **Elasticsearch/Lucene**: Full-text index on subject, body, sender. **Inverted Indexing**: Fast lookup. |
| **Sync** | None. Manual refresh mocks data fetch. | **CRDTs / Differential Sync**: Handling offline changes and merging them. **Push Notifications**: IMAP IDLE / WebSockets. |
| **Sending** | `setTimeout` simulation. Adds to local 'Sent' list. | **SMTP Queue**: Retry logic, background workers, outbox management. |
| **Attachments** | Not supported. | **Object Storage (S3)**: Upload/Download management. **Streaming**: For large files. |
| **Security** | None. | **OAuth2**, **TLS/SSL**, **Encryption** (PGP/S/MIME), **Input Sanitization** (prevent XSS in HTML emails). |

## Architecture

### Components
- **Sidebar.vue**: Navigation for folders (Inbox, Sent, Trash).
- **EmailList.vue**: Virtual-scrolling ready list. Currently renders simple mapped array.
- **EmailView.vue**: Displays full content. *Future: Needs sanitizer for HTML content*.
- **ComposeModal.vue**: Form for sending new emails. *Future: Needs Rich Text Editor*.

### Logic (`useEmail.ts`)
- **State Management**: Reactive state for `emails`, `selectedId`, `currentFolder`.
- **Optimistic Updates**: 
    - **Read Status**: Instantly marks as read locally before server confirmation.
    - **Send**: Instantly closes modal and shows success.

## Implemented Features
- [x] **3-Pane Layout**: Responsive layout adapting from Sidebar -> List -> Detail.
- [x] **Folder Navigation**: Filtering by `folder` property.
- [x] **Read/Unread Logic**: Bold styling for unread items.
- [x] **Compose UI**: Modal with form validation.

## Missing / Future Backend Requirements (Not in POC)
1.  **Offline Capability**: The current app requires a browser reload to "reset" but doesn't persist data. A real app needs `ServiceWorker` and `IndexedDB`.
2.  **Search Engine**: Implementing client-side full-text search (e.g., Fuse.js) is a heavy task for a simple POC but vital for production.
3.  **Conflict Resolution**: Handling what happens if two devices delete the same email.
4.  **Pagination**: Currently loads all mock emails at once. Production needs cursor-based pagination.
