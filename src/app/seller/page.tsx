"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Search, X, Filter } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { SellerDashboardResponse } from "@/lib/types";
import { RequireRole } from "@/components/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { Dropdown } from "@/components/ui/Dropdown";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";
import { resolveMediaUrl } from "@/lib/media";
import { VerifyIdentityCard } from "@/components/seller/VerifyIdentityCard";

type SellerListing = SellerDashboardResponse["listings"][number];
type StatusFilter = "all" | "active" | "sold" | "removed";

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="font-mono-data text-2xl font-semibold text-ink">
          {value}
        </div>
        <div className="mt-0.5 text-sm text-ink-soft">{label}</div>
      </div>
    </div>
  );
}

function Stars({ score }: { score: number }) {
  return (
    <span className="text-sm text-terracotta">
      {"★".repeat(Math.round(score))}
      <span className="text-border">{"★".repeat(5 - Math.round(score))}</span>
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PAGE_SIZE = 7;

function SellerDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<SellerDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [soldTarget, setSoldTarget] = useState<SellerListing | null>(null);
  const [removeTarget, setRemoveTarget] = useState<SellerListing | null>(null);
  const { categories } = useCategories();
  const toast = useToast();

  // Search, filter, and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const dashboard =
        await apiFetch<SellerDashboardResponse>("/dashboard/seller");
      setData(dashboard);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (categoryId: string) => map.get(categoryId) ?? "Uncategorized";
  }, [categories]);

  // Filter and search listings
  const filteredListings = useMemo(() => {
    if (!data) return [];

    let result = data.listings;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          categoryName(item.categoryId).toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    return result;
  }, [data, searchQuery, statusFilter, categoryName]);

  // Pagination logic
  const totalItems = filteredListings.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const currentItems = filteredListings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";
  const activeFilterCount = [
    searchQuery.trim() !== "",
    statusFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    setBusyId(removeTarget.id);
    try {
      await apiFetch(`/listings/${removeTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "removed" }),
      });
      toast.success("Listing removed");
      setRemoveTarget(null);
      await load();
    } catch (err) {
      toast.error(
        "Couldn't remove listing",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleRestore(item: SellerListing) {
    setBusyId(item.id);
    try {
      await apiFetch(`/listings/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "active" }),
      });
      toast.success("Listing restored");
      await load();
    } catch (err) {
      toast.error(
        "Couldn't restore listing",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmMarkSold() {
    if (!soldTarget) return;
    setBusyId(soldTarget.id);
    try {
      await apiFetch(`/listings/${soldTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "sold" }),
      });
      toast.success("Listing marked as sold");
      setSoldTarget(null);
      await load();
    } catch (err) {
      toast.error(
        "Couldn't update listing",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-16 text-center text-ink-soft">
        Couldn&apos;t load your dashboard. Try refreshing the page.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-mono-data text-xs uppercase tracking-wide text-ink-soft">
            Seller Dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Welcome, {user?.fullName.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/listings/new"
          className="flex items-center gap-2 rounded-lg bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-terracotta-dark"
        >
          + Post New Listing
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="📋"
          value={data.activeListings}
          label="Active Listings"
        />
        <StatCard icon="✅" value={data.soldListings} label="Sold Listings" />
        <StatCard icon="👁️" value={data.totalViews} label="Total Views" />
        <StatCard
          icon="⭐"
          value={data.averageRating.toFixed(1)}
          label="Avg. Rating"
        />
      </div>

      {!user?.isVerified && (
        <div className="mb-6">
          <VerifyIdentityCard />
        </div>
      )}

      {/* Search and Filter Bar - Above the table */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
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
              placeholder="Search by title, description, or category..."
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition-all placeholder:text-ink-soft/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60 hover:text-ink transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="removed">Removed</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink-soft hover:border-ink/30 hover:bg-cream-dim transition-all whitespace-nowrap"
            >
              <X size={14} />
              Clear {activeFilterCount}
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                Search: &ldquo;{searchQuery}&ldquo;
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                Status:{" "}
                {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">My Listings</h2>
          <span className="text-xs text-ink-soft">
            {filteredListings.length} of {data.listings.length} total
          </span>
        </div>

        {data.listings.length === 0 ? (
          <p className="px-5 py-10 text-center text-ink-soft">
            You haven&apos;t posted any listings yet.
          </p>
        ) : filteredListings.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-ink-soft">
              No listings match your search or filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-terracotta hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-cream-dim font-mono-data text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-5 py-3 font-medium">Item</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Views</th>
                    <th className="px-5 py-3 font-medium">Posted</th>
                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-cream-dim/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-dim">
                            {item.images[0] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={resolveMediaUrl(item.images[0].url)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-ink">{item.title}</p>
                            <p className="text-xs text-ink-soft">
                              {categoryName(item.categoryId)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono-data font-medium text-ink">
                        ETB {item.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            item.status === "active"
                              ? "border-sage-bg bg-sage-bg text-sage"
                              : item.status === "sold"
                                ? "border-border bg-cream-dim text-ink-soft"
                                : "border-red-100 bg-red-50 text-red-600"
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-ink-soft">
                        {item.viewCount}
                      </td>
                      <td className="px-5 py-4 text-ink-soft">
                        <div>
                          <div>{timeAgo(item.createdAt)}</div>
                          <div className="text-[10px] text-ink-soft/60">
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Dropdown
                          align="right"
                          trigger={
                            <button
                              aria-label="Open actions"
                              disabled={busyId === item.id}
                              className="rounded-full p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-60"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          }
                          items={[
                            {
                              label: "View",
                              onSelect: () =>
                                router.push(`/listings/${item.id}`),
                            },
                            {
                              label: "Edit",
                              onSelect: () =>
                                router.push(`/listings/${item.id}/edit`),
                            },
                            ...(item.status === "active"
                              ? [
                                  {
                                    label: "Mark Sold",
                                    onSelect: () => setSoldTarget(item),
                                  },
                                ]
                              : []),
                            ...(item.status !== "removed"
                              ? [
                                  {
                                    label: "Remove listing",
                                    variant: "danger" as const,
                                    onSelect: () => setRemoveTarget(item),
                                  },
                                ]
                              : [
                                  {
                                    label: "Restore listing",
                                    onSelect: () => handleRestore(item),
                                  },
                                ]),
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
              <div className="flex items-center justify-between border-t border-border px-5 py-4">
                <div className="text-sm text-ink-soft">
                  Showing {startIndex + 1}–{endIndex} of {totalItems}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum) => (
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
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Recent Ratings</h2>
          </div>
          {data.recentRatings.length === 0 ? (
            <p className="px-5 py-10 text-center text-ink-soft">
              No ratings yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {data.recentRatings.map((r) => (
                <div key={r.id} className="px-5 py-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">
                      {r.fromUserName ?? "Anonymous"}
                    </span>
                    <Stars score={r.score} />
                  </div>
                  {r.comment && (
                    <p className="mb-1.5 text-sm text-ink-soft">{r.comment}</p>
                  )}
                  <p className="font-mono-data text-xs text-ink-soft/70">
                    {timeAgo(r.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Recent Reports</h2>
          </div>
          {data.recentReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage-bg text-2xl">
                🛡️
              </span>
              <p className="mb-1 text-sm font-medium text-ink">
                No reports on your listings
              </p>
              <p className="text-xs text-ink-soft">
                Keep being an honest seller!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.recentReports.map((r) => (
                <div key={r.id} className="px-5 py-4">
                  <p className="text-sm font-medium text-ink">
                    {r.listingTitle ?? r.listingId}
                  </p>
                  <p className="text-sm text-ink-soft">{r.reason}</p>
                  <p className="mt-1 font-mono-data text-xs text-ink-soft/70">
                    {timeAgo(r.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DeleteDialog
        open={!!soldTarget}
        onClose={() => setSoldTarget(null)}
        onConfirm={handleConfirmMarkSold}
        title="Mark this listing as sold?"
        itemName={soldTarget?.title}
        description={
          soldTarget && (
            <>
              <span className="font-medium">{soldTarget.title}</span> will be
              marked sold and removed from active browsing.
            </>
          )
        }
      />
      <DeleteDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleConfirmRemove}
        title="Remove this listing?"
        itemName={removeTarget?.title}
        description={
          removeTarget && (
            <>
              <span className="font-medium">{removeTarget.title}</span> will be
              taken off the marketplace. You can restore it later from this
              dashboard.
            </>
          )
        }
      />
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <RequireRole roles={["seller"]}>
      <SellerDashboardContent />
    </RequireRole>
  );
}
