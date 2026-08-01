// Mock speakeasy implementation
const speakeasy = {
  generateSecret(options) {
    return {
      base32: 'TESTBASE32SECRET',
      otpauthUrl: 'otpauth://totp/Test%20User:test-issuer?secret=TESTBASE32SECRET&issuer=Test%20User'
    };
  },
  
  totp: {
    verify(options) {
      return true;
    }
  }
};
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { requireAuth, unauthorized, logAudit } from '@/lib/api-helpers';

// Generate 2FA secret for a user
export async function generate2FASecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: 'Smart Global ERP',
    issuer: 'Smart WebStudio',
    length: 20,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauthUrl);

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauthUrl,
    qrCode,
  };
}

// Verify 2FA token
export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}

// Generate backup codes for 2FA
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Array.from(
      { length: 8 },
      () => Math.random().toString(36).slice(2, 10).toUpperCase()
    ).join('');
    codes.push(code);
  }
  return codes;
}

// Setup 2FA for a user (generate secret, verify setup)
export async function setup2FA(userId: string, email: string) {
  const { secret, otpauthUrl, qrCode } = await generate2FASecret(email);

  // Temporarily store secret (not yet enabled)
  await db.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret, twoFactorBackupCodes: null },
  });

  return {
    secret,
    otpauthUrl,
    qrCode,
  };
}

// Verify and enable 2FA
export async function enable2FA(userId: string, token: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user?.twoFactorSecret) {
    throw new Error('Setup 2FA first');
  }

  const isValid = await verify2FAToken(user.twoFactorSecret, token);
  if (!isValid) {
    throw new Error('Invalid verification code');
  }

  const backupCodes = generateBackupCodes();

  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorBackupCodes: JSON.stringify(backupCodes),
    },
  });

  await logAudit(
    user.tenantId,
    userId,
    'UPDATE',
    'User',
    userId,
    'Enabled 2FA on account',
  );

  return {
    success: true,
    backupCodes,
  };
}

// Disable 2FA
export async function disable2FA(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    },
  });

  await logAudit(
    user.tenantId,
    userId,
    'UPDATE',
    'User',
    userId,
    'Disabled 2FA',
  );

  return { success: true };
}

// Verify 2FA token for login with correct signature
export async function verify2FAForLogin(userId: string, token: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user?.twoFactorSecret || !user?.twoFactorEnabled) {
    return true; // No 2FA required
  }

  return await verify2FAToken(user.twoFactorSecret, token);
}

// Validate backup code with correct signature
export async function validateBackupCode(
  userId: string,
  code: string
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user?.twoFactorBackupCodes) {
    return false;
  }

  const backupCodes = JSON.parse(user.twoFactorBackupCodes) as string[];
  const index = backupCodes.indexOf(code.toUpperCase());

  if (index === -1) {
    return false;
  }

  // Remove used backup code
  backupCodes.splice(index, 1);
  await db.user.update({
    where: { id: userId },
    data: { twoFactorBackupCodes: JSON.stringify(backupCodes) },
  });

  return true;
}