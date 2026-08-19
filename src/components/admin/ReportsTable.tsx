"use client";

import { useEffect, useState } from "react";
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

  async function load(guard?: { cancelled: boolean }) {
    setLoading(true);
    try {
      const data = await apiFetch<ReportResponse[]>("/reports");
      if (guard?.cancelled) return;
      setReports(data);
    } catch {
      if (guard?.cancelled) return;
      setReports([]);
    } finally {
      if (guard?.cancelled) return;
      setLoading(false);
    }
  }

  useEffect(() => {
    const guard = { cancelled: false };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- documented fetch-in-effect pattern with cancellation guard, see https://react.dev/learn/you-might-not-need-an-effect
    load(guard);
    return () => {
      guard.cancelled = true;
    };
  }, []);

  async function handleRemoveListing(report: ReportResponse) {
    if (
      !confirm(
        `Remove listing "${report.listingTitle ?? report.listingId}" from the marketplace?`,
      )
    )
      return;

    setActingOn(report.id);
    try {
      await apiFetch(`/listings/${report.listingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "removed" }),
      });
      alert("Listing removed.");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to remove listing");
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-xl font-semibold text-ink">Reports</h2>
      </div>

      {loading ? (
        <p className="px-6 py-8 text-center text-ink-soft">Loading…</p>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <span className="text-2xl">🛡️</span>
          <p className="font-medium text-ink">No reports filed</p>
          <p className="text-sm text-ink-soft">
            The marketplace is looking clean.
          </p>
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-6 py-3 font-medium">Listing</th>
              <th className="px-6 py-3 font-medium">Reason</th>
              <th className="px-6 py-3 font-medium">Reported By</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-6 py-3 font-medium text-ink">
                  {report.listingTitle ?? report.listingId}
                </td>
                <td className="max-w-xs px-6 py-3 text-ink-soft">
                  {report.reason}
                </td>
                <td className="px-6 py-3 text-ink-soft">
                  {report.reportedByName ?? report.reportedById}
                </td>
                <td className="px-6 py-3 font-mono-data text-ink-soft">
                  {timeAgo(report.createdAt)}
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleRemoveListing(report)}
                    disabled={actingOn === report.id}
                    className="font-medium text-red-600 hover:underline disabled:opacity-60"
                  >
                    {actingOn === report.id ? "Removing…" : "Remove Listing"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
