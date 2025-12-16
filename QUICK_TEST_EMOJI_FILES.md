# Quick Test Guide - Emoji & File Upload

## ⚡ Quick Start (5 minutes)

### 1. Setup Database (Supabase)

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Add file support
ALTER TABLE messages ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_data JSONB;
ALTER TABLE messages ALTER COLUMN content DROP NOT NULL;
```

### 2. Create Storage Bucket

**Supabase Dashboard** → **Storage** → **New Bucket**:
- Name: `chat-files`
- Public: ✅ Yes
- Click "Create"

### 3. Add Storage Policies

**Storage** → **chat-files** → **Policies** → **New Policy** → **Custom**:

```sql
-- Policy 1: Upload
CREATE POLICY "auth_upload" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'chat-files');

-- Policy 2: Read
CREATE POLICY "public_read" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'chat-files');
```

### 4. Restart Backend

```powershell
cd backend
npm install
npm start
```

### 5. Test!

1. **Open chat** → Login
2. **Select user** to chat with
3. **Test Emoji**:
   - Click 😊 button
   - Click any emoji
   - Send message
4. **Test File**:
   - Click 📎 button
   - Select image/PDF
   - Watch it upload
   - Should appear in chat

## ✅ Success Checklist

- [ ] Emoji button opens picker
- [ ] Clicking emoji adds to message
- [ ] File button opens file selector
- [ ] File uploads (see "Uploading..." message)
- [ ] Image shows thumbnail
- [ ] PDF shows download button
- [ ] Recipient sees file in real-time

## 🐛 Quick Fixes

### Emoji picker not working?
- Hard refresh: `Ctrl + Shift + R`

### File upload fails?
1. Check Supabase storage bucket exists
2. Check storage policies are set
3. Check backend has `SUPABASE_SERVICE_ROLE_KEY` in `.env`

### File not appearing?
1. Check browser console for errors
2. Verify realtime subscription is active
3. Check database - should see `type='file'` in messages table

## 📸 Screenshots to Verify

You should see:
1. **Emoji Picker**: Popup with 24 emojis
2. **File Button**: 📎 icon next to emoji
3. **Upload State**: "Uploading file..." text
4. **Image Preview**: Clickable thumbnail
5. **File Download**: Button with file icon and name

## 🔧 Database Check

Run in Supabase SQL Editor to verify:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
AND column_name IN ('type', 'file_data');

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'chat-files';

-- See file messages
SELECT id, type, file_data->>'name' as filename 
FROM messages 
WHERE type = 'file'
LIMIT 5;
```

## 💡 Pro Tips

1. **Test with small file first** (< 1MB)
2. **Use PNG/JPG for images** (best supported)
3. **Caption is optional** - you can send file without text
4. **Max 10MB per file** - enforced by backend

## Need Help?

See full guide: [EMOJI_FILE_UPLOAD_GUIDE.md](EMOJI_FILE_UPLOAD_GUIDE.md)
