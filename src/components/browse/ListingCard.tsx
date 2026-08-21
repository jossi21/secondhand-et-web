"use client";

import Link from "next/link";
import { ListingResponse } from "@/lib/types";
import { conditionLabel } from "@/lib/conditionLabels";
import { resolveMediaUrl } from "@/lib/media";

function formatPrice(price: number): string {
  return price.toLocaleString("en-US");
}

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function ListingCard({ listing }: { listing: ListingResponse }) {
  const location = listing.neighborhood
    ? `${listing.city}, ${listing.neighborhood}`
    : listing.city;
  const image = listing.images[0]?.url
    ? resolveMediaUrl(listing.images[0].url)
    : undefined;

  return (
    <Link href={`/listings/${listing.id}`} className="block">
      <article className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              No image
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
              {conditionLabel(listing.condition)}
            </span>
          </div>

          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {listing.viewCount} views
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="mb-1.5 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-orange-700">
            {listing.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {listing.description}
          </p>

          <div className="mb-4 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                ETB
              </span>
              <span className="ml-1 text-xl font-bold tabular-nums text-orange-700">
                {formatPrice(listing.price)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{location}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {timeAgo(listing.createdAt)}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  {listing.seller?.fullName ?? "Unknown seller"}
                </span>
                {listing.seller?.isVerified && (
                  <span className="text-emerald-500" title="Verified Seller">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
              {listing.seller && (
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-500">
                    {listing.seller.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
