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
    <Link href={`/listings/${listing.id}`} className="block h-full">
      <article className="group flex h-full flex-col cursor-pointer overflow-hidden rounded-xl bg-gray-100/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white">
        {/* Image - fixed aspect ratio */}
        <div className="relative aspect-4/3 overflow-hidden bg-gray-200/70 shrink-0">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}

          <div className="absolute left-2 top-2">
            <span className="inline-block rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-gray-900 shadow-sm backdrop-blur-sm">
              {conditionLabel(listing.condition)}
            </span>
          </div>

          <div className="absolute right-2 top-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-900/70 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-2.5 w-2.5"
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
              {listing.viewCount}
            </span>
          </div>
        </div>

        {/* Content - fixed heights */}
        <div className="flex flex-1 flex-col p-3.5 transition-colors duration-300">
          {/* Title - fixed height for 2 lines */}
          <div className="h-11 mb-1">
            <h3 className="text-sm font-bold leading-snug text-gray-800 transition-colors group-hover:text-gray-900 line-clamp-2">
              {listing.title}
            </h3>
          </div>

          {/* Description - fixed height for 2 lines */}
          <div className="h-8 mb-2.5">
            <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">
              {listing.description || "No description available"}
            </p>
          </div>

          {/* Bottom section - fixed heights */}
          <div className="mt-auto">
            {/* Price and location - fixed height */}
            <div className="h-12 mb-2 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                  ETB
                </span>
                <span className="ml-0.5 text-base font-bold tabular-nums text-gray-800">
                  {formatPrice(listing.price)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 line-clamp-1 max-w-25">
                  {location}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  {timeAgo(listing.createdAt)}
                </p>
              </div>
            </div>

            {/* Seller info - fixed height */}
            <div className="h-9 border-t border-gray-200/70 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-medium text-gray-500 truncate max-w-25">
                    {listing.seller?.fullName ?? "Unknown"}
                  </span>
                  {listing.seller?.isVerified && (
                    <span
                      className="text-emerald-500 shrink-0"
                      title="Verified Seller"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
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
                  <div className="flex items-center gap-1 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2.5 w-2.5 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500">
                      {listing.seller.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
