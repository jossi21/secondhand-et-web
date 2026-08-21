import { NextRequest, NextResponse } from "next/server";
import { serverApiFetch, ServerApiError } from "@/lib/api-server";

function handleError(err: unknown) {
  const status = err instanceof ServerApiError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Something went wrong";
  return NextResponse.json({ message }, { status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.text();

  try {
    const data = await serverApiFetch(`/users/${id}`, {
      method: "PATCH",
      body,
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await serverApiFetch(`/users/${id}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
