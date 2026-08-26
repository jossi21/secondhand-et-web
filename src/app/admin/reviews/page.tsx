"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  MoreVertical,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Filter ratings based on search query
  const filteredRatings = useMemo(() => {
    if (!searchQuery.trim()) return ratings;

    const query = searchQuery.toLowerCase().trim();
    return ratings.filter(
      (rating) =>
        (rating.fromUserName &&
          rating.fromUserName.toLowerCase().includes(query)) ||
        (rating.toUserName &&
          rating.toUserName.toLowerCase().includes(query)) ||
        (rating.listingTitle &&
          rating.listingTitle.toLowerCase().includes(query)) ||
        (rating.comment && rating.comment.toLowerCase().includes(query)) ||
        rating.fromUserId.toLowerCase().includes(query) ||
        rating.toUserId.toLowerCase().includes(query),
    );
  }, [ratings, searchQuery]);

  // Pagination logic
  const totalItems = filteredRatings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRatings.slice(startIndex, endIndex);

  // Reset to first page when search or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Reviews &amp; Comments
          </h1>
          <p className="mt-1 text-ink-soft">
            Every rating buyers have left for sellers, platform-wide.
          </p>
        </div>
        <div className="text-sm text-ink-soft whitespace-nowrap pt-1">
          Total: <span className="font-medium text-ink">{ratings.length}</span>{" "}
          reviews
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              isSearchFocused || searchQuery
                ? "text-terracotta"
                : "text-ink-soft/60"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search by reviewer, seller, item, or comment..."
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition-all placeholder:text-ink-soft/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60 hover:text-ink transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="mt-2 text-xs text-ink-soft">
            Found{" "}
            <span className="font-medium text-ink">
              {filteredRatings.length}
            </span>{" "}
            results
            {filteredRatings.length !== ratings.length && (
              <span className="ml-1">
                (filtered from{" "}
                <span className="font-medium text-ink">{ratings.length}</span>{" "}
                total)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
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
        ) : filteredRatings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-ink-soft">
              {searchQuery
                ? "No reviews match your search."
                : "No reviews have been left yet."}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-2 text-sm text-terracotta hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-6 py-3 font-medium">Reviewer</th>
                    <th className="px-6 py-3 font-medium">Item</th>
                    <th className="px-6 py-3 font-medium">Seller</th>
                    <th className="px-6 py-3 font-medium">Rating</th>
                    <th className="px-6 py-3 font-medium">Comment</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((rating) => (
                    <tr
                      key={rating.id}
                      className="hover:bg-cream-dim/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-ink whitespace-nowrap">
                        {rating.fromUserName ?? rating.fromUserId}
                      </td>
                      <td className="px-6 py-4 text-ink-soft max-w-[150px] truncate">
                        {rating.listingTitle ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-ink-soft whitespace-nowrap">
                        {rating.toUserName ?? rating.toUserId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Stars score={rating.score} />
                          <span className="font-mono-data text-xs text-ink-soft">
                            {rating.score}/5
                          </span>
                        </div>
                      </td>
                      <td className="max-w-xs px-6 py-4 text-ink-soft">
                        {rating.comment ? (
                          <span className="line-clamp-2">{rating.comment}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono-data text-xs text-ink-soft whitespace-nowrap">
                        <div>
                          <div>{timeAgo(rating.createdAt)}</div>
                          <div className="text-[10px] text-ink-soft/60">
                            {formatDate(rating.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Dropdown
                          align="right"
                          trigger={
                            <button
                              aria-label="Open actions"
                              className="rounded-md p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink transition-colors"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-ink-soft">
                  <span>
                    Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of{" "}
                    {totalItems}
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="rounded-lg border border-border bg-white px-2 py-1 text-sm text-ink outline-none focus:border-terracotta"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm transition-colors ${
                            currentPage === pageNum
                              ? "bg-terracotta text-white"
                              : "text-ink-soft hover:bg-cream-dim hover:text-ink"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
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
