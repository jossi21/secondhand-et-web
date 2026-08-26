"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, Flag } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { conditionLabel } from "@/lib/conditionLabels";
import { RequireRole } from "@/components/auth/RequireRole";
import { ListingResponse } from "@/lib/types";
import { toggleSavedListing } from "@/lib/api/savedListings";

interface SavedListingResponse {
  id: string;
  listingId: string;
  listing: ListingResponse;
  createdAt: string;
}

interface RatingResponse {
  id: string;
  score: number;
  comment?: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  createdAt: string;
}

interface BuyerDashboardResponse {
  savedListingsCount: number;
  ratingsGivenCount: number;
  reportsFiledCount: number;
  savedListings: SavedListingResponse[];
  ratingsGiven: RatingResponse[];
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US");
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5 shadow-sm">
      <span className="text-ink-soft">{icon}</span>
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

function BuyerDashboardContent() {
  const router = useRouter();
  const [data, setData] = useState<BuyerDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const dashboard =
        await apiFetch<BuyerDashboardResponse>("/dashboard/buyer");
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

  async function unsave(listingId: string) {
    if (!data) return;
    const previous = data;
    setData({
      ...data,
      savedListingsCount: data.savedListingsCount - 1,
      savedListings: data.savedListings.filter(
        (s) => s.listingId !== listingId,
      ),
    });

    try {
      const result = await toggleSavedListing(listingId);
      if (result.saved) {
        // Toggle unexpectedly re-saved it (e.g. it had already been
        // unsaved elsewhere and this call restored it) — reload to
        // reconcile instead of trusting our optimistic removal.
        load();
      }
    } catch (err) {
      setData(previous);
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
      }
    }
  }

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
      <div className="mb-6">
        <p className="font-mono-data text-xs uppercase tracking-wide text-ink-soft">
          Buyer Dashboard
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">
          My Activity
        </h1>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Heart size={20} />}
          value={data.savedListingsCount}
          label="Saved Listings"
        />
        <StatCard
          icon={<Star size={20} />}
          value={data.ratingsGivenCount}
          label="Ratings Given"
        />
        <StatCard
          icon={<Flag size={20} />}
          value={data.reportsFiledCount}
          label="Reports Filed"
        />
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            Saved Listings
          </h2>
          <Link
            href="/browse"
            className="text-sm font-medium text-terracotta hover:underline"
          >
            Browse more →
          </Link>
        </div>

        {data.savedListings.length === 0 ? (
          <div className="rounded-xl border border-border bg-white px-6 py-10 text-center text-ink-soft">
            You haven&apos;t saved any listings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.savedListings.map((saved) => {
              const item = saved.listing;
              const thumb = item.images[0];
              return (
                <div
                  key={saved.id}
                  className="overflow-hidden rounded-2xl border border-border bg-white"
                >
                  <Link href={`/listings/${item.id}`} className="block">
                    <div className="relative aspect-square bg-cream-dim">
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveMediaUrl(thumb.url)}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-medium text-ink">
                      {item.title}
                    </h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono-data font-bold text-terracotta">
                        ETB {formatPrice(item.price)}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {conditionLabel(item.condition)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">{item.city}</p>

                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/listings/${item.id}`}
                        className="flex-1 rounded-full border border-border py-1.5 text-center text-xs font-medium text-ink hover:bg-cream-dim"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => unsave(item.id)}
                        className="flex-1 rounded-full border border-border py-1.5 text-xs font-medium text-ink-soft hover:bg-cream-dim"
                      >
                        Unsave
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">
          Ratings I Have Given
        </h2>

        {data.ratingsGiven.length === 0 ? (
          <div className="rounded-xl border border-border bg-white px-6 py-10 text-center text-ink-soft">
            You haven&apos;t rated any sellers yet.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-white">
            <div className="divide-y divide-border">
              {data.ratingsGiven.map((r) => (
                <div key={r.id} className="flex items-start gap-3 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta-tint font-display font-bold text-terracotta">
                    {(r.toUserName ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">
                        {r.toUserName ?? "Seller"}
                      </span>
                      <Stars score={r.score} />
                    </div>
                    {r.comment && (
                      <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>
                    )}
                    <p className="mt-1 font-mono-data text-xs text-ink-soft/70">
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuyerDashboardPage() {
  return (
    <RequireRole roles={["buyer"]}>
      <BuyerDashboardContent />
    </RequireRole>
  );
}
