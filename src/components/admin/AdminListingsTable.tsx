"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MoreVertical, Search, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  searchListings,
  updateListing,
  deleteListing,
} from "@/lib/api/listings";
import { ListingResponse } from "@/lib/types";
import { useCategories } from "@/hooks/useCategories";
import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";
import { EditListingCard } from "@/components/admin/EditListingCard";

type StatusTab = "all" | "active" | "sold" | "removed";

const TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "removed", label: "Removed" },
];

const PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 400;

function statusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "sold":
      return "bg-blue-100 text-blue-700";
    case "removed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US");
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function AdminListingsTable() {
  const [tab, setTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<ListingResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListingResponse | null>(
    null,
  );
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { categories } = useCategories();
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useToast();

  // Debounce the free-text search box into `q`
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await searchListings(
        {
          status: tab,
          page,
          limit: PAGE_SIZE,
          q: q || undefined,
          categoryId: categoryId || undefined,
          city: city || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        },
        controller.signal,
      );
      setListings(result.data);
      setTotal(result.total);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof ApiError ? err.message : "Failed to load listings",
      );
      setListings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [tab, page, q, categoryId, city, minPrice, maxPrice]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  function changeTab(next: StatusTab) {
    setTab(next);
    setPage(1);
  }

  function clearFilters() {
    setSearchInput("");
    setQ("");
    setCategoryId("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  }

  const hasActiveFilters = q || categoryId || city || minPrice || maxPrice;
  const activeFilterCount = [q, categoryId, city, minPrice, maxPrice].filter(
    Boolean,
  ).length;

  const handleFilterChange = (setter: (value: string) => void) => {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  };

  async function handleQuickStatus(
    listing: ListingResponse,
    status: "active" | "sold" | "removed",
  ) {
    try {
      await updateListing(listing.id, { status });
      toast.success(`Marked as ${status}`);
      load();
    } catch (err) {
      toast.error(
        "Couldn't update status",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteListing(deleteTarget.id);
      toast.success("Listing deleted");
      load();
    } catch (err) {
      toast.error(
        "Couldn't delete listing",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    }
  }

  const getMenuItemsFor = useCallback(
    (listing: ListingResponse): DropdownItem[] => {
      const items: DropdownItem[] = [
        {
          label: "View",
          onSelect: () => window.open(`/listings/${listing.id}`, "_blank"),
        },
        {
          label: "Edit",
          onSelect: () => setEditTarget(listing),
        },
      ];

      if (listing.status !== "active") {
        items.push({
          label: "Mark Active",
          onSelect: () => handleQuickStatus(listing, "active"),
        });
      }
      if (listing.status !== "sold") {
        items.push({
          label: "Mark Sold",
          onSelect: () => handleQuickStatus(listing, "sold"),
        });
      }
      if (listing.status !== "removed") {
        items.push({
          label: "Mark Removed",
          onSelect: () => handleQuickStatus(listing, "removed"),
        });
      }

      items.push({
        label: "Delete",
        variant: "danger",
        onSelect: () => setDeleteTarget(listing),
      });

      return items;
    },
    [],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (page <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (page >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = page - 2; i <= page + 2; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const filterLabel = (key: string, value: string) => {
    const labels: Record<string, Record<string, string>> = {
      category: categories.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {}),
    };
    return labels[key]?.[value] || value;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar - Like Buyer Management */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={18}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                isSearchFocused || searchInput
                  ? "text-terracotta"
                  : "text-ink-soft/60"
              }`}
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search listings..."
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition-all placeholder:text-ink-soft/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60 hover:text-ink transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="min-w-[140px]">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="min-w-[130px]">
            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              placeholder="City"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink-soft/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            />
          </div>

          {/* Min Price */}
          <div className="min-w-[110px]">
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              placeholder="Min ETB"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink-soft/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            />
          </div>

          {/* Max Price */}
          <div className="min-w-[110px]">
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              placeholder="Max ETB"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all placeholder:text-ink-soft/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            />
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
            {q && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                Search: "{q}"
                <button
                  onClick={() => {
                    setSearchInput("");
                    setQ("");
                    setPage(1);
                  }}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {categoryId && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                Category:{" "}
                {categories.find((c) => c.id === categoryId)?.name ||
                  categoryId}
                <button
                  onClick={() => {
                    setCategoryId("");
                    setPage(1);
                  }}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {city && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                City: {city}
                <button
                  onClick={() => {
                    setCity("");
                    setPage(1);
                  }}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {minPrice && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                Min: ETB {minPrice}
                <button
                  onClick={() => {
                    setMinPrice("");
                    setPage(1);
                  }}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                Max: ETB {maxPrice}
                <button
                  onClick={() => {
                    setMaxPrice("");
                    setPage(1);
                  }}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span>
            Showing{" "}
            <span className="font-medium text-ink">{listings.length}</span> of{" "}
            <span className="font-medium text-ink">{total}</span> listings
          </span>
          {searchInput && (
            <span>
              Filtered by:{" "}
              <span className="font-medium text-ink">"{searchInput}"</span>
            </span>
          )}
          {tab !== "all" && (
            <span>
              Status:{" "}
              <span className="font-medium text-ink capitalize">{tab}</span>
            </span>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="flex items-center gap-1 border-b border-border bg-gray-50/50 px-4 py-3">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => changeTab(t.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.value
                  ? "bg-terracotta text-white"
                  : "text-ink-soft hover:bg-cream-dim"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-terracotta border-t-transparent" />
            <p className="mt-2 text-ink-soft">Loading…</p>
          </div>
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
        ) : listings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-ink-soft">No listings match these filters.</p>
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
                  <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-6 py-3 font-medium whitespace-nowrap">
                      Title
                    </th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">
                      Price
                    </th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">
                      Seller
                    </th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap">
                      Listed
                    </th>
                    <th className="px-6 py-3 font-medium whitespace-nowrap text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="border-b border-border last:border-0 hover:bg-cream-dim/30 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-ink max-w-xs truncate">
                        {listing.title}
                      </td>
                      <td className="px-6 py-3 font-mono-data text-ink-soft whitespace-nowrap">
                        ETB {formatPrice(listing.price)}
                      </td>
                      <td className="px-6 py-3 text-ink-soft whitespace-nowrap">
                        {listing.seller?.fullName ?? "—"}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadgeClass(
                            listing.status,
                          )}`}
                        >
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-ink-soft whitespace-nowrap">
                        <div>
                          <div>{timeAgo(listing.createdAt)}</div>
                          <div className="text-[10px] text-ink-soft/60">
                            {formatDate(listing.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end">
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
                            items={getMenuItemsFor(listing)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <span>
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, total)} of {total}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        page === pageNum
                          ? "bg-terracotta text-white"
                          : "text-ink-soft hover:bg-cream-dim hover:text-ink"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <EditListingCard
        listing={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => load()}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this listing?"
        itemName={deleteTarget?.title}
        description={
          deleteTarget && (
            <>
              <span className="font-medium">{deleteTarget.title}</span> will be
              permanently removed from the system, including from this admin
              view. This is different from marking it &quot;Removed&quot;.
            </>
          )
        }
      />
    </div>
  );
}
