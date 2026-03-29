import { NextRequest, NextResponse } from "next/server";

/**
 * Validate CRON_SECRET from request headers.
 * Returns null if valid, or a NextResponse error if invalid.
 */
export function validateCronSecret(request: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET environment variable is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const provided =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!provided || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // valid
}
