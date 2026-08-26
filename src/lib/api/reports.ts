import { apiFetch } from "@/lib/api";
import type { ReportResponse } from "@/lib/types";

export async function createReport(
  listingId: string,
  reason: string,
): Promise<ReportResponse> {
  return apiFetch<ReportResponse>("/reports", {
    method: "POST",
    body: JSON.stringify({ listingId, reason }),
  });
}

export async function dismissReport(reportId: string): Promise<void> {
  return apiFetch(`/reports/${reportId}`, { method: "DELETE" });
}

export async function getReportById(reportId: string): Promise<ReportResponse> {
  return apiFetch<ReportResponse>(`/reports/${reportId}`);
}
