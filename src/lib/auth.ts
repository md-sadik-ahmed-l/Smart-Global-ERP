import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";
import { verify2FAForLogin } from "@/lib/twoFactor";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorToken: { label: "2FA Code", type: "text", description: "Enter 6-digit code from your authenticator app (if 2FA is enabled)" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Rate limiting: prevent brute force attacks
        const { getRedis } = await import("./redis");
        const redis = await getRedis();
        const clientKey = `auth:${credentials.email.toLowerCase()}`;
        const key = `rate_limit:${clientKey}`;
        const maxRequests = 10;
        const windowMs = 60 * 1000;

        // Redis-based rate limiting
        const now = Date.now();
        const expiry = now + windowMs;

        // Get current count
        const current = await redis.get(key);
        let count = current ? parseInt(current) : 0;

        if (count === 0) {
          await redis.set(key, "1", "EX", Math.ceil(windowMs / 1000));
          count = 1;
        } else if (count < maxRequests) {
          await redis.incr(key);
          count++;
        }

        if (count >= maxRequests) {
          throw new Error("Too many login attempts. Please try again in 1 minute.");
        }

        const user = await db.user.findFirst({
          where: { email: credentials.email.toLowerCase(), status: "ACTIVE" },
          include: { tenant: true },
        });

        if (!user) throw new Error("No active user found with this email");

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) throw new Error("Incorrect password");

        // 2FA check (if enabled)
        if (user.twoFactorEnabled && user.twoFactorSecret && !credentials?.twoFactorToken) {
          throw new Error("2FA verification required - please enter your 6-digit code from authenticator app");
        }

        if (user.twoFactorEnabled && user.twoFactorSecret && credentials?.twoFactorToken) {
          const { verify2FAToken } = await import("./twoFactor");
          const is2FAValid = await verify2FAToken(user.twoFactorSecret, credentials.twoFactorToken);
          if (!is2FAValid) {
            throw new Error("Invalid 2FA code");
          }
        }

        // Non-blocking updates
        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch (e) {
          console.error("Failed to update lastLoginAt:", e);
        }

        try {
          await db.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: user.id,
              action: "LOGIN",
              entity: "User",
              entityId: user.id,
              details: `User ${user.email} signed in to tenant ${user.tenant?.name}`,
            },
          });
        } catch (e) {
          console.error("Failed to write audit log:", e);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          branchId: user.branchId,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.branchId = (user as any).branchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).branchId = token.branchId;
      }
      return session;
    },
  },
};

export async function getCurrentUser() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  return session?.user;
}
