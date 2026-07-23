// System Stats API — cache hit rate, job queue, DB size, audit count
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { jobQueue } from "@/lib/jobs";
import { requireAuth, unauthorized, getTenantContext } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const [cacheStats, jobStats, auditCount, userCount, todayLogins] = await Promise.all([
    Promise.resolve(cache.getStats()),
    jobQueue.getStats(),
    db.auditLog.count({ where: { tenantId } }),
    db.user.count({ where: { tenantId } }),
    db.auditLog.count({
      where: {
        tenantId,
        action: "LOGIN",
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  return NextResponse.json({
    cache: cacheStats,
    jobs: jobStats,
    audit: { totalEntries: auditCount },
    users: { total: userCount, todayLogins },
    timestamp: new Date().toISOString(),
  });
}
