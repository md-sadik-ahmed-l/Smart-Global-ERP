export { default as "*" } from "next-auth"; // Catch-all route for NextAuth

// DO NOT create any individual NextAuth endpoint files like:
// src/app/api/auth/callback-credentials-route.ts
// src/app/api/auth/callback.ts
// src/app/api/auth/credentials/route.ts
// src/app/api/auth/session/route.ts
// etc.

// All NextAuth routes are handled by the [name] catch-all at:
// src/app/api/auth/[...nextauth]/route.ts

// This file is here to maintain backward compatibility but
// should be removed in production to avoid routing conflicts.