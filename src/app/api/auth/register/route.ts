import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:4000";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
