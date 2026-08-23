"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Eye, Clock, Heart, Flag, Tag, BadgeCheck } from "lucide-react";
import { getListing, searchListings } from "@/lib/api/listings";
import { ListingResponse } from "@/lib/types";
import { conditionLabel } from "@/lib/conditionLabels";
import { resolveMediaUrl } from "@/lib/media";
import { useCategories } from "@/hooks/useCategories";
import { SellerContactLink } from "@/components/listings/SellerContactLink";
import { apiFetch, ApiError } from "@/lib/api";
import { toggleSavedListing } from "@/lib/api/savedListings";

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

interface SavedListingLite {
  listingId: string;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { categories } = useCategories();
  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [similar, setSimilar] = useState<ListingResponse[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await getListing(id);
        if (!cancelled) setListing(data);
      } catch {
        if (!cancelled) setListing(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check whether this listing is already in the user's saved list
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mine = await apiFetch<SavedListingLite[]>("/saved-listings");
        if (!cancelled) {
          setSaved(mine.some((s) => s.listingId === id));
        }
      } catch {
        // not logged in, or request failed — leave as unsaved, no error shown
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!listing) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await searchListings({
          categoryId: listing.categoryId,
          limit: 5,
        });
        if (!cancelled) {
          setSimilar(res.data.filter((l) => l.id !== listing.id).slice(0, 4));
        }
      } catch {
        if (!cancelled) setSimilar([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listing]);

  async function toggleSave() {
    if (saveBusy) return;
    setSaveBusy(true);

    try {
      const result = await toggleSavedListing(id);
      setSaved(result.saved);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
      }
    } finally {
      setSaveBusy(false);
    }
  }

  const categoryName =
    categories.find((c) => c.id === listing?.categoryId)?.name ??
    "Uncategorized";

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-cream-dim">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-cream-dim">
        <p className="text-ink-soft">Listing not found.</p>
        <button
          onClick={() => router.back()}
          className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cream-dim"
        >
          Go back
        </button>
      </div>
    );
  }

  const location = listing.neighborhood
    ? `${listing.city}, ${listing.neighborhood}`
    : listing.city;
  const images = listing.images.length > 0 ? listing.images : null;
  const listedDate = new Date(listing.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-cream-dim">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-ink-soft">
          <Link href="/" className="hover:text-terracotta">
            Home
          </Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-terracotta">
            Browse
          </Link>
          <span>/</span>
          <span className="font-medium text-ink">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <div className="aspect-4/3 overflow-hidden rounded-2xl bg-white">
              {images ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(images[activeImage].url)}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-soft">
                  No image
                </div>
              )}
            </div>
            {images && images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                      i === activeImage
                        ? "border-terracotta"
                        : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveMediaUrl(img.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="inline-block rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-ink">
              {conditionLabel(listing.condition)}
            </span>

            <h1 className="mt-4 font-display text-4xl font-bold text-ink">
              {listing.title}
            </h1>

            <p className="mt-3 font-mono-data text-4xl font-bold text-terracotta">
              ETB {formatPrice(listing.price)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} /> {location}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag size={16} /> {categoryName}
              </span>
              <span className="flex items-center gap-1.5 font-mono-data">
                <Eye size={16} /> {listing.viewCount} views
              </span>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
              <Clock size={16} /> Listed {listedDate}
            </p>

            <p className="mt-6 whitespace-pre-line leading-relaxed text-ink">
              {listing.description}
            </p>

            {listing.seller?.contacts && listing.seller.contacts.length > 0 && (
              <div className="mt-8 rounded-2xl bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Contact Seller
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {listing.seller.contacts.map((contact, i) => (
                    <SellerContactLink
                      key={`${contact.type}-${i}`}
                      contact={contact}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={toggleSave}
                disabled={saveBusy}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-white py-3 text-sm font-medium text-ink-soft hover:bg-cream-dim disabled:opacity-60"
              >
                <Heart
                  size={16}
                  className={saved ? "fill-terracotta text-terracotta" : ""}
                />
                {saveBusy ? "Saving…" : saved ? "Saved" : "Save Listing"}
              </button>
              <button className="flex items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-medium text-ink-soft hover:bg-cream-dim">
                <Flag size={16} /> Report
              </button>
            </div>

            {listing.seller && (
              <div className="mt-6 rounded-2xl bg-white p-5">
                <h2 className="mb-4 font-display text-lg font-semibold text-ink">
                  About the Seller
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-tint font-display font-bold text-terracotta">
                      {listing.seller.fullName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">
                          {listing.seller.fullName}
                        </span>
                        {listing.seller.isVerified && (
                          <span className="flex items-center gap-1 rounded-full bg-sage-bg px-2 py-0.5 text-xs font-medium text-sage">
                            <BadgeCheck size={12} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        ★ {listing.seller.averageRating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-5 font-display text-2xl font-bold text-ink">
              Similar Listings
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((item) => {
                const thumb = item.images[0];
                return (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="block overflow-hidden rounded-2xl bg-white"
                  >
                    <div className="relative aspect-square bg-cream-dim">
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveMediaUrl(thumb.url)}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-ink">
                        {conditionLabel(item.condition)}
                      </span>
                      <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 font-mono-data text-xs text-white">
                        {item.viewCount} views
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-ink line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono-data font-bold text-terracotta">
                          ETB {formatPrice(item.price)}
                        </span>
                        <span className="text-right text-xs text-ink-soft">
                          {item.city}
                          <br />
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      {item.seller && (
                        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                          <span className="flex items-center gap-1 text-ink-soft">
                            {item.seller.fullName}
                            {item.seller.isVerified && (
                              <span className="text-sage">✓</span>
                            )}
                          </span>
                          <span className="text-ink-soft">
                            ★ {item.seller.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
