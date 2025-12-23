# 🔐 Hash Functions Documentation - Teardrop Chat

## Overview

Teardrop Chat menggunakan **berbagai jenis hash functions** untuk keamanan dan integritas data. Project ini mengimplementasikan **dua sistem hash terpisah**:

1. **Backend**: bcrypt untuk password hashing
2. **Frontend**: SHA-256 untuk file & message integrity

---

## 📚 Table of Contents

- [Backend Hash Functions (bcrypt)](#backend-hash-functions-bcrypt)
- [Frontend Hash Functions (SHA-256)](#frontend-hash-functions-sha-256)
- [Use Cases & Implementation](#use-cases--implementation)
- [Security Considerations](#security-considerations)
- [Performance Analysis](#performance-analysis)
- [Best Practices](#best-practices)

---

## Backend Hash Functions (bcrypt)

### 📁 File: `backend/src/utils/password.js`

### 🔧 Functions

#### 1. `hashPassword(password)`

**Purpose**: Hash password menggunakan bcrypt untuk secure storage

```javascript
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}
```

**Parameters**:
- `password` (string): Plain text password dari user

**Returns**: 
- `Promise<string>`: Hashed password (60 characters)

**Algorithm**: 
- **bcrypt** dengan 10 salt rounds

**Example Output**:
```
$2b$10$N9qo8uLOickgx2ZMRZoMye.IjAJwmx.ZhuzDgokCYsR5.6G5h5FFO
```

**Breakdown**:
- `$2b$` - bcrypt version identifier
- `10$` - Cost factor (2^10 = 1024 iterations)
- Next 22 chars - Salt
- Remaining 31 chars - Hashed password

---

#### 2. `comparePassword(password, hash)`

**Purpose**: Verify password dengan membandingkan plain text vs hashed password

```javascript
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

**Parameters**:
- `password` (string): Plain text password dari user input
- `hash` (string): Hashed password dari database

**Returns**: 
- `Promise<boolean>`: `true` jika match, `false` jika tidak

**Security Feature**:
- Constant-time comparison (mencegah timing attacks)
- Automatic salt extraction dari hash

---

#### 3. `generateRandomPassword(length = 12)`

**Purpose**: Generate random password untuk reset atau temporary password

```javascript
export function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
```

**Parameters**:
- `length` (number): Panjang password (default: 12)

**Returns**: 
- `string`: Random password

**Character Set**: 
- Lowercase: a-z
- Uppercase: A-Z
- Numbers: 0-9
- Special: !@#$%^&*

**Example Output**:
```
A7k!mP9@xQ2z
```

---

### 🔒 bcrypt Configuration

```javascript
const SALT_ROUNDS = 10;
```

**Salt Rounds Explained**:
- 10 rounds = 2^10 = **1,024 iterations**
- Higher rounds = More secure but slower
- Recommended: 10-12 rounds for production

**Time Complexity**:
- 10 rounds: ~100ms per hash
- 12 rounds: ~250ms per hash
- 14 rounds: ~1000ms per hash

---

## Frontend Hash Functions (SHA-256)

### 📁 File: `frontend/src/utils/hash.ts`

### 🔧 Functions

#### 1. `hashText(content)`

**Purpose**: Generate SHA-256 hash untuk text content (messages)

```typescript
export async function hashText(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

**Parameters**:
- `content` (string): Text content yang akan di-hash

**Returns**: 
- `Promise<string>`: 64-character hexadecimal hash

**Algorithm**: 
- **SHA-256** (Secure Hash Algorithm 256-bit)

**Example**:
```typescript
const hash = await hashText("Hello, World!");
// Output: "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f"
```

**Properties**:
- Fixed output: Always 256 bits (64 hex characters)
- Deterministic: Same input = Same output
- One-way: Cannot reverse hash to original

---

#### 2. `hashFile(file)`

**Purpose**: Generate SHA-256 hash untuk file content (gambar, dokumen, dll)

```typescript
export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

**Parameters**:
- `file` (File): File object dari browser

**Returns**: 
- `Promise<string>`: 64-character hexadecimal hash

**Use Case**:
- File integrity verification
- Duplicate file detection
- Checksum validation

**Example**:
```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const hash = await hashFile(file);
// Output: "a3c7b8e4f2d91e5c6a1f8b3d2e4a7c9b5e8f1d3a6c2b4e7a1d9c3f5b2e8a4c1"
```

---

#### 3. `verifyMessageHash(content, expectedHash)`

**Purpose**: Verify message integrity dengan membandingkan hash

```typescript
export async function verifyMessageHash(
  content: string, 
  expectedHash: string
): Promise<boolean> {
  const actualHash = await hashText(content);
  return actualHash === expectedHash;
}
```

**Parameters**:
- `content` (string): Message content
- `expectedHash` (string): Expected hash value

**Returns**: 
- `Promise<boolean>`: `true` jika match, `false` jika tidak

**Use Case**:
- Detect message tampering
- Ensure data integrity
- Validate received messages

---

#### 4. `verifyFileHash(file, expectedHash)`

**Purpose**: Verify file integrity dengan membandingkan hash

```typescript
export async function verifyFileHash(
  file: File, 
  expectedHash: string
): Promise<boolean> {
  const actualHash = await hashFile(file);
  return actualHash === expectedHash;
}
```

**Parameters**:
- `file` (File): File object
- `expectedHash` (string): Expected hash value

**Returns**: 
- `Promise<boolean>`: `true` jika match, `false` jika tidak

**Use Case**:
- Verify file upload integrity
- Detect corrupted files
- Validate downloaded files

---

#### 5. `generateId()`

**Purpose**: Generate unique identifier menggunakan timestamp + random string

```typescript
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

**Returns**: 
- `string`: Unique identifier

**Example Output**:
```
1734422400000-k7x3m9p2q
```

**Format**:
- Timestamp (milliseconds) + Random alphanumeric

---

## Use Cases & Implementation

### 🔐 1. User Registration & Authentication

**Location**: `backend/src/controllers/authController.js`

```javascript
// Registration
const password_hash = await hashPassword(password);
const user = await UserModel.create({
  username,
  email,
  password_hash,  // Stored in database
  // ... other fields
});
```

**Flow**:
1. User submits password: `"MySecurePassword123!"`
2. Backend hashes with bcrypt: `hashPassword(password)`
3. Result stored in DB: `"$2b$10$N9qo8u..."`
4. Original password **never stored**

---

**Login**:

```javascript
// Login verification
const user = await UserModel.findByEmail(email);
const isValidPassword = await comparePassword(password, user.password_hash);

if (!isValidPassword) {
  return res.status(401).json(ApiResponse.error('Invalid credentials'));
}
```

**Flow**:
1. User submits password: `"MySecurePassword123!"`
2. Backend retrieves hash from DB
3. bcrypt compares: `comparePassword(password, hash)`
4. Returns `true/false`

---

### 📤 2. File Upload with Integrity Check

**Location**: `frontend/src/components/MessageInput.tsx`

```typescript
// Generate hash before upload
const { hashFile } = await import('../utils/hash');
const fileHash = await hashFile(file);

// Send with hash
const result = await messagesAPI.sendFile(
  file, 
  receiverId, 
  message.trim(), 
  fileHash  // Include hash
);
```

**Flow**:
1. User selects file
2. Frontend generates SHA-256 hash
3. Upload file + hash to server
4. Server can verify integrity
5. Hash stored in database for future verification

---

### ✅ 3. Message Integrity Verification

**Scenario**: Verify message wasn't tampered with

```typescript
// Sender side
const messageContent = "Important message";
const hash = await hashText(messageContent);

// Store message + hash in database
await saveMessage({ content: messageContent, hash });

// Receiver side - verify
const isValid = await verifyMessageHash(messageContent, storedHash);
if (!isValid) {
  console.error('Message has been tampered with!');
}
```

---

### 🔄 4. Password Change

**Location**: `backend/src/controllers/authController.js`

```javascript
// Verify old password
const isValid = await comparePassword(currentPassword, user.password_hash);

if (!isValid) {
  return res.status(400).json(ApiResponse.error('Current password is incorrect'));
}

// Hash new password
const password_hash = await hashPassword(newPassword);

// Update in database
await UserModel.updatePassword(user.id, password_hash);
```

---

## Security Considerations

### 🛡️ bcrypt (Backend)

#### ✅ Strengths:
1. **Salted Hashing**: Each password gets unique salt
2. **Adaptive**: Can increase cost factor over time
3. **Slow by Design**: Protects against brute-force
4. **Industry Standard**: Well-tested and trusted

#### ⚠️ Important Notes:
- **Never decrease salt rounds** (always 10+)
- **Never store plain passwords** (even temporarily)
- **Use HTTPS** (passwords in transit)
- **Rate limit login attempts** (prevent brute-force)

#### 🔒 Attack Resistance:

| Attack Type | bcrypt Protection |
|-------------|-------------------|
| Brute Force | High (slow hashing) |
| Rainbow Tables | High (unique salts) |
| Dictionary Attack | High (complexity) |
| Timing Attack | High (constant-time) |

---

### 🔐 SHA-256 (Frontend)

#### ✅ Strengths:
1. **Fast**: Suitable for large files
2. **Deterministic**: Same input = Same hash
3. **Collision Resistant**: Near impossible to find two inputs with same hash
4. **Integrity Check**: Detects any data modification

#### ⚠️ Limitations:
- **NOT for Passwords**: SHA-256 alone is too fast for passwords
- **Not Encrypted**: Hash cannot be reversed to original
- **Public Algorithm**: Anyone can compute hash

#### 💡 Why SHA-256 for Files?
- Speed: Can hash large files quickly
- Standard: Widely supported
- Verification: Perfect for integrity checks

---

## Performance Analysis

### ⏱️ Benchmarks

#### bcrypt (Backend)
```javascript
// 10 rounds
Time: ~100ms per hash
Memory: ~10MB
Security: High

// 12 rounds
Time: ~250ms per hash
Memory: ~10MB
Security: Very High

// 14 rounds (overkill)
Time: ~1000ms per hash
Memory: ~10MB
Security: Extreme
```

**Recommendation**: Use **10 rounds** for good balance

---

#### SHA-256 (Frontend)
```typescript
// Small text (1KB)
Time: <1ms
Memory: Minimal

// Large file (10MB)
Time: ~50-100ms
Memory: ~10MB (temporary)

// Very large file (100MB)
Time: ~500-1000ms
Memory: ~100MB (temporary)
```

**Recommendation**: 
- Use for files **< 50MB**
- Show progress bar for large files
- Consider chunked hashing for very large files

---

### 📊 Comparison Table

| Feature | bcrypt | SHA-256 |
|---------|--------|---------|
| **Purpose** | Password hashing | Data integrity |
| **Speed** | Slow (by design) | Fast |
| **Output Size** | 60 chars | 64 chars (hex) |
| **Reversible** | No | No |
| **Salted** | Yes (automatic) | No (not needed) |
| **Best For** | Passwords | Files, Messages |
| **Security** | Very High | High (for integrity) |

---

## Best Practices

### ✅ DO's

#### Backend (bcrypt):
- ✅ Use at least 10 salt rounds
- ✅ Always hash passwords server-side
- ✅ Use comparePassword() for verification
- ✅ Rate limit login attempts
- ✅ Implement account lockout after failed attempts
- ✅ Never log passwords (hashed or plain)
- ✅ Use HTTPS for all authentication

#### Frontend (SHA-256):
- ✅ Hash files before upload
- ✅ Store hash for integrity verification
- ✅ Use for duplicate detection
- ✅ Verify downloaded files
- ✅ Show hash to users (optional)

---

### ❌ DON'Ts

#### Backend:
- ❌ Never use SHA-256 for passwords
- ❌ Never decrease salt rounds
- ❌ Never store plain text passwords
- ❌ Never send passwords in logs
- ❌ Never use MD5 or SHA-1 (deprecated)

#### Frontend:
- ❌ Never hash passwords on frontend only
- ❌ Never trust client-side validation alone
- ❌ Never use hash as encryption
- ❌ Never assume hash guarantees authenticity

---

## Code Examples

### Example 1: Complete User Registration

```javascript
// backend/src/controllers/authController.js
import { hashPassword } from '../utils/password.js';

static register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate password
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password too short' });
  }

  // Hash password
  const password_hash = await hashPassword(password);
  // Result: "$2b$10$eImiTXuWVxfM37uY4JANjO..."

  // Save to database
  const user = await UserModel.create({
    username,
    email,
    password_hash  // Stored securely
  });

  res.json({ success: true, userId: user.id });
};
```

---

### Example 2: File Upload with Hash

```typescript
// frontend/src/components/MessageInput.tsx
import { hashFile } from '../utils/hash';

async handleFileUpload(file: File) {
  // Generate hash
  const fileHash = await hashFile(file);
  console.log('File hash:', fileHash);
  // Output: "a3c7b8e4f2d91e5c6a1f8b3d2e4a7c9b5e8f1d3a6c2b4e7a1d9c3f5b2e8a4c1"

  // Upload with hash
  await messagesAPI.sendFile(file, receiverId, message, fileHash);

  // Hash stored in database for verification
}
```

---

### Example 3: Message Integrity Check

```typescript
// frontend/src/utils/hash.ts
import { hashText, verifyMessageHash } from './hash';

// Send message
const message = "Secret message";
const hash = await hashText(message);
await sendMessage(message, hash);

// Verify received message
const isValid = await verifyMessageHash(receivedMessage, receivedHash);
if (!isValid) {
  alert('⚠️ Message integrity compromised!');
}
```

---

## Testing Hash Functions

### Test bcrypt

```javascript
// test/password.test.js
import { hashPassword, comparePassword } from '../utils/password.js';

test('Password hashing', async () => {
  const password = 'TestPassword123!';
  
  // Hash
  const hash = await hashPassword(password);
  console.log('Hash:', hash);
  // "$2b$10$..."
  
  // Verify correct password
  const isValid = await comparePassword(password, hash);
  expect(isValid).toBe(true);
  
  // Verify wrong password
  const isInvalid = await comparePassword('WrongPassword', hash);
  expect(isInvalid).toBe(false);
});
```

---

### Test SHA-256

```typescript
// test/hash.test.ts
import { hashText, hashFile, verifyMessageHash } from '../utils/hash';

test('Text hashing', async () => {
  const text = 'Hello, World!';
  
  const hash1 = await hashText(text);
  const hash2 = await hashText(text);
  
  // Same input = Same hash
  expect(hash1).toBe(hash2);
  
  // Verify
  const isValid = await verifyMessageHash(text, hash1);
  expect(isValid).toBe(true);
});
```

---

## Migration Guide

### Upgrading Salt Rounds

```javascript
// Current: 10 rounds
const SALT_ROUNDS = 10;

// Future: Increase to 12 rounds
const SALT_ROUNDS = 12;

// Migration script
async function migratePasswords() {
  const users = await UserModel.findAll();
  
  for (const user of users) {
    // User will need to login again
    // On next login, re-hash with new rounds
    const newHash = await hashPassword(plainPassword);
    await UserModel.updatePassword(user.id, newHash);
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. bcrypt "Invalid salt version" error
```javascript
// Solution: Update bcrypt
npm update bcrypt
```

#### 2. SHA-256 browser compatibility
```typescript
// Check if crypto.subtle is available
if (!crypto.subtle) {
  console.error('Web Crypto API not supported');
  // Fallback to server-side hashing
}
```

#### 3. Large file hashing timeout
```typescript
// Solution: Use chunked hashing
async function hashFileChunked(file: File) {
  const chunkSize = 1024 * 1024; // 1MB chunks
  let offset = 0;
  const hasher = crypto.subtle.digest('SHA-256');
  
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    await hasher.update(await chunk.arrayBuffer());
    offset += chunkSize;
  }
  
  return hasher.final();
}
```

---

## Summary

### 🎯 Key Takeaways

1. **bcrypt for Passwords**: Always use bcrypt (or similar) for password hashing
2. **SHA-256 for Integrity**: Use SHA-256 for file and message integrity
3. **Never Mix**: Don't use SHA-256 for passwords or bcrypt for files
4. **Security First**: Always hash on server-side for authentication
5. **Verify Everything**: Use hash verification for critical data

### 📚 Related Files

- [backend/src/utils/password.js](backend/src/utils/password.js) - bcrypt implementation
- [frontend/src/utils/hash.ts](frontend/src/utils/hash.ts) - SHA-256 implementation
- [backend/src/controllers/authController.js](backend/src/controllers/authController.js) - Authentication usage
- [frontend/src/components/MessageInput.tsx](frontend/src/components/MessageInput.tsx) - File hashing usage

---

**Last Updated**: December 17, 2025  
**Version**: 2.0  
**Project**: Teardrop Chat
