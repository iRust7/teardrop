import React, { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  isSending?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
  isSending = false,
}) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef<number | null>(null);

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

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "👈 Select a user to start chatting" : "Type a message... (Press Enter to send)"}
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none max-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            rows={1}
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isSending}
            className="absolute right-2 bottom-2 p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title={isSending ? "Sending..." : "Send message"}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        <button
          className="p-3 rounded-full hover:bg-gray-100 transition-colors"
          title="Emoji"
        >
          <span className="text-2xl">😊</span>
        </button>
      </div>

      <div className="text-xs text-gray-400 mt-2 text-center">
        Powered by Supabase real-time
      </div>
    </div>
  );
};

export default MessageInput;
