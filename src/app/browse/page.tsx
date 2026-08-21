"use client";

import { useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useListings } from "@/hooks/useListings";
import { BrowseSidebar } from "@/components/browse/BrowseSidebar";
import { ListingCard } from "@/components/browse/ListingCard";

type SortOption = "Newest First" | "Price: Low to High" | "Price: High to Low";

export default function BrowsePage() {
  const { categories } = useCategories();

  const [searchInput, setSearchInput] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [activeCondition, setActiveCondition] = useState("");
  const [activeCity, setActiveCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("Newest First");
  const [showSold, setShowSold] = useState(false); // not wired to the API yet — see note below

  const filters = useMemo(
    () => ({
      q: searchInput.trim() || undefined,
      categoryId: activeCategoryId || undefined,
      city: activeCity || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: 1,
      limit: 24,
    }),
    [searchInput, activeCategoryId, activeCity, minPrice, maxPrice],
  );

  const { listings, total, isLoading } = useListings(filters);

  const displayedListings = useMemo(() => {
    let pool = activeCondition
      ? listings.filter((l) => l.condition === activeCondition)
      : listings;

    pool = [...pool];
    if (sortBy === "Price: Low to High") {
      pool.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      pool.sort((a, b) => b.price - a.price);
    }
    return pool;
  }, [listings, activeCondition, sortBy]);

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-gray-900">
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="flex max-w-3xl gap-3">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700/20"
            />
            <button className="rounded-xl bg-orange-700 px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-orange-800">
              Search
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="flex gap-8">
          <BrowseSidebar
            categories={categories}
            activeCategoryId={activeCategoryId}
            onCategoryChange={setActiveCategoryId}
            activeCondition={activeCondition}
            onConditionChange={setActiveCondition}
            activeCity={activeCity}
            onCityChange={setActiveCity}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            showSold={showSold}
            onToggleSold={setShowSold}
          />

          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {isLoading ? "Loading…" : `${total} listings found`}
              </h2>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700/20"
                >
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 text-center text-gray-400">Loading…</div>
            ) : displayedListings.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-gray-400">No items found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {displayedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
