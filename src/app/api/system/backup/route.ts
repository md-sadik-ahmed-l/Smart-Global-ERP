import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, logAudit } from "@/lib/api-helpers";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const execAsync = promisify(exec);

// GET /api/system/backup — list backups
export async function GET() {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const user = session.user as any;
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only admins can manage backups" }, { status: 403 });
  }

  const backups = await db.backupRecord.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ backups, total: backups.length });
}

// POST /api/system/backup — trigger a new database backup
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();
  const user = session.user as any;
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only admins can trigger backups" }, { status: 403 });
  }

  const { type = "full" } = await req.json().catch(() => ({}));
  const backupDir = path.join(process.cwd(), "backups");
  if (!existsSync(backupDir)) await mkdir(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `backup-${timestamp}.db`);
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./db/custom.db";

  const backup = await db.backupRecord.create({
    data: {
      tenantId: user.tenantId,
      type,
      status: "running",
      triggeredBy: user.id,
      startedAt: new Date(),
    },
  });

  try {
    // Copy the SQLite database file
    await execAsync(`cp "${dbPath}" "${backupPath}"`);

    const stats = await import("fs/promises").then((m) => m.stat(backupPath));
    await db.backupRecord.update({
      where: { id: backup.id },
      data: {
        status: "completed",
        fileSize: stats.size,
        fileUrl: backupPath,
        completedAt: new Date(),
      },
    });

    await logAudit(user.id, "CREATE", "BackupRecord", backup.id, `Created ${type} database backup`, { tenantId: user.tenantId, severity: "info" });

    return NextResponse.json({
      success: true,
      backupId: backup.id,
      path: backupPath,
      size: stats.size,
      message: "Backup completed successfully",
    });
  } catch (e: any) {
    await db.backupRecord.update({
      where: { id: backup.id },
      data: { status: "failed", error: e.message, completedAt: new Date() },
    });
    return NextResponse.json({ error: "Backup failed", details: e.message }, { status: 500 });
  }
}
