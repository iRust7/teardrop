# 🧪 Testing Guide - Verify All Fixes

## 🚀 Quick Start Testing

### Step 1: Start the Application

**Terminal 1 - Backend:**
```powershell
cd "E:\PERKULIAHAN\teardrop chat\backend"
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd "E:\PERKULIAHAN\teardrop chat\frontend"
npm run dev
```

**Expected Output:**
- Backend: Server running on port (check console)
- Frontend: Running on http://localhost:5173 (or similar)

---

## ✅ Test 1: Authentication Persistence (CRITICAL)

### Goal: Verify login persists after page refresh

**Steps:**
1. Open browser to `http://localhost:5173`
2. Login with any user account (or register new user)
3. **Press F5 or Ctrl+R to refresh the page**
4. **CRITICAL CHECK**: Did you stay logged in?

**✅ PASS Criteria:**
- User should remain logged in
- No login screen should appear
- Chat interface loads immediately
- Console should show: `[APP] Restoring cached user: <username>`

**❌ FAIL Indicators:**
- Login screen appears after refresh
- User is logged out
- Console shows: `[APP] No token, showing login`

---

## ✅ Test 2: Real-time Messaging (CRITICAL)

### Goal: Messages appear instantly without refresh

**Setup:**
- Open TWO browser windows (or use Incognito for second window)
- Window 1: Login as User A
- Window 2: Login as User B

**Test 2A: Send from User A to User B**

**Steps (Window 1 - User A):**
1. Select User B from the user list
2. Type message: "Hello from User A!"
3. Press Enter or click Send
4. **CHECK Window 1**: Message appears immediately ✅

**Steps (Window 2 - User B):**
1. **WITHOUT REFRESHING** - just watch the screen
2. **CRITICAL CHECK**: Does the message appear automatically?
3. **CRITICAL CHECK**: Did you hear a notification sound? 🔔

**✅ PASS Criteria (Window 1 - Sender):**
- Message appears in chat instantly (<100ms)
- Message shown in blue bubble (right side)
- Console shows: `[CHAT] Message sent successfully`

**✅ PASS Criteria (Window 2 - Receiver):**
- Message appears automatically (no refresh needed!)
- Message shown in gray bubble (left side)
- Notification sound plays
- Console shows: `[REALTIME] New message received!`

**❌ FAIL Indicators:**
- Message doesn't appear on receiver side
- Need to refresh to see message
- No notification sound

---

**Test 2B: Send from User B back to User A**

**Steps:**
1. In Window 2 (User B), type reply: "Hello back from User B!"
2. Send message
3. **CHECK both windows** - message should appear in BOTH instantly

**✅ PASS Criteria:**
- Bidirectional messaging works
- Both users see messages in real-time
- Conversation flows naturally

---

## ✅ Test 3: Multiple Messages & Conversation Flow

**Steps:**
1. Send 5-10 messages back and forth between User A and User B
2. Observe the chat interface

**✅ PASS Criteria:**
- All messages appear instantly
- Messages are in correct order
- Chat scrolls to bottom automatically
- No duplicates or missing messages
- Timestamps are correct

---

## ✅ Test 4: Online/Offline Status (Bonus)

**Test 4A: User Status Updates**

**Steps:**
1. Window 1 (User A): Check user list - User B should show online (green dot)
2. Window 2 (User B): Logout
3. Window 1 (User A): **CHECK** - Does User B now show offline (gray dot)?

**✅ PASS Criteria:**
- Online users show green dot + "Active now"
- Offline users show gray dot + "Offline"
- Status updates in real-time (within 5 seconds)

---

## ✅ Test 5: Page Refresh During Chat

**Steps:**
1. User A and User B are chatting
2. Send 3-4 messages
3. **Refresh the page (F5) in Window 1**
4. **CHECK**: Are all previous messages still visible?
5. **CHECK**: Is User B still selected?
6. Send another message

**✅ PASS Criteria:**
- Message history preserved after refresh
- Can continue conversation immediately
- No data loss
- User stays logged in

---

## ✅ Test 6: Multiple Users (Stress Test)

**If you have 3+ browser windows available:**

**Steps:**
1. Open 3 browser windows
2. Login as User A, User B, User C
3. User A sends message to User B
4. User B sends message to User C
5. User C sends message to User A

**✅ PASS Criteria:**
- Each user only sees their relevant conversations
- Messages don't leak to wrong users
- All messages appear in real-time
- Performance remains smooth

---

## ✅ Test 7: Logout & Re-login

