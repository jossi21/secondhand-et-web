"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { FormModal } from "@/components/ui/FormModal";
import { createRating, updateRating } from "@/lib/api/ratings";
import { RatingResponse } from "@/lib/types";
import { ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

export function RateSellerModal({
  sellerId,
  existing,
  onClose,
  onSaved,
}: {
  sellerId: string;
  existing?: RatingResponse | null;
  onClose: () => void;
  onSaved: (rating: RatingResponse) => void;
}) {
  const toast = useToast();
  const [score, setScore] = useState(existing?.score ?? 5);
  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = existing
        ? await updateRating(existing.id, {
            score,
            comment: comment.trim() || undefined,
          })
        : await createRating({
            toUserId: sellerId,
            score,
            comment: comment.trim() || undefined,
          });

      toast.success(
        existing ? "Review updated" : "Review submitted",
        "Thanks for sharing your experience.",
      );
      onSaved(result);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const displayScore = hoverScore ?? score;

  return (
    <FormModal
      title={existing ? "Edit your review" : "Rate this seller"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              onMouseEnter={() => setHoverScore(n)}
              onMouseLeave={() => setHoverScore(null)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className="p-1"
            >
              <Star
                size={32}
                className={
                  n <= displayScore
                    ? "fill-terracotta text-terracotta"
                    : "text-border"
                }
              />
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-xs text-ink-soft">
            Comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your experience with this seller?"
            rows={3}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
          >
            {submitting
              ? "Submitting…"
              : existing
                ? "Save Changes"
                : "Submit Review"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
          >
            Cancel
          </button>
        </div>
      </form>
    </FormModal>
  );
}
