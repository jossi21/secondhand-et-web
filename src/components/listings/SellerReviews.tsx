"use client";

import { Star, Pencil, Trash2 } from "lucide-react";
import { RatingResponse } from "@/lib/types";

function Stars({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-0.5 text-terracotta">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={
            n <= score ? "fill-terracotta text-terracotta" : "text-border"
          }
        />
      ))}
    </span>
  );
}

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function SellerReviews({
  average,
  count,
  ratings,
  currentUserId,
  onEditOwn,
  onDeleteOwn,
}: {
  average: number;
  count: number;
  ratings: RatingResponse[];
  currentUserId?: string;
  onEditOwn?: (rating: RatingResponse) => void;
  onDeleteOwn?: (rating: RatingResponse) => void;
}) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Reviews</h2>
        <div className="flex items-center gap-2">
          <Stars score={Math.round(average)} />
          <span className="font-mono-data text-sm text-ink-soft">
            {average.toFixed(1)} ({count})
          </span>
        </div>
      </div>

      {ratings.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          No reviews yet — be the first to rate this seller.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-border">
          {ratings.map((r) => {
            const isOwn = r.fromUserId === currentUserId;
            return (
              <div key={r.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {r.fromUserName ?? "Anonymous"}
                    </span>
                    {isOwn && (
                      <span className="rounded-full bg-terracotta-tint px-2 py-0.5 text-xs font-medium text-terracotta">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Stars score={r.score} />
                    {isOwn && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditOwn?.(r)}
                          aria-label="Edit your review"
                          className="text-ink-soft hover:text-terracotta"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteOwn?.(r)}
                          aria-label="Delete your review"
                          className="text-ink-soft hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {r.comment && (
                  <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>
                )}
                <p className="mt-1 font-mono-data text-xs text-ink-soft/70">
                  {timeAgo(r.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
