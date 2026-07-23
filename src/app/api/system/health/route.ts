import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/system/health — public health check (no auth required for k8s probes)
export async function GET() {
  const startTime = Date.now();
  const checks: any = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "v1.0.0",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {},
  };

  // Database check
  try {
    await db.$queryRaw`SELECT 1 as ok`;
    checks.services.database = { status: "healthy", latency: Date.now() - startTime };
  } catch (e: any) {
    checks.services.database = { status: "unhealthy", error: e.message };
    checks.status = "degraded";
  }

  // Realtime service check
  try {
    const res = await fetch("http://localhost:3003", { signal: AbortSignal.timeout(2000) });
    checks.services.realtime = { status: res.ok ? "healthy" : "degraded" };
  } catch {
    checks.services.realtime = { status: "offline", note: "Realtime service not running" };
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  checks.services.memory = {
    status: "healthy",
    rss: `${(memUsage.rss / 1024 / 1024).toFixed(1)} MB`,
    heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
    heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
  };

  const statusCode = checks.status === "healthy" ? 200 : checks.status === "degraded" ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
