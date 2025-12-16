/**
 * Standard API response format
 */
export class ApiResponse {
  constructor(success, data = null, message = null, error = null) {
    this.success = success;
    this.data = data;
    this.message = message;
    if (error) this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Success') {
    return new ApiResponse(true, data, message);
  }

  static error(message, error = null) {
    return new ApiResponse(false, null, message, error);
  }
}

/**
 * Async handler wrapper for route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(body, fields) {
  const missing = fields.filter(field => !body[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Sanitize user object (remove sensitive data)
 */
export function sanitizeUser(user) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}
