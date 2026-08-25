"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MoreVertical, Search, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
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

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 400;

const inputClass =
  "rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  function menuItemsFor(listing: ListingResponse): DropdownItem[] {
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
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
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
        <span className="ml-auto text-sm text-ink-soft">
          {total} {total === 1 ? "listing" : "listings"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title or description…"
            className={`${inputClass} w-full pl-9`}
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
          placeholder="City"
          className={`${inputClass} w-28`}
        />

        <input
          type="number"
          min={0}
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value);
            setPage(1);
          }}
          placeholder="Min ETB"
          className={`${inputClass} w-28`}
        />

        <input
          type="number"
          min={0}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setPage(1);
          }}
          placeholder="Max ETB"
          className={`${inputClass} w-28`}
        />

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

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
      ) : listings.length === 0 ? (
        <p className="px-6 py-12 text-center text-ink-soft">
          No listings match these filters.
        </p>
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
                      {new Date(listing.createdAt).toLocaleDateString()}
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
                          items={menuItemsFor(listing)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-cream-dim disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-ink-soft">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-cream-dim disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}

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
