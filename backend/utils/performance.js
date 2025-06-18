/**
 * Performance Optimization Utilities
 * Caching, monitoring, and optimization tools
 */

import NodeCache from 'node-cache';
import { performanceLogger } from '../utils/logger.js';
import { config } from '../config/environment.js';

/**
 * In-memory cache instance
 */
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default TTL
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Don't clone objects for better performance
  deleteOnExpire: true,
  maxKeys: 1000 // Maximum number of keys
});

/**
 * Cache statistics
 */
cache.on('set', (key, value) => {
  performanceLogger.logPerformance('Cache Set', key);
});

cache.on('get', (key, value) => {
  performanceLogger.logPerformance('Cache Get', key);
});

cache.on('del', (key, value) => {
  performanceLogger.logPerformance('Cache Delete', key);
});

cache.on('expired', (key, value) => {
  performanceLogger.logPerformance('Cache Expired', key);
});

/**
 * Cache wrapper with performance monitoring
 */
export class CacheManager {
  /**
   * Get value from cache
   */
  static get(key) {
    const startTime = Date.now();
    const value = cache.get(key);
    const duration = Date.now() - startTime;
    
    performanceLogger.logPerformance('Cache Get Operation', duration);
    
    return value;
  }

  /**
   * Set value in cache
   */
  static set(key, value, ttl = null) {
    const startTime = Date.now();
    const result = cache.set(key, value, ttl);
    const duration = Date.now() - startTime;
    
    performanceLogger.logPerformance('Cache Set Operation', duration);
    
    return result;
  }

  /**
   * Delete value from cache
   */
  static del(key) {
    return cache.del(key);
  }

  /**
   * Check if key exists in cache
   */
  static has(key) {
    return cache.has(key);
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return cache.getStats();
  }

  /**
   * Clear all cache
   */
  static flush() {
    return cache.flushAll();
  }

  /**
   * Get or set pattern (cache-aside)
   */
  static async getOrSet(key, fetchFunction, ttl = null) {
    const startTime = Date.now();
    
    // Try to get from cache first
    let value = this.get(key);
    
    if (value === undefined) {
      // Not in cache, fetch from source
      value = await fetchFunction();
      
      // Store in cache
      this.set(key, value, ttl);
      
      performanceLogger.logPerformance('Cache Miss', Date.now() - startTime);
    } else {
      performanceLogger.logPerformance('Cache Hit', Date.now() - startTime);
    }
    
    return value;
  }

  /**
   * Invalidate cache by pattern
   */
  static invalidatePattern(pattern) {
    const keys = cache.keys();
    const regex = new RegExp(pattern);
    const deletedKeys = [];
    
    keys.forEach(key => {
      if (regex.test(key)) {
        cache.del(key);
        deletedKeys.push(key);
      }
    });
    
    return deletedKeys;
  }
}

/**
 * Database query optimization
 */
export class QueryOptimizer {
  /**
   * Add query performance monitoring
   */
  static monitorQuery(model, operation) {
    const originalMethod = model[operation];
    
    model[operation] = function(...args) {
      const startTime = Date.now();
      const result = originalMethod.apply(this, args);
      
      if (result && typeof result.then === 'function') {
        // Handle promises
        return result.then(data => {
          const duration = Date.now() - startTime;
          performanceLogger.logDatabaseQuery(`${model.modelName}.${operation}`, duration);
          return data;
        }).catch(error => {
          const duration = Date.now() - startTime;
          performanceLogger.logDatabaseQuery(`${model.modelName}.${operation} (ERROR)`, duration);
          throw error;
        });
      } else {
        // Handle synchronous operations
        const duration = Date.now() - startTime;
        performanceLogger.logDatabaseQuery(`${model.modelName}.${operation}`, duration);
        return result;
      }
    };
  }

  /**
   * Create optimized aggregation pipeline
   */
  static optimizeAggregation(pipeline) {
    // Add $match stages early in the pipeline
    const optimized = [];
    const matches = [];
    const others = [];
    
    pipeline.forEach(stage => {
      if (stage.$match) {
        matches.push(stage);
      } else {
        others.push(stage);
      }
    });
    
    // Put $match stages first for better performance
    return [...matches, ...others];
  }

