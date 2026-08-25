"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getReportById, dismissReport } from "@/lib/api/reports";
import { ReportResponse } from "@/lib/types";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";

type PendingAction = "dismiss" | "remove" | null;

export function ReportDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await getReportById(id);
      setReport(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      }
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleConfirm() {
    if (!report || !pending) return;
    try {
      if (pending === "dismiss") {
        await dismissReport(report.id);
        toast.success("Report dismissed", "The listing stays live.");
      } else {
        await apiFetch(`/listings/${report.listingId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "removed" }),
        });
        toast.success("Listing removed", "It's no longer visible to buyers.");
      }
      router.push("/admin/reports");
    } catch (err) {
      toast.error(
        pending === "dismiss"
          ? "Failed to dismiss report"
          : "Failed to remove listing",
        err instanceof ApiError ? err.message : undefined,
      );
    } finally {
    }
  }

  if (loading) {
    return <p className="px-6 py-8 text-center text-ink-soft">Loading…</p>;
  }

  if (notFound || !report) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-ink-soft">
          {notFound
            ? "This report no longer exists — it may have already been resolved."
            : "Couldn't load this report."}
        </p>
        <button
          onClick={() => router.push("/admin/reports")}
          className="mt-3 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
        >
          Back to reports
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm font-medium text-ink-soft hover:text-ink"
        >
          ← Go back
        </button>

        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-xl font-semibold text-ink">
              Report Detail
            </h1>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
              Pending review
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="font-mono-data text-xs text-ink-soft">Listing</p>

              <a
                href={`/listings/${report.listingId}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-terracotta hover:underline"
              >
                {report.listingTitle ?? report.listingId}
              </a>
            </div>

            <div className="sm:col-span-2">
              <p className="font-mono-data text-xs text-ink-soft">Reason</p>
              <p className="mt-1 whitespace-pre-line font-medium text-ink">
                {report.reason}
              </p>
            </div>

            <div>
              <p className="font-mono-data text-xs text-ink-soft">
                Reported By
              </p>
              <p className="font-medium text-ink">
                {report.reportedByName ?? "—"}
              </p>
            </div>

            <div>
              <p className="font-mono-data text-xs text-ink-soft">
                Reporter ID
              </p>
              <p className="truncate font-mono text-xs text-ink">
                {report.reportedById}
              </p>
            </div>

            <div>
              <p className="font-mono-data text-xs text-ink-soft">Filed On</p>
              <p className="font-medium text-ink">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="font-mono-data text-xs text-ink-soft">Report ID</p>
              <p className="truncate font-mono text-xs text-ink">{report.id}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="font-mono-data text-xs text-ink-soft">Listing ID</p>
              <p className="truncate font-mono text-xs text-ink">
                {report.listingId}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setPending("dismiss")}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
            >
              Dismiss Report
            </button>
            <button
              onClick={() => setPending("remove")}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Remove Listing
            </button>
          </div>
        </div>

        <DeleteDialog
          open={pending !== null}
          onClose={() => setPending(null)}
          onConfirm={handleConfirm}
          title={
            pending === "dismiss"
              ? "Dismiss this report?"
              : "Remove this listing?"
          }
          description={
            pending === "dismiss" ? (
              <>
                The report on{" "}
                <span className="font-medium text-slate-700">
                  {report.listingTitle ?? report.listingId}
                </span>{" "}
                will be cleared. The listing stays live.
              </>
            ) : (
              <>
                <span className="font-medium text-slate-700">
                  {report.listingTitle ?? report.listingId}
                </span>{" "}
                will be taken off the marketplace. This can&apos;t be undone.
              </>
            )
          }
        />
      </div>
    </>
  );
}
