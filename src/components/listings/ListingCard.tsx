import Image from "next/image";
import Link from "next/link";
import { ListingResponse } from "@/lib/types";
import { resolveImageUrl } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

const CONDITION_LABEL: Record<string, string> = {
  brand_new: "Brand New",
  lightly_used: "Lightly Used",
  fair_condition: "Fair Condition",
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ListingCard({ listing }: { listing: ListingResponse }) {
  const coverImage = listing.images[0]?.url
    ? resolveMediaUrl(listing.images[0].url)
    : undefined;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-cream-dim">
        {coverImage ? (
          <Image
            src={resolveImageUrl(coverImage)}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-soft">
            No photo
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur-sm">
          {CONDITION_LABEL[listing.condition] ?? listing.condition}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 font-mono-data text-xs text-white">
          {listing.viewCount} views
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-ink">{listing.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-soft">
          {listing.description}
        </p>

        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-mono-data text-lg font-semibold text-terracotta">
            ETB {listing.price.toLocaleString()}
          </span>
          <span className="text-right text-xs text-ink-soft">
            {listing.city}
            <br />
            {timeAgo(listing.createdAt)}
          </span>
        </div>

        {listing.seller && (
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm">
            <span className="flex items-center gap-1 text-ink-soft">
              {listing.seller.fullName}
              {listing.seller.isVerified && (
                <span className="text-sage" aria-label="Verified seller">
                  ✓
                </span>
              )}
            </span>
            <span className="font-mono-data text-ink-soft">
              ★ {listing.seller.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
