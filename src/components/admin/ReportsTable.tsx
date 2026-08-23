"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { ReportResponse } from "@/lib/types";

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function ReportsTable() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef(false);

  const load = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ReportResponse[]>("/reports", {
        signal: controller.signal,
      });
      if (isMountedRef.current) {
        setReports(data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setError(
          error instanceof Error ? error.message : "Failed to load reports",
        );
        setReports([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      await load();
    };
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  async function handleRemoveListing(report: ReportResponse) {
    if (
      !confirm(
        `Remove listing "${report.listingTitle ?? report.listingId}" from the marketplace?`,
      )
    )
      return;

    setActingOn(report.id);
    setError(null);
    try {
      await apiFetch(`/listings/${report.listingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "removed" }),
      });
      // Remove the report from the list after successful action
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to remove listing",
      );
    } finally {
      setActingOn(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            Reports
          </h2>
        </div>
        <p className="px-6 py-8 text-center text-ink-soft">Loading reports…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            Reports
          </h2>
        </div>
        <div className="px-6 py-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => load()}
            className="mt-2 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="border-b border-border px-6 py-4 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            Reports
          </h2>
          <span className="rounded-full bg-terracotta/10 px-3 py-1 text-sm font-medium text-terracotta">
            {reports.length} {reports.length === 1 ? "report" : "reports"}
          </span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span className="text-4xl">🛡️</span>
          <p className="font-medium text-ink">No reports filed</p>
          <p className="text-sm text-ink-soft">
            The marketplace is looking clean. All listings are in good standing.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft bg-gray-50/30">
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Listing
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Reason
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Reported By
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Date
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-border last:border-0 hover:bg-cream-dim/30 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-ink whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500">⚠️</span>
                      <span className="truncate max-w-50">
                        {report.listingTitle ?? report.listingId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-ink-soft max-w-xs">
                    <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      {report.reason}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-ink-soft whitespace-nowrap">
                    {report.reportedByName ?? report.reportedById}
                  </td>
                  <td className="px-6 py-3 font-mono-data text-ink-soft whitespace-nowrap">
                    {timeAgo(report.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleRemoveListing(report)}
                      disabled={actingOn === report.id}
                      className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actingOn === report.id ? (
                        <span className="flex items-center gap-1">
                          <svg
                            className="animate-spin h-3 w-3"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Removing…
                        </span>
                      ) : (
                        "Remove Listing"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
