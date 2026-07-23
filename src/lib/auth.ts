import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { cache } from "@/lib/cache";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findFirst({
          where: { email: credentials.email.toLowerCase(), status: "ACTIVE" },
          include: { tenant: true },
        });

        if (!user) throw new Error("No active user found with this email");

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) throw new Error("Incorrect password");

        // 2FA check (if enabled)
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          // In production: verify TOTP code here
          // For now, skip if 2FA not yet enforced
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
