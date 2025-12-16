# AI Agent Task: Fix Critical Issues in Realtime Chat Web Application

## 1. Project Context

You are working on an existing **realtime chat web application** with the following stack:

### Frontend
- React (JavaScript or TypeScript)
- Runs locally on a development server
- Handles authentication state, chat UI, and realtime message display

### Backend
- Node.js
- Express.js
- Provides REST APIs for authentication and chat data
- May also handle realtime communication (WebSocket, Socket.IO, or Supabase Realtime)

### Database & Auth
- Supabase
- Used for:
  - User authentication
  - Database (messages, users, conversations)
  - Possibly realtime subscriptions

This is **not a greenfield project**.  
All code already exists.  
Your task is to **read and understand the entire codebase** before making changes.

---

## 2. Critical Problems to Fix (High Priority)

The application has several **crucial functional bugs** that must be resolved:

### 2.1 Authentication Persistence Bug
**Problem**
- User is logged out every time the page is refreshed.
- Login session does not persist across refresh or reload.

**Expected Behavior**
- Once logged in, the user should remain authenticated after refresh.
- Session should be restored automatically without forcing re-login.

---

### 2.2 Realtime Chat Not Appearing
**Problem**
- When User A sends a message to User B:
  - The message is stored (or sent) successfully.
  - But it does **not appear in real time** on the receiver side.
- Chat UI does not update automatically.

**Expected Behavior**
- Messages should appear instantly without page refresh.
- Realtime updates must work reliably between users.

---

### 2.3 Static and Non-Responsive UI Behavior
**Problem**
- The website feels static.
- UI does not react smoothly to:
  - New messages
  - Online status changes
  - State updates

**Expected Behavior**
- UI should feel alive and reactive.
- State changes must trigger proper re-renders.
- No manual refresh should be needed.

---

## 3. Mandatory Working Rules for AI Agent

You MUST follow these rules strictly:

1. **Read ALL frontend and backend code first**
   - Components
   - Hooks
   - Context providers
   - API calls
   - Supabase client setup
   - Auth logic
   - Realtime or socket logic

2. **Do NOT modify code immediately**
   - First, analyze and understand the architecture.
   - Identify where state is broken or missing.

3. **Think step-by-step**
   - Authentication flow
   - Session handling
   - State management
   - Realtime data flow

4. **Do NOT guess**
   - Base all conclusions on actual code.
   - If something is missing, explicitly state it.

---

## 4. Analysis Phase (Required Output)

Before coding, produce a clear analysis that includes:

### 4.1 Architecture Overview
- How authentication currently works
- How session data is stored (or not stored)
- How messages are sent and fetched
- How realtime updates are implemented (or missing)

### 4.2 Root Cause Analysis
Explain clearly:
- Why login state is lost on refresh
- Why realtime chat does not update
- Why UI feels static

Each issue must be mapped to:
- Specific files
- Specific logic
- Specific missing or incorrect implementation

---

## 5. Solution Design Phase

After analysis, design a **clean and maintainable solution**:

### 5.1 Authentication Fix Plan
- Session persistence strategy
  - Supabase auth session restore
  - Token storage (secure, correct)
- Frontend state restoration
- Proper auth listener implementation

### 5.2 Realtime Messaging Fix Plan
- Correct usage of:
  - Supabase Realtime OR
  - WebSocket / Socket.IO
- Subscription lifecycle management
- Cleanup on unmount
- Prevent duplicate listeners

### 5.3 State Management Improvement
- Fix React state flow
- Ensure messages trigger re-render
- Avoid stale closures
- Improve component structure if needed

---

## 6. Implementation Phase

Only after the above steps, proceed with coding:

### 6.1 Code Changes Rules
- Make minimal but correct changes
- Do not rewrite the entire project unless required
- Keep code readable and maintainable

### 6.2 Validation
Ensure:
- User stays logged in after refresh
- Messages appear instantly for both sender and receiver
- UI updates smoothly without refresh
- No console errors
- No memory leaks from listeners

---

## 7. TODO Checklist (Must Be Generated)

Create a clear TODO list, grouped by:

### Backend
- [ ] Auth/session fixes
- [ ] Realtime message handling
- [ ] API consistency

### Frontend
- [ ] Auth state persistence
- [ ] Realtime subscription handling
- [ ] UI state updates
- [ ] Cleanup effects

Each TODO must reference:
- File name
- Purpose
- Expected result

---

## 8. Final Goal

Deliver a **fully working realtime chat application** where:

- Authentication persists across refresh
- Realtime chat works correctly
- UI feels dynamic and responsive
- Codebase is stable and understandable

You are expected to think like a **senior full-stack engineer**, not a code generator.

Proceed carefully and systematically.
