# Desktop Email Client (Question 8) Implementation Plan

## Goal
Implement a 3-pane email client simulation mimicking desktop application behavior.

## Architecture

### Components
- **Sidebar.vue**: Navigation for folders (Inbox, Sent, Trash).
- **EmailList.vue**: Scrollable list of emails with selection state.
- **EmailView.vue**: Displays full content of selected email.
- **ComposeModal.vue**: Form for sending new emails.

### Logic (`useEmail.ts`)
- **State**: `emails`, `selectedId`, `currentFolder`.
- **Selection**: updates `selectedId` and marks email as `read`.
- **Sending**: Adds new email to mock "Sent" list.

### Data Model
```typescript
interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  read: boolean;
  folder: 'inbox' | 'sent' | 'trash';
}
```
