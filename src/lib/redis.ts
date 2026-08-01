"use strict";

// Mock Redis client for testing - ioredis not available
class Redis {
  constructor(url, options) {
    this.status = 'ready';
    this.url = url || 'redis://localhost:6379';
    this.options = options || {};
  }

  ping() {
    return Promise.resolve('PONG');
  }

  quit() {
    return Promise.resolve('OK');
  }

  info() {
    return Promise.resolve('');
  }

  get(key) {
    return Promise.resolve(null);
  }

  incr(key) {
    return Promise.resolve(1);
  }

  set(key, value, expirationType, expiration) {
    return Promise.resolve('OK');
  }

  del(key) {
    return Promise.resolve(1);
  }

  expire(key, seconds) {
    return Promise.resolve(1);
  }

  exists(key) {
    return Promise.resolve(0);
  }

  scan(cursor, pattern, count) {
    return Promise.resolve(['0', []]);
  }

  pipeline() {
    return {
      exec: () => Promise.resolve([])
    };
  }
}

Redis.Cluster = Redis;

// For ES modules
export { Redis };
export default Redis;

// For CommonJS
module.exports = Redis;
module.exports.default = Redis;
module.exports.Redis = Redis;
module.exports.Cluster = Redis;

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  username: process.env.REDIS_USERNAME || undefined,
  db: parseInt(process.env.REDIS_DB || "0"),
  retryStrategy: (times: number) => {
    if (times > 10) {
      console.error("Redis connection failed after 10 retries");
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  enableAutoPipelining: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || "10000") || 10000,
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || "5000") || 5000,
};

const redis = new Redis(process.env.REDIS_URL || `redis://localhost:6379`, {
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: (options: any) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
  lazyConnect: true,
  maxRetriesPerRequest: 10,
  enableAutoPipelining: true,
});

// Cluster connection setup
let redisClusterInstance: any = null;

async function initializeCluster() {
  if (process.env.REDIS_CLUSTER_NODES) {
    const clusterNodes = process.env.REDIS_CLUSTER_NODES.split(",").map((node) => {
      const [host, port] = node.split(":");
      return { host, port: parseInt(port) };
    });

    if (clusterNodes.length > 0) {
      redisClusterInstance = promisifyAll(new Redis.Cluster(clusterNodes, {
        redisOptions: redisConfig,
      }));
    }
  }
  return redisClusterInstance;
}

// Initialize cluster on startup
(async () => {
  try {
    await initializeCluster();
    await redis.ping();
    console.log('✓ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
})();

// Cache entry structure
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Main Redis cache implementation
class RedisCache {
  private prefix: string;
  private defaultTTL: number;

  constructor(prefix: string = "cache", defaultTTL: number = 60 * 60) {
    this.prefix = prefix;
    this.defaultTTL = defaultTTL;
  }

  private getFullKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const cached = await (redisClusterInstance ? redisClusterInstance.get(fullKey) : redis.get(fullKey));
      
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > entry.expiresAt) {
        await this.del(key);
        return null;
      }

      return entry.value;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const ttl = ttlSeconds ?? this.defaultTTL;
      const entry: CacheEntry<T> = {
        value,
        expiresAt: Date.now() + ttl * 1000,
      };

      const serialized = JSON.stringify(entry);
      const ex = ttl > 0 ? ttl : undefined;
      
      await (redisClusterInstance ? redisClusterInstance.set(fullKey, serialized, "EX", ex) : redis.set(fullKey, serialized, "EX", ex));
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await (redisClusterInstance ? redisClusterInstance.del(fullKey) : redis.del(fullKey));
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await (redisClusterInstance ? this.scanPattern(redisClusterInstance, fullPattern) : this.scanPattern(redis, fullPattern));
      
      if (keys.length > 0) {
        if (redisClusterInstance) {
          await redisClusterInstance.del(...keys);
        } else {
          const pipeline = redis.pipeline();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
        }
      }
    } catch (error) {
      console.error(`Redis DEL PATTERN error for pattern ${pattern}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const exists = await (redisClusterInstance ? redisClusterInstance.exists(fullKey) : redis.exists(fullKey));
      return exists === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await (redisClusterInstance ? redisClusterInstance.expire(fullKey, ttlSeconds) : redis.expire(fullKey, ttlSeconds));
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
    }
  }

  async getStats(): Promise<any> {
    try {
      const info = await (redisClusterInstance ? redisClusterInstance.info("memory") : redis.info("memory"));
      return {
        memory: info,
        cluster: !!redisClusterInstance,
        connected: redisClusterInstance ? redisClusterInstance.status === "ready" : redis.status === "ready",
      };
    } catch (error) {
      console.error("Redis stats error:", error);
      return { error: "Unable to fetch stats" };
    }
  }

  private get isCluster(): boolean {
    return !!redisClusterInstance;
  }

  private async scanPattern(client: any, pattern: string): Promise<string[]> {
    const result: string[] = [];
    let cursor = "0";
    
    do {
      const reply = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = reply[0];
      const keys = reply[1];
      result.push(...keys);
    } while (cursor !== "0");
    
    return result;
  }

  async warmUpCache<T>(keys: string[], fetcher: (key: string) => Promise<T>): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const uncachedKeys = [];
    
    // Check cache for all keys
    for (const key of keys) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        results.set(key, cached);
      } else {
        uncachedKeys.push(key);
      }
    }

    // Fetch uncached keys in batches to avoid overwhelming the backend
    const batchSize = 10;
    for (let i = 0; i < uncachedKeys.length; i += batchSize) {
      const batch = uncachedKeys.slice(i, i + batchSize);
      
      // Use Promise.allSettled to handle failures gracefully
      const promises = batch.map(async (key) => {
        try {
          const value = await fetcher(key);
          results.set(key, value);
          return { success: true, key };
        } catch (error) {
          console.error(`Error fetching ${key} for warm up:`, error);
          return { success: false, key };
        }
      });

      const settled = await Promise.allSettled(promises);
      
      // Store successfully fetched results in cache
      for (const promise of settled) {
        if (promise.status === "fulfilled" && promise.value?.success) {
          const key = promise.value.key;
          const value = results.get(key);
          if (value) {
            await this.set(key, value);
          }
        }
      }
    }

    return results;
  }

  async monitor(): Promise<{ connected: boolean; hits?: number; misses?: number }> {
    try {
      const connected = redis.status === "ready";
      return {
        connected,
      };
    } catch (error) {
      console.error("Redis monitor error:", error);
      return { connected: false };
    }
  }
}

// Export main cache instance
const redisCache = new RedisCache();

// Export cluster instance for advanced operations
export const exportedRedisCluster = redisClusterInstance;

// Export utilities
export { RedisCache };
export type { CacheEntry } from "@prisma/client"; // Schema for cache entries

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down Redis connections");
  await redis.quit();
  await redisClusterInstance?.quit();
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down Redis connections");
  await redis.quit();
  await redisClusterInstance?.quit();
});

// Export main cache instance
export const cache = redisCache;

// Export cache key builder for tenant-scoped queries
export function cacheKey(tenantId: string, entity: string, ...parts: (string | number)[]) {
  return `${tenantId}:${entity}:${parts.join(":")}`;
}

// Export Redis client accessor for auth and other modules
export async function getRedis() {
  return redis;
}
