import { NextRequest, NextResponse } from "next/server";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { requireAuth, unauthorized, logAudit } from "@/lib/api-helpers";

// POST /api/security/2fa/setup — Generate QR code for 2FA enrollment
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const user = session.user as any;
  const existingUser = await db.user.findUnique({ where: { id: user.id } });
  if (existingUser?.twoFactorEnabled) {
    return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 });
  }

  // Generate new secret
  const secret = generateSecret();
  const serviceName = "Smart Global ERP";
  // Remove: authenticator.keyuri - no longer exists in otplib

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, { width: 240 });

  // Temporarily store secret (not yet enabled — user must verify with a code first)
  await db.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret },
  });

  return NextResponse.json({
    secret,
    qrCode: qrCodeDataUrl,
    otpauthUrl,
    message: "Scan this QR code with Google Authenticator / Authy, then verify with a 6-digit code",
  });
}

// PUT /api/security/2fa/verify — Verify 2FA code and enable
export async function PUT(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  try {
    const { code } = await req.json();
    const user = session.user as any;
    const dbUser = await db.user.findUnique({ where: { id: user.id } });

    if (!dbUser?.twoFactorSecret) {
      return NextResponse.json({ error: "Setup 2FA first" }, { status: 400 });
    }

    const isValid = authenticator.verify({ token: code, secret: dbUser.twoFactorSecret });
    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).slice(2, 10).toUpperCase()
    );

    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
      },
    });

    await logAudit(user.id, "UPDATE", "User", user.id, "Enabled 2FA on account", { tenantId: user.tenantId, severity: "warning" });

    return NextResponse.json({
      success: true,
      backupCodes,
      message: "2FA enabled successfully. Save these backup codes in a secure location.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE /api/security/2fa — Disable 2FA
export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return unauthorized();

  const user = session.user as any;
  await db.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    },
  });

  await logAudit(user.id, "UPDATE", "User", user.id, "Disabled 2FA", { tenantId: user.tenantId, severity: "warning" });
  return NextResponse.json({ success: true, message: "2FA disabled" });
}
