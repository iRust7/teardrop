import React, { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onFileUploaded?: () => void; // Callback when file is uploaded
  receiverId?: string;
  disabled?: boolean;
  isSending?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  onFileUploaded,
  receiverId,
  disabled = false,
  isSending = false,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Common emojis
  const commonEmojis = [
    '😊', '😂', '❤️', '👍', '🎉', '😍', '🤔', '😎',
    '🔥', '✨', '💯', '👏', '🙏', '😢', '😅', '🥳',
    '💪', '🎊', '⭐', '💕', '😴', '🤗', '😇', '🌟'
  ];

  // Debug log
  React.useEffect(() => {
    console.log('[MESSAGE INPUT] receiverId:', receiverId, 'disabled:', disabled, 'uploadingFile:', uploadingFile);
  }, [receiverId, disabled, uploadingFile]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);

    // Typing indicator logic
    if (value.trim()) {
      onTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    } else {
      onTyping(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || disabled || !receiverId) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      // Generate file hash for integrity verification
      console.log('[FILE] Generating hash for:', file.name);
      const { hashFile } = await import('../utils/hash');
      const fileHash = await hashFile(file);
      console.log('[FILE] Hash generated:', fileHash.substring(0, 16) + '...');
      
      // Import dynamically to avoid circular dependency
      const { messagesAPI } = await import('../utils/api');
      const result = await messagesAPI.sendFile(file, receiverId, message.trim(), fileHash);
      console.log('[FILE] Upload successful with hash:', result);
      setMessage('');
      onTyping(false);
      
      // Trigger callback to refresh messages immediately
      if (onFileUploaded) {
        console.log('[FILE] Triggering onFileUploaded callback');
        onFileUploaded();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Close emoji picker on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              uploadingFile 
                ? "📤 Uploading file..." 
                : !receiverId 
                  ? "👈 Select a user to start chatting" 
                  : disabled
                    ? "⚠️ Connection lost, reconnecting..."
                    : "Type a message... (Press Enter to send)"
            }
            disabled={!receiverId || uploadingFile}
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none max-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            rows={1}
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isSending || uploadingFile}
            className="absolute right-2 bottom-2 p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title={isSending ? "Sending..." : "Send message"}
          >
            {isSending || uploadingFile ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Emoji Picker */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!receiverId || uploadingFile}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!receiverId ? "Select a user first" : "Emoji"}
          >
            <span className="text-2xl">😊</span>
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 w-72 z-50">
              <div className="text-xs font-semibold text-gray-600 mb-2">Pick an emoji</div>
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl p-2 hover:bg-gray-100 rounded transition-colors"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={!receiverId || uploadingFile}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!receiverId || uploadingFile}
            className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!receiverId ? "Select a user first" : uploadingFile ? "Uploading..." : "Attach file"}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
        </div>
      </div>

      {uploadingFile && (
        <div className="text-xs text-gray-500 mt-2 text-center animate-pulse">
          Uploading file...
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2 text-center">
        Powered by Supabase real-time • {uploadingFile ? 'Uploading...' : 'Max 10MB per file'}
      </div>
    </div>
  );
};

export default MessageInput;
