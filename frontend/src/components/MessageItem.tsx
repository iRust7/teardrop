import React from 'react';
import { Message } from '../types';
import { formatMessageTime, linkifyText, isImageFile, getFileIcon } from '../utils/helpers';
import { formatFileSize } from '../utils/hash';
import UserAvatar from './UserAvatar';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, showAvatar }) => {
  const renderFilePreview = () => {
    if (!message.fileData) return null;

    const { name, size, type, url } = message.fileData;

    if (isImageFile(type)) {
      return (
        <div className="mt-2">
          <img
            src={url}
            alt={name}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(url, '_blank')}
          />
          <div className="mt-1 text-xs opacity-75">
            {name} • {formatFileSize(size)}
          </div>
        </div>
      );
    }

    return (
      <a
        href={url}
        download={name}
        className="mt-2 flex items-center gap-3 p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all"
      >
        <span className="text-2xl">{getFileIcon(type)}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate flex items-center gap-1">
            {name}
            {message.fileData.hash && (
              <span className="text-xs" title={`Verified with SHA-256: ${message.fileData.hash.substring(0, 16)}...`}>
                🔒
              </span>
            )}
          </div>
          <div className="text-xs opacity-75">{formatFileSize(size)}</div>
        </div>
        <span className="text-xs">↓</span>
      </a>
    );
  };

  return (
    <div className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && !isOwnMessage && (
        <UserAvatar
          user={{ id: message.userId, username: message.username, avatar: '', status: 'online' }}
          size="sm"
          showStatus={false}
        />
      )}
      {!showAvatar && !isOwnMessage && <div className="w-8" />}

      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {showAvatar && !isOwnMessage && (
          <div className="text-xs font-medium text-gray-700 mb-1 px-1">{message.username}</div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary-500 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
          }`}
        >
          {message.type === 'text' && (
            <div
              className="break-words"
              dangerouslySetInnerHTML={{ __html: linkifyText(message.content) }}
            />
          )}
          {message.type === 'file' && (
            <>
              {message.content && <div className="mb-2">{message.content}</div>}
              {renderFilePreview()}
            </>
          )}
          
          <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'}`}>
            {formatMessageTime(message.timestamp)}
            {message.isRead && isOwnMessage && ' • Read'}
          </div>
        </div>

        {/* Hash verification indicator */}
        {message.hash && (
          <div className="text-xs text-gray-400 mt-1 px-1">
            <span title={`Hash: ${message.hash.substring(0, 16)}...`}>🔒</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