  /**
   * Add query hints for better performance
   */
  static addQueryHints(query, hints = {}) {
    if (hints.index) {
      query.hint(hints.index);
    }
    
    if (hints.limit) {
      query.limit(hints.limit);
    }
    
    if (hints.lean) {
      query.lean();
    }
    
    if (hints.select) {
      query.select(hints.select);
    }
    
    return query;
  }
}

/**
 * Response compression and optimization
 */
export class ResponseOptimizer {
  /**
   * Compress large responses
   */
  static compressResponse(data, threshold = 1024) {
    const dataSize = JSON.stringify(data).length;
    
    if (dataSize > threshold) {
      performanceLogger.logPerformance('Large Response Detected', dataSize);
      
      // For large datasets, consider pagination
      if (Array.isArray(data) && data.length > 100) {
        return {
          data: data.slice(0, 100),
          pagination: {
            total: data.length,
            page: 1,
            limit: 100,
            hasMore: data.length > 100
          },
          message: 'Response truncated for performance. Use pagination for full results.'
        };
      }
    }
    
    return data;
  }

  /**
   * Optimize object for JSON serialization
   */
  static optimizeForSerialization(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    // Remove circular references and optimize
    const seen = new WeakSet();
    
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      
      // Remove undefined values
      if (value === undefined) {
        return null;
      }
      
      // Convert dates to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      return value;
    }));
  }
}

/**
 * Memory monitoring and optimization
 */
export class MemoryMonitor {
  /**
   * Get current memory usage
   */
  static getMemoryUsage() {
    const usage = process.memoryUsage();
    
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // MB
    };
  }

  /**
   * Monitor memory usage and trigger cleanup if needed
   */
  static monitorAndCleanup() {
    const usage = this.getMemoryUsage();
    const threshold = 500; // 500MB threshold
    
    if (usage.heapUsed > threshold) {
      performanceLogger.logPerformance('High Memory Usage Detected', usage.heapUsed);
      
      // Trigger garbage collection if available
      if (global.gc) {
        global.gc();
        performanceLogger.logPerformance('Garbage Collection Triggered', 'manual');
      }
      
      // Clear cache if memory is still high
      const newUsage = this.getMemoryUsage();
      if (newUsage.heapUsed > threshold) {
        CacheManager.flush();
        performanceLogger.logPerformance('Cache Cleared Due to High Memory', newUsage.heapUsed);
      }
    }
    
    return usage;
  }

  /**
   * Start memory monitoring interval
   */
  static startMonitoring(interval = 60000) { // 1 minute default
    return setInterval(() => {
      this.monitorAndCleanup();
    }, interval);
  }
}

/**
 * Performance middleware
 */
export const performanceMiddleware = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Monitor memory usage for each request
    const memoryBefore = MemoryMonitor.getMemoryUsage();
    
    // Override res.json to monitor response time
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      const memoryAfter = MemoryMonitor.getMemoryUsage();
      
      // Log performance metrics
      performanceLogger.logResponseTime(req.path, duration);
      
      if (duration > 1000) { // Log slow requests (>1s)
        performanceLogger.logPerformance('Slow Request', {
          path: req.path,
          method: req.method,
          duration,
          memoryBefore,
          memoryAfter
        });
      }
      
      // Optimize response data
      const optimizedData = ResponseOptimizer.optimizeForSerialization(data);
      
      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Memory-Usage', `${memoryAfter.heapUsed}MB`);
      
      return originalJson.call(this, optimizedData);
    };
    
    next();
  };
};

/**
 * Cache middleware for GET requests
 */
export const cacheMiddleware = (ttl = 300) => { // 5 minutes default
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    const cacheKey = `${req.originalUrl || req.url}_${req.user?.id || 'anonymous'}`;
    const cachedResponse = CacheManager.get(cacheKey);
    
    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        CacheManager.set(cacheKey, data, ttl);
        res.setHeader('X-Cache', 'MISS');
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Initialize performance monitoring
 */
export const initializePerformanceMonitoring = () => {
  // Start memory monitoring
  MemoryMonitor.startMonitoring();
  
  // Log initial memory usage
  performanceLogger.logMemoryUsage();
  
  console.log('✅ Performance monitoring initialized');
};

export default {
  CacheManager,
  QueryOptimizer,
  ResponseOptimizer,
  MemoryMonitor,
  performanceMiddleware,
  cacheMiddleware,
  initializePerformanceMonitoring
};
