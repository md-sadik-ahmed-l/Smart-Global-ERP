// Rate Limiting — in-memory sliding window (Redis-compatible for production)
// In production: replace with Redis-based rate limiter

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: now + this.windowMs };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) this.store.delete(key);
    }
  }
}

// Different limiters for different endpoint types
export const apiLimiter = new RateLimiter(60 * 1000, 100);     // 100 req/min for general API
export const authLimiter = new RateLimiter(60 * 1000, 10);      // 10 req/min for auth (prevent brute force)
export const exportLimiter = new RateLimiter(60 * 1000, 5);     // 5 exports/min
export const writeLimiter = new RateLimiter(60 * 1000, 30);     // 30 writes/min (mutations)

// Cleanup every 5 minutes
setInterval(() => {
  apiLimiter.cleanup();
  authLimiter.cleanup();
  exportLimiter.cleanup();
  writeLimiter.cleanup();
}, 5 * 60 * 1000).unref();

// Helper to apply rate limiting in API routes
export function rateLimit(
  limiter: RateLimiter,
  identifier: string
): { allowed: boolean; headers: Record<string, string> } {
  const result = limiter.check(identifier);
  return {
    allowed: result.allowed,
    headers: {
      "X-RateLimit-Limit": String(limiter["maxRequests"]),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
    },
  };
}
