# TODO Checklist

## Backend
- [x] **Fix Message Sorting** (`backend/src/models/Message.js`)
  - **Purpose:** Ensure messages are returned in chronological order (Oldest -> Newest) so they appear correctly in the chat UI (Newest at bottom).
  - **Expected Result:** `getUserMessages` now returns `data.reverse()`.

## Frontend
- [x] **Auth State Persistence** (`frontend/src/utils/api.ts`, `frontend/src/context/ChatContext.tsx`)
  - **Purpose:** Prevent user from being logged out due to network errors or temporary server unavailability.
  - **Expected Result:** Token is only removed on 401/403 errors. Cached session is used if API is unreachable.

- [x] **Realtime Subscription Handling** (`frontend/src/context/ChatContext.tsx`)
  - **Purpose:** Ensure new messages appear immediately without refresh.
  - **Expected Result:** Added optimistic updates to `postgres_changes` callback. New messages are added to state immediately, then background refresh ensures data consistency.

- [x] **UI State Updates** (`frontend/src/context/ChatContext.tsx`)
  - **Purpose:** Improve responsiveness.
  - **Expected Result:** UI updates instantly on message receipt.

## Verification Steps
1.  **Login:** Log in as User A. Refresh the page. You should stay logged in.
2.  **Chat:** Open chat with User B.
3.  **Send Message:** User A sends a message. It should appear at the bottom of User A's list immediately.
4.  **Receive Message:** User B (in another window/browser) should see the message appear at the bottom immediately without refresh.
