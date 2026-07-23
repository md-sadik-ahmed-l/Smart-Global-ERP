// Health Check Endpoint — for load balancers, Kubernetes probes, monitoring
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";

export async function GET() {
  const startTime = Date.now();
  const checks: any = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    service: "smart-global-erp",
    uptime: process.uptime ? `${Math.floor(process.uptime())}s` : "unknown",
    environment: process.env.NODE_ENV || "development",
    checks: {},
  };

  // Database connectivity check
  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    checks.checks.database = {
      status: "healthy",
      latency: `${dbLatency}ms`,
      type: "sqlite",
    };
  } catch (e: any) {
    checks.checks.database = { status: "unhealthy", error: e.message };
    checks.status = "degraded";
  }

  // Cache check
  try {
    const cacheStats = cache.getStats();
    checks.checks.cache = {
      status: "healthy",
      size: cacheStats.size,
      hitRate: `${cacheStats.hitRate.toFixed(1)}%`,
    };
  } catch (e: any) {
    checks.checks.cache = { status: "unhealthy", error: e.message };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  checks.checks.memory = {
    status: "healthy",
    rss: `${(memUsage.rss / 1024 / 1024).toFixed(1)}MB`,
    heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`,
    heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(1)}MB`,
  };

  checks.responseTime = `${Date.now() - startTime}ms`;

  const httpStatus = checks.status === "healthy" ? 200 : checks.status === "degraded" ? 200 : 503;
  return NextResponse.json(checks, { status: httpStatus });
}
