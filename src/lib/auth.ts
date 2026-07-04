import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: "/" }, // we render login at /
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
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) throw new Error("No user found with this email");
        if (user.status !== "ACTIVE") throw new Error("Account is " + user.status.toLowerCase());

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) throw new Error("Incorrect password");

        // Update last login (non-blocking — don't fail login if this errors)
        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch (e) {
          console.error("Failed to update lastLoginAt:", e);
        }

        // Audit log (non-blocking)
        try {
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              entity: "User",
              entityId: user.id,
              details: `User ${user.email} signed in`,
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
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

// Helper to use in server components / API routes
export async function getCurrentUser() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  return session?.user;
}
