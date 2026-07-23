// Metrics Endpoint — Prometheus-style metrics for monitoring
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { jobQueue } from "@/lib/jobs";
import { requireAuth, unauthorized, getTenantContext } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const { tenantId } = getTenantContext(session);

  const memUsage = process.memoryUsage();
  const cacheStats = cache.getStats();
  const jobStats = await jobQueue.getStats();

  // Entity counts for this tenant
  const [
    customers, vendors, products, salesOrders, purchaseOrders,
    users, employees, workOrders, notifications, auditLogs,
  ] = await Promise.all([
    db.customer.count({ where: { tenantId } }),
    db.vendor.count({ where: { tenantId } }),
    db.product.count({ where: { tenantId } }),
    db.salesOrder.count({ where: { tenantId } }),
    db.purchaseOrder.count({ where: { tenantId } }),
    db.user.count({ where: { tenantId } }),
    db.employee.count({ where: { tenantId } }),
    db.workOrder.count({ where: { tenantId } }),
    db.notification.count({ where: { tenantId } }),
    db.auditLog.count({ where: { tenantId } }),
  ]);

  const metrics = {
    timestamp: new Date().toISOString(),
    tenant: {
      id: tenantId,
      entities: { customers, vendors, products, salesOrders, purchaseOrders, users, employees, workOrders, notifications, auditLogs },
    },
    system: {
      uptime_seconds: process.uptime ? Math.floor(process.uptime()) : 0,
      memory: {
        rss_mb: (memUsage.rss / 1024 / 1024).toFixed(2),
        heap_used_mb: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
        heap_total_mb: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
        external_mb: (memUsage.external / 1024 / 1024).toFixed(2),
      },
      cpu_usage_percent: process.cpuUsage ? `${((process.cpuUsage().user + process.cpuUsage().system) / 1000000).toFixed(2)}%` : "n/a",
    },
    cache: {
      size: cacheStats.size,
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hit_rate_percent: cacheStats.hitRate.toFixed(2),
    },
    jobs: jobStats,
    node_version: process.version,
    platform: process.platform,
  };

  return NextResponse.json(metrics);
}
