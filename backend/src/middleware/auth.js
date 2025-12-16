import { verifyToken, extractToken } from '../utils/jwt.js';
import { UserModel } from '../models/User.js';
import { ApiResponse } from '../utils/helpers.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json(
        ApiResponse.error('Access denied. No token provided.')
      );
    }

    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json(
        ApiResponse.error('Invalid token. User not found.')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(
      ApiResponse.error('Invalid or expired token.', error.message)
    );
  }
}

/**
 * Admin authorization middleware
 * Checks if user has admin role
 */
export function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json(
      ApiResponse.error('Access denied. Admin privileges required.')
    );
  }
  next();
}

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore errors, authentication is optional
  }
  next();
}

/**
 * Rate limiting middleware (simple implementation)
 */
const rateLimitMap = new Map();

export function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitMap.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json(
        ApiResponse.error('Too many requests. Please try again later.')
      );
    }

    record.count++;
    next();
  };
}

/**
 * Validate request body middleware
 */
export function validateBody(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => !req.body[field]);
    
    if (missing.length > 0) {
      return res.status(400).json(
        ApiResponse.error(`Missing required fields: ${missing.join(', ')}`)
      );
    }
    
    next();
  };
}
