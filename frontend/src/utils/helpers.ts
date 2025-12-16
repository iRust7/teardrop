import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format timestamp to readable format
 * @param timestamp - Unix timestamp
 * @returns Formatted time string
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  } else if (isYesterday(date)) {
    return `Yesterday ${format(date, 'HH:mm')}`;
  } else {
    return format(date, 'MMM dd, HH:mm');
  }
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 * @param timestamp - Unix timestamp
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

/**
 * Generate random avatar color based on username
 * @param username - User's username
 * @returns Hex color code
 */
export function getAvatarColor(username: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#E76F51', '#A8DADC'
  ];
  
  const hash = username.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get initials from username
 * @param username - User's username
 * @returns Initials (max 2 characters)
 */
export function getInitials(username: string): string {
  const parts = username.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

/**
 * Detect URLs in text and make them clickable
 * @param text - Text content
 * @returns Text with HTML links
 */
export function linkifyText(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary-500 underline hover:text-primary-600">${url}</a>`;
  });
}

/**
 * Check if file type is image
 * @param fileType - MIME type
 * @returns True if image
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

/**
 * Check if file type is video
 * @param fileType - MIME type
 * @returns True if video
 */
export function isVideoFile(fileType: string): boolean {
  return fileType.startsWith('video/');
}

/**
 * Get file icon based on file type
 * @param fileType - MIME type
 * @returns Icon name/emoji
 */
export function getFileIcon(fileType: string): string {
  if (isImageFile(fileType)) return '🖼️';
  if (isVideoFile(fileType)) return '🎥';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('text')) return '📝';
  return '📎';
}
