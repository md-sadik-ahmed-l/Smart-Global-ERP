// This file is ERROR - there should be NO auth callback directories at all
// NextAuth's catch-all route [name] in src/app/api/auth/[...nextauth]/route.ts
// handles ALL NextAuth routes including /api/auth/callback/credentials
// Any individual callback files CONFLICT with NextAuth's routing system
// REMOVE THIS DIRECTORY IMMEDIATELY

const legacyAuthCallbackCleanup = {
  error: "Unprocessable Entity",
  message: "ERROR: src/app/api/auth/callback directory should not exist",
  instructions: "Remove all files in src/app/api/auth/callback/ to fix NextAuth routing conflicts"
};

export default function ErrorPage() {
  return <div>Error: Unauthorized auth callback route</div>;
}