**Steps:**
1. Login as User A
2. Send some messages
3. Click "Logout" button
4. **CHECK**: Redirected to login screen
5. Login again with same user
6. **CHECK**: Previous messages still visible

**✅ PASS Criteria:**
- Logout clears all data properly
- Can re-login successfully
- Message history persists in database
- No ghost sessions

---

## 🔍 Console Logs to Monitor

Open DevTools (F12) and watch the Console tab. You should see:

### On Page Load:
```
[APP] Checking authentication...
[APP] Token exists: true
[APP] Cached user exists: true
[APP] Restoring cached user: <username>
[APP] Session valid, user authenticated: <username>
[USERS] Loading users...
[USERS] Fetched users: X
[MESSAGES] Loading messages for user: <username>
[MESSAGES] Fetched messages: Y
[REALTIME] Setting up message subscription for user: <username>
[REALTIME] Message subscription status: SUBSCRIBED
[REALTIME] User subscription status: SUBSCRIBED
```

### On Sending Message:
```
[CHAT] Sending message to: <receiver_id> Content: <message>
[MESSAGE] Sending message: {...}
[CHAT] Message sent successfully, ID: <id>
[CHAT] Adding message optimistically to UI
[MESSAGE LIST] Messages updated: X messages
[MESSAGE LIST] New messages detected, scrolling to bottom
```

### On Receiving Message:
```
[REALTIME] New message received! {...}
[REALTIME] Message is for current user, reloading...
[REALTIME] Playing notification sound
[MESSAGES] Loading messages for user: <username>
[MESSAGES] Fetched messages: X
[MESSAGE LIST] Messages updated: X messages
```

---

## 🐛 Debugging Failed Tests

### If authentication doesn't persist:

**Check:**
1. Browser console - any errors?
2. Is `cached_user` in localStorage? (DevTools → Application → Local Storage)
3. Is backend running and responding?
4. Check network tab - is `/api/auth/profile` returning 200?

**Console to check:**
```javascript
localStorage.getItem('auth_token')
localStorage.getItem('cached_user')
```

---

### If messages don't appear in real-time:

**Check:**
1. Browser console - look for `[REALTIME]` logs
2. Are subscriptions showing `SUBSCRIBED` status?
3. Is Supabase realtime working? (Check network tab for WebSocket)
4. Try sending message again and watch console

**Expected console logs:**
- `[REALTIME] New message received!`
- `[REALTIME] Message is for current user, reloading...`

---

### If UI feels static:

**Check:**
1. Are messages appearing but not scrolling?
2. Is the user list updating?
3. Check console for `[MESSAGE LIST]` and `[USER LIST]` logs

---

## 📊 Performance Metrics

### Expected Performance:
- **Page Load**: < 1 second (with cached user)
- **Message Send**: < 100ms (optimistic UI)
- **Message Receive**: < 500ms (realtime)
- **UI Updates**: Instant (no lag)

---

## ✅ Final Checklist

Run through this complete test sequence:

- [ ] 1. Login persists after F5 refresh
- [ ] 2. Login persists after closing and reopening tab
- [ ] 3. Messages appear instantly for sender
- [ ] 4. Messages appear instantly for receiver (no refresh)
- [ ] 5. Notification sound plays for incoming messages
- [ ] 6. Online/offline status updates in real-time
- [ ] 7. Can send multiple messages in quick succession
- [ ] 8. Chat scrolls to bottom with new messages
- [ ] 9. User list shows correct online count
- [ ] 10. Logout clears all data properly
- [ ] 11. Can re-login after logout
- [ ] 12. No console errors or warnings

---

## 🎉 Success Criteria

**ALL CRITICAL TESTS MUST PASS:**

✅ **Authentication**: Login persists after refresh  
✅ **Realtime**: Messages appear instantly without refresh  
✅ **UI**: Smooth, reactive, no lag  

**If all tests pass** → 🎉 **Application is FULLY FUNCTIONAL!**

---

## 📸 What You Should See

### Login Persistence Test:
```
1. Login ✅
2. Press F5 ⚡
3. Still logged in ✅ (NO login screen!)
```

### Realtime Chat Test:
```
Window 1 (User A)     →  [Send: "Hello!"]  →  Appears ✅
                         ↓
                    Supabase Realtime
                         ↓
Window 2 (User B)     ←  [Receive: "Hello!"]  ←  Appears ✅ + 🔔
```

---

**Ready to test? Let's go! 🚀**

If any test fails, check the console logs and debugging section above.
