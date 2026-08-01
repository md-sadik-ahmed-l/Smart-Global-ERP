import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// This is the ONLY NextAuth route - it should be at src/app/api/auth/[...nextauth]/route.ts
// All other NextAuth routes like credentials, providers, session etc.
// are handled by this single catch-all route
// DO NOT create any other individual NextAuth route files

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };