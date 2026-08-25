"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { deleteRating } from "@/lib/api/ratings";
import { RatingResponse } from "@/lib/types";
import { Dropdown } from "@/components/ui/Dropdown";
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

function Stars({ score }: { score: number }) {
  return (
    <span className="text-terracotta">
      {"★".repeat(score)}
      <span className="text-border">{"★".repeat(5 - score)}</span>
    </span>
  );
}

export default function AdminReviewsPage() {
  const [ratings, setRatings] = useState<RatingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RatingResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<RatingResponse[]>("/ratings", {
        signal: controller.signal,
      });
      setRatings(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load reviews");
      setRatings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRating(deleteTarget.id);
      toast.success("Review deleted");
      load();
    } catch (err) {
      toast.error(
        "Couldn't delete review",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">
        Reviews &amp; Comments
      </h1>
      <p className="mt-1 text-ink-soft">
        Every rating buyers have left for sellers, platform-wide.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-white">
        {loading ? (
          <p className="px-6 py-8 text-center text-ink-soft">Loading…</p>
        ) : error ? (
          <div className="px-6 py-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => load()}
              className="mt-2 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark"
            >
              Retry
            </button>
          </div>
        ) : ratings.length === 0 ? (
          <p className="px-6 py-8 text-center text-ink-soft">
            No reviews have been left yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="flex items-start justify-between px-6 py-4"
              >
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium text-ink">
                      {rating.fromUserName ?? rating.fromUserId}
                    </span>
                    <span className="text-ink-soft"> rated </span>
                    <span className="font-medium text-ink">
                      {rating.toUserName ?? rating.toUserId}
                    </span>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars score={rating.score} />
                    <span className="font-mono-data text-xs text-ink-soft">
                      {rating.score}/5
                    </span>
                    <span className="font-mono-data text-xs text-ink-soft">
                      · {timeAgo(rating.createdAt)}
                    </span>
                  </div>
                  {rating.comment && (
                    <p className="mt-1 text-sm text-ink-soft">
                      {rating.comment}
                    </p>
                  )}
                </div>
                <Dropdown
                  align="right"
                  trigger={
                    <button
                      aria-label="Open actions"
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  }
                  items={[
                    {
                      label: "Delete",
                      variant: "danger",
                      onSelect: () => setDeleteTarget(rating),
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this review?"
        description={
          deleteTarget && (
            <>
              The review from{" "}
              <span className="font-medium text-slate-700">
                {deleteTarget.fromUserName ?? "this user"}
              </span>{" "}
              will be permanently removed.
            </>
          )
        }
      />
    </div>
  );
}
