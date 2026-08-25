import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch, ServerApiError } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();

  try {
    const data = await serverApiFetch(`/users${query ? `?${query}` : ""}`, {
      method: "GET",
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = err instanceof ServerApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ message }, { status });
  }
}
