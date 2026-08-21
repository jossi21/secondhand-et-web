"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { BuyerDashboardResponse } from "@/lib/types";
import { RequireRole } from "@/components/auth/RequireRole";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";

type SavedListingItem = BuyerDashboardResponse["savedListings"][number];

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
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5 shadow-sm">
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

function BuyerDashboardContent() {
  const [data, setData] = useState<BuyerDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyListingId, setBusyListingId] = useState<string | null>(null);
  const [unsaveTarget, setUnsaveTarget] = useState<SavedListingItem | null>(
    null,
  );
  const toast = useToast();

  async function load() {
    try {
      const dashboard =
        await apiFetch<BuyerDashboardResponse>("/dashboard/buyer");
      setData(dashboard);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirmUnsave() {
    if (!unsaveTarget) return;
    setBusyListingId(unsaveTarget.listingId);
    try {
      await apiFetch(`/saved-listings/${unsaveTarget.listingId}`, {
        method: "DELETE",
      });
      toast.success("Removed from saved listings");
      setUnsaveTarget(null);
      await load();
    } catch (err) {
      toast.error(
        "Couldn't remove listing",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setBusyListingId(null);
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
          icon="♥"
          value={data.savedListingsCount}
          label="Saved Listings"
        />
        <StatCard
          icon="⭐"
          value={data.ratingsGivenCount}
          label="Ratings Given"
        />
        <StatCard
          icon="🚩"
          value={data.reportsFiledCount}
          label="Reports Filed"
        />
      </div>

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
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
          <div className="rounded-xl border border-border bg-white p-10 text-center text-ink-soft shadow-sm">
            No saved listings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.savedListings.map((s) => (
              <div
                key={s.id}
                className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
              >
                <div className="aspect-[4/3] w-full bg-cream-dim">
                  {s.listing.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.listing.images[0].url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="mb-1 truncate font-medium text-ink">
                    {s.listing.title}
                  </p>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono-data font-semibold text-terracotta">
                      ETB {s.listing.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {s.listing.condition}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-ink-soft">{s.listing.city}</p>
                  <div className="flex gap-2">
                    <Link
                      href={`/listings/${s.listing.id}`}
                      className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium text-ink hover:bg-cream-dim"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setUnsaveTarget(s)}
                      disabled={busyListingId === s.listingId}
                      aria-label="Remove from saved"
                      className="flex items-center justify-center rounded-lg border border-border px-3 text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-60"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">
            Ratings I Have Given
          </h2>
        </div>
        {data.ratingsGiven.length === 0 ? (
          <p className="px-5 py-10 text-center text-ink-soft">
            You haven&apos;t rated anyone yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.ratingsGiven.map((r) => (
              <div key={r.id} className="px-5 py-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    {r.toUserName ?? "Seller"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Stars score={r.score} />
                    <span className="text-xs text-ink-soft">{r.score}/5</span>
                  </div>
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

      <DeleteDialog
        open={!!unsaveTarget}
        onClose={() => setUnsaveTarget(null)}
        onConfirm={handleConfirmUnsave}
        title="Remove from saved listings?"
        itemName={unsaveTarget?.listing.title}
        description={
          unsaveTarget && (
            <>
              <span className="font-medium">{unsaveTarget.listing.title}</span>{" "}
              will be removed from your saved listings.
            </>
          )
        }
      />
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
