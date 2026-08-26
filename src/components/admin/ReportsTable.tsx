"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { dismissReport } from "@/lib/api/reports";
import { ReportResponse } from "@/lib/types";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

type PendingAction = {
  type: "dismiss" | "remove";
  report: ReportResponse;
};

export function ReportsTable() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ReportResponse[]>("/reports", {
        signal: controller.signal,
      });
      setReports(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => abortControllerRef.current?.abort();
  }, [load]);

  async function confirmPendingAction() {
    if (!pending) return;
    const { type, report } = pending;

    try {
      if (type === "dismiss") {
        await dismissReport(report.id);
        toast.success("Report dismissed", "The listing stays live.");
      } else {
        await apiFetch(`/listings/${report.listingId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "removed" }),
        });
        toast.success("Listing removed", "It's no longer visible to buyers.");
      }
    } catch (err) {
      toast.error(
        type === "dismiss"
          ? "Failed to dismiss report"
          : "Failed to remove listing",
        err instanceof ApiError ? err.message : undefined,
      );
    } finally {
      // Refresh from the server either way, so the table reflects
      // reality even if the optimistic assumption above was wrong.
      load();
    }
  }

  function menuItemsFor(report: ReportResponse): DropdownItem[] {
    return [
      {
        label: "View Detail",
        onSelect: () => router.push(`/admin/reports/${report.id}`),
      },
      {
        label: "Dismiss",
        onSelect: () => setPending({ type: "dismiss", report }),
      },
      {
        label: "Remove Listing",
        variant: "danger",
        onSelect: () => setPending({ type: "remove", report }),
      },
    ];
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
                    <div className="flex justify-end">
                      <Dropdown
                        align="right"
                        trigger={
                          <button
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Open actions menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                        items={menuItemsFor(report)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirmPendingAction}
        title={
          pending?.type === "dismiss"
            ? "Dismiss this report?"
            : "Remove this listing?"
        }
        description={
          pending?.type === "dismiss" ? (
            <>
              The report on{" "}
              <span className="font-medium text-slate-700">
                {pending.report.listingTitle ?? pending.report.listingId}
              </span>{" "}
              will be cleared. The listing stays live.
            </>
          ) : pending?.type === "remove" ? (
            <>
              <span className="font-medium text-slate-700">
                {pending.report.listingTitle ?? pending.report.listingId}
              </span>{" "}
              will be taken off the marketplace. This can&apos;t be undone.
            </>
          ) : undefined
        }
      />
    </div>
  );
}
