// Background Job Queue — in-memory worker (BullMQ-compatible API)
// In production: replace with BullMQ + Redis using same interface

import { db } from "./db";

type JobHandler = (payload: any) => Promise<any>;

class JobQueue {
  private handlers = new Map<string, JobHandler>();
  private processing = false;

  register(type: string, handler: JobHandler) {
    this.handlers.set(type, handler);
  }

  async enqueue(type: string, payload: any = {}, options: { priority?: number; scheduledAt?: Date } = {}) {
    const job = await db.job.create({
      data: {
        type,
        payload: JSON.stringify(payload),
        status: "QUEUED",
        priority: options.priority ?? 0,
        scheduledAt: options.scheduledAt ?? new Date(),
      },
    });

    // Process asynchronously (don't block the request)
    this.processNext();

    return job;
  }

  private async processNext() {
    if (this.processing) return;
    this.processing = true;

    try {
      while (true) {
        const job = await db.job.findFirst({
          where: {
            status: "QUEUED",
            scheduledAt: { lte: new Date() },
          },
          orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
        });

        if (!job) break;

        // Mark as processing
        await db.job.update({
          where: { id: job.id },
          data: { status: "PROCESSING", startedAt: new Date() },
        });

        const handler = this.handlers.get(job.type);
        if (!handler) {
          await db.job.update({
            where: { id: job.id },
            data: { status: "FAILED", error: `No handler for job type: ${job.type}`, completedAt: new Date() },
          });
          continue;
        }

        try {
          const payload = JSON.parse(job.payload);
          const result = await handler(payload);
          await db.job.update({
            where: { id: job.id },
            data: {
              status: "COMPLETED",
              result: result ? JSON.stringify(result) : null,
              completedAt: new Date(),
            },
          });
        } catch (e: any) {
          const attempts = job.attempts + 1;
          await db.job.update({
            where: { id: job.id },
            data: {
              status: attempts >= job.maxAttempts ? "FAILED" : "QUEUED",
              attempts,
              error: e.message,
              completedAt: attempts >= job.maxAttempts ? new Date() : null,
            },
          });
        }
      }
    } finally {
      this.processing = false;
    }
  }

  async getStats() {
    const [queued, processing, completed, failed] = await Promise.all([
      db.job.count({ where: { status: "QUEUED" } }),
      db.job.count({ where: { status: "PROCESSING" } }),
      db.job.count({ where: { status: "COMPLETED" } }),
      db.job.count({ where: { status: "FAILED" } }),
    ]);
    return { queued, processing, completed, failed };
  }
}

export const jobQueue = new JobQueue();

// Register built-in job handlers
jobQueue.register("cache_invalidate", async (payload) => {
  const { cache } = await import("./cache");
  if (payload.pattern) await cache.delPattern(payload.pattern);
  return { invalidated: payload.pattern };
});

jobQueue.register("audit_log", async (payload) => {
  await db.auditLog.create({ data: payload });
  return { logged: true };
});

jobQueue.register("notification_create", async (payload) => {
  await db.notification.create({ data: payload });
  return { created: true };
});

jobQueue.register("report_generate", async (payload) => {
  // Simulate report generation
  await new Promise((r) => setTimeout(r, 1000));
  return { reportId: `RPT-${Date.now()}`, type: payload.type };
});

jobQueue.register("backup_database", async (payload) => {
  // In production: trigger actual DB backup
  await new Promise((r) => setTimeout(r, 500));
  return { backupId: `BK-${Date.now()}`, size: "42 MB" };
});
