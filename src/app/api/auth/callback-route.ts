import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Callback endpoint for credentials provider",
    callbackType: "credentials",
    authStatus: "available",
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({
    message: "Callback received from credentials provider",
    callbackType: "credentials",
    status: "processed"
  });
}