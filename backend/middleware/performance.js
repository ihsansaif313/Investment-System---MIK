/**
 * Performance Optimization Middleware
 * Implements caching, compression, and performance monitoring
 */

import compression from 'compression';
import { createHash } from 'crypto';

// Response compression middleware
export const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress responses if the request includes a cache-control header to prevent compression
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  },
  level: process.env.NODE_ENV === 'production' ? 6 : 1, // Higher compression in production
  threshold: 1024, // Only compress responses larger than 1KB
});

// Simple in-memory cache for production
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache middleware for GET requests
export const cacheMiddleware = (ttl = CACHE_TTL) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated endpoints that return user-specific data
    const skipCacheRoutes = [
      '/api/users/profile',
      '/api/admin-management/status',
      '/api/activity-logs'
    ];

    if (skipCacheRoutes.some(route => req.path.includes(route))) {
      return next();
    }

    // Generate cache key
    const cacheKey = createHash('md5')
      .update(req.originalUrl + (req.user?.id || 'anonymous'))
      .digest('hex');

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });

        // Clean up old cache entries periodically
        if (cache.size > 1000) {
          const now = Date.now();
          for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > ttl) {
              cache.delete(key);
            }
          }
        }
      }

      res.set('X-Cache', 'MISS');
      res._jsonOverridden = true;
      return originalJson.call(this, data);
    };

    next();
  };
};

// Performance monitoring middleware
export const performanceMonitoring = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  // Store original json method to add headers before response
  const originalJson = res.json;

  res.json = function(data) {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

    // Add performance headers before sending response
    if (!res.headersSent) {
      res.set({
        'X-Response-Time': `${responseTime.toFixed(2)}ms`,
        'X-Memory-Usage': `${Math.round(endMemory.heapUsed / 1024 / 1024)}MB`,
        'X-Memory-Delta': `${Math.round(memoryDelta / 1024)}KB`
      });
    }

    // Log slow requests in production
    if (process.env.NODE_ENV === 'production' && responseTime > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${responseTime.toFixed(2)}ms`);
    }

    return originalJson.call(this, data);
  };

  next();
};

// Database query optimization middleware
export const optimizeQueries = (req, res, next) => {
  // Add query optimization hints
  req.queryOptions = {
    lean: true, // Return plain objects instead of Mongoose documents
    limit: Math.min(parseInt(req.query.limit) || 50, 100), // Limit results
    skip: parseInt(req.query.skip) || 0,
    sort: req.query.sort || { createdAt: -1 }
  };

  // Add pagination helpers
  req.pagination = {
    page: Math.max(parseInt(req.query.page) || 1, 1),
    limit: req.queryOptions.limit,
    skip: req.queryOptions.skip
  };

  next();
};

// Response optimization middleware
export const optimizeResponse = (req, res, next) => {
  // Store the current json method (might already be overridden by performance monitoring)
  const currentJson = res.json;

  res.json = function(data) {
    // Add performance metadata only if data is an object
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const responseData = {
        ...data,
        meta: {
          ...data.meta,
          timestamp: new Date().toISOString(),
          responseTime: res.get('X-Response-Time'),
          cached: res.get('X-Cache') === 'HIT'
        }
      };
      return currentJson.call(this, responseData);
    } else {
      return currentJson.call(this, data);
    }
  };

  next();
};

// Clear cache utility
export const clearCache = (pattern) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Cache statistics
export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp < CACHE_TTL) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    hitRate: cache.hitRate || 0,
    memoryUsage: `${Math.round(JSON.stringify([...cache.entries()]).length / 1024)}KB`
  };
};

// Batch processing middleware for bulk operations
export const batchProcessor = (batchSize = 100) => {
  return (req, res, next) => {
    if (req.body && Array.isArray(req.body.items)) {
      req.batchSize = Math.min(req.body.items.length, batchSize);
      req.batches = [];
      
      for (let i = 0; i < req.body.items.length; i += batchSize) {
        req.batches.push(req.body.items.slice(i, i + batchSize));
      }
    }
    
    next();
  };
};

export default {
  compressionMiddleware,
  cacheMiddleware,
  performanceMonitoring,
  optimizeQueries,
  optimizeResponse,
  clearCache,
  getCacheStats,
  batchProcessor
};
