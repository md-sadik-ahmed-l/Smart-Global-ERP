import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Testing 401 error (Unauthorized)",
    error: "401 Unauthorized",
    stack: "Missing or invalid credentials for this protected route"
  }, { status: 401 });
}

export async function POST() {
  return NextResponse.json({
    message: "Testing 404 error (Not Found)",
    error: "404 Not Found",
    stack: "The requested NextAuth credentials callback endpoint does not exist"
  }, { status: 404 });
}