/**
 * Generate SHA-256 hash for text content
 * @param content - Text content to hash
 * @returns Hexadecimal hash string
 */
export async function hashText(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate SHA-256 hash for file content
 * @param file - File object to hash
 * @returns Hexadecimal hash string
 */
export async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify message integrity by comparing hash
 * @param content - Message content
 * @param expectedHash - Expected hash value
 * @returns True if hash matches
 */
export async function verifyMessageHash(content: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hashText(content);
  return actualHash === expectedHash;
}

/**
 * Verify file integrity by comparing hash
 * @param file - File object
 * @param expectedHash - Expected hash value
 * @returns True if hash matches
 */
export async function verifyFileHash(file: File, expectedHash: string): Promise<boolean> {
  const actualHash = await hashFile(file);
  return actualHash === expectedHash;
}

/**
 * Generate unique ID using timestamp and random string
 * @returns Unique identifier
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format file size to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Convert file to base64 string
 * @param file - File object
 * @returns Base64 encoded string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
