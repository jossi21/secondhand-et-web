"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { RatingResponse } from "@/lib/types";

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

  useEffect(() => {
    apiFetch<RatingResponse[]>("/ratings")
      .then(setRatings)
      .catch(() => setRatings([]))
      .finally(() => setLoading(false));
  }, []);

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
        ) : ratings.length === 0 ? (
          <p className="px-6 py-8 text-center text-ink-soft">
            No reviews have been left yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {ratings.map((rating) => (
              <div key={rating.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-medium text-ink">
                      {rating.fromUserName ?? rating.fromUserId}
                    </span>
                    <span className="text-ink-soft"> rated </span>
                    <span className="font-medium text-ink">
                      {rating.toUserName ?? rating.toUserId}
                    </span>
                  </p>
                  <span className="font-mono-data text-xs text-ink-soft">
                    {timeAgo(rating.createdAt)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Stars score={rating.score} />
                  <span className="font-mono-data text-xs text-ink-soft">
                    {rating.score}/5
                  </span>
                </div>
                {rating.comment && (
                  <p className="mt-1 text-sm text-ink-soft">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
