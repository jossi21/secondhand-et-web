import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch, ServerApiError } from "@/lib/api-server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await serverApiFetch(`/users/${id}/restore`, { method: "POST" });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const status = err instanceof ServerApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ message }, { status });
  }
}
