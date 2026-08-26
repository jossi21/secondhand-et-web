import Link from "next/link";
import Image from "next/image";
import { serverApiFetch } from "@/lib/api-server";
import { CategoryResponse, PaginatedListingResponse } from "@/lib/types";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { ListingCard } from "@/components/browse/ListingCard";
import { PublicStatsResponse } from "@/lib/types";

const QUICK_SEARCHES = ["iPhone", "Laptop", "Toyota", "Sofa", "Refrigerator"];

const HOW_IT_WORKS = [
  {
    number: "01",
    emoji: "📸",
    title: "Create your listing",
    description:
      "Post photos, set your price, describe the condition honestly. It takes under 3 minutes.",
  },
  {
    number: "02",
    emoji: "💬",
    title: "Buyers contact you",
    description:
      "Interested buyers reach you directly via Telegram or phone — no hidden intermediary fees.",
  },
  {
    number: "03",
    emoji: "🤝",
    title: "Meet, verify, and sell",
    description:
      "Meet in a safe public location, hand over the item, and rate each other. Build your seller reputation.",
  },
];

async function getCategories(): Promise<CategoryResponse[]> {
  try {
    return await serverApiFetch<CategoryResponse[]>(
      "/categories/get-categories",
    );
  } catch {
    return [];
  }
}

async function getRecentListings(): Promise<PaginatedListingResponse> {
  try {
    return await serverApiFetch<PaginatedListingResponse>("/listings?limit=8");
  } catch {
    return { data: [], total: 0, page: 1, limit: 8 };
  }
}

async function getPublicStats(): Promise<PublicStatsResponse> {
  try {
    return await serverApiFetch<PublicStatsResponse>("/dashboard/public-stats");
  } catch {
    return {
      activeListings: 0,
      soldListings: 0,
      citiesCovered: 0,
      verifiedSellers: 0,
    };
  }
}

export default async function Home() {
  const [categories, listingsPage, stats] = await Promise.all([
    getCategories(),
    getRecentListings(),
    getPublicStats(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <Image
          src="/images/hero-banner.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/30" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-terracotta/50 bg-terracotta/10 px-4 py-1.5 font-mono-data text-xs text-terracotta">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            Urban Ethiopia&apos;s Used Goods Marketplace
          </span>

          <h1 className="mt-6 max-w-2xl font-display text-5xl font-semibold leading-[1.05] text-white lg:text-6xl">
            Buy and sell used goods.
          </h1>
          <h2 className="mt-2 max-w-2xl font-display text-5xl font-bold italic leading-[1.05] text-terracotta lg:text-6xl">
            No middlemen. No hassle.
          </h2>

          <p className="mt-6 max-w-xl text-lg text-white/80">
            From electronics to furniture, vehicles to appliances — find trusted
            sellers across Addis Ababa, Hawassa, Adama, and beyond.
          </p>

          <form
            action="/browse"
            className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              name="q"
              placeholder="Search listings — iPhone, sofa, Toyota…"
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white placeholder:text-white/50 outline-none backdrop-blur-sm focus:border-terracotta"
            />
            <button
              type="submit"
              className="rounded-full bg-terracotta px-8 py-3 font-semibold text-white transition-colors hover:bg-terracotta-dark"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_SEARCHES.map((term) => (
              <Link
                key={term}
                href={`/browse?q=${term}`}
                className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 transition-colors hover:border-terracotta hover:text-white"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 lg:grid-cols-4 lg:px-10">
          {[
            [stats.activeListings.toLocaleString(), "Active Listings"],
            [stats.verifiedSellers.toLocaleString(), "Verified Sellers"],
            [stats.citiesCovered.toLocaleString(), "Cities Covered"],
            [stats.soldListings.toLocaleString(), "Transactions"],
          ].map(([value, label]) => (
            <div key={label}>
              <span className="font-mono-data text-3xl font-semibold text-ink">
                {value}
              </span>
              <p className="text-sm text-ink-soft">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Browse by Category
          </h2>
          <Link
            href="/browse"
            className="text-sm font-medium text-terracotta hover:underline"
          >
            All categories →
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="text-ink-soft">
            Categories will appear here once added.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Listings - 4 cards per row */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Recent Listings
          </h2>
          <Link
            href="/browse"
            className="text-sm font-medium text-terracotta hover:underline"
          >
            View all →
          </Link>
        </div>

        {listingsPage.data.length === 0 ? (
          <p className="text-ink-soft">
            No listings yet. Be the first to{" "}
            <Link href="/listings/new" className="text-terracotta underline">
              post one
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listingsPage.data.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <h2 className="font-display text-3xl font-semibold text-ink">
          How SecondHand ET Works
        </h2>
        <p className="mt-2 text-ink-soft">
          Simple, direct, and transparent — no escrow complexity.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.number}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border font-mono-data text-sm text-ink-soft">
                  {step.number}
                </span>
                <span className="text-2xl">{step.emoji}</span>
              </div>
              <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream-dim">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-10">
          <h2 className="font-display text-4xl font-semibold text-ink">
            Have something to sell?
          </h2>
          <p className="mt-3 text-ink-soft">
            Join thousands of Ethiopians already trading on SecondHand ET.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/listings/new"
              className="rounded-full bg-terracotta px-8 py-3 font-semibold text-white transition-colors hover:bg-terracotta-dark"
            >
              Post a Listing — Free
            </Link>
            <Link
              href="/browse"
              className="rounded-full border border-ink/15 px-8 py-3 font-semibold text-ink transition-colors hover:bg-white"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
