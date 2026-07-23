// Enterprise Caching Layer — in-memory TTL cache (Redis-compatible API)
// In production: replace with Redis (ioredis) using same interface

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, CacheEntry<any>>();
  private hitCount = 0;
  private missCount = 0;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return null;
    }
    this.hitCount++;
    return entry.value;
  }

  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
  }

  async invalidateEntity(entity: string, tenantId?: string): Promise<void> {
    const prefix = tenantId ? `${tenantId}:` : "";
    await this.delPattern(`${prefix}${entity}:*`);
    await this.delPattern(`${prefix}dashboard:*`);
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      size: this.store.size,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: total > 0 ? (this.hitCount / total) * 100 : 0,
    };
  }

  // Memoized fetch — returns cached or calls fetcher and caches result
  async cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}

export const cache = new Cache();

// Cleanup expired entries every 5 minutes to prevent memory bloat
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache["store"].entries()) {
    if (now > entry.expiresAt) cache["store"].delete(key);
  }
}, 5 * 60 * 1000).unref();

// Cache key builder for tenant-scoped queries
export function cacheKey(tenantId: string, entity: string, ...parts: (string | number)[]) {
  return `${tenantId}:${entity}:${parts.join(":")}`;
}
