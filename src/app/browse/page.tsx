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
  const [showSold, setShowSold] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const hasActiveFilters =
    activeCategoryId ||
    activeCondition ||
    activeCity ||
    minPrice ||
    maxPrice ||
    showSold;

  const activeFilterCount = [
    activeCategoryId,
    activeCondition,
    activeCity,
    minPrice || maxPrice ? true : false,
    showSold,
  ].filter(Boolean).length;

  // Helper to remove a specific filter
  const removeFilter = (type: string) => {
    switch (type) {
      case "category":
        setActiveCategoryId("");
        break;
      case "condition":
        setActiveCondition("");
        break;
      case "city":
        setActiveCity("");
        break;
      case "price":
        setMinPrice("");
        setMaxPrice("");
        break;
      case "sold":
        setShowSold(false);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-350 px-4 py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex gap-2 max-w-3xl">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700/20"
                />
                <button className="rounded-lg bg-orange-700 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-800 whitespace-nowrap">
                  Search
                </button>
              </div>

              {/* Filter Button - Right side of search bar */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                aria-label="Toggle filters"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  Filters
                </span>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active filters tags - displayed below search bar */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-xs text-gray-500 font-medium mr-1">
                  Filters:
                </span>
                {activeCategoryId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    {categories.find((c) => c.id === activeCategoryId)?.name}
                    <button
                      onClick={() => removeFilter("category")}
                      className="hover:bg-orange-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-orange-500 hover:text-orange-700 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeCondition && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    {activeCondition}
                    <button
                      onClick={() => removeFilter("condition")}
                      className="hover:bg-orange-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-orange-500 hover:text-orange-700 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeCity && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    📍 {activeCity}
                    <button
                      onClick={() => removeFilter("city")}
                      className="hover:bg-orange-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-orange-500 hover:text-orange-700 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    {minPrice || "0"} - {maxPrice || "∞"}
                    <button
                      onClick={() => removeFilter("price")}
                      className="hover:bg-orange-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-orange-500 hover:text-orange-700 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                {showSold && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                    Sold
                    <button
                      onClick={() => removeFilter("sold")}
                      className="hover:bg-orange-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-orange-500 hover:text-orange-700 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setActiveCategoryId("");
                    setActiveCondition("");
                    setActiveCity("");
                    setMinPrice("");
                    setMaxPrice("");
                    setShowSold(false);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-350 px-6 py-6">
        <div className="flex gap-6 relative">
          {/* Sidebar - with left-to-right slide animation */}
          <div
            className={`
              fixed lg:relative inset-y-0 left-0 z-50
              w-80 lg:w-64 shrink-0
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0
              ${isSidebarOpen ? "lg:block" : "lg:hidden"}
            `}
          >
            {/* Backdrop for mobile */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar content */}
            <div className="relative z-50 h-full overflow-y-auto shadow-xl lg:shadow-none lg:border lg:border-gray-100 lg:rounded-xl bg-white">
              <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
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
            </div>
          </div>

          {/* Results */}
          <div
            className={`flex-1 min-w-0 transition-all duration-300 ease-in-out`}
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-gray-600">
                {isLoading ? (
                  "Loading…"
                ) : (
                  <span>
                    <span className="font-semibold text-gray-900">{total}</span>{" "}
                    listings found
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:inline">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 focus:border-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-700/20"
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
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-lg font-medium text-gray-600">
                  No items found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {displayedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                {displayedListings.length < total && (
                  <div className="mt-8 text-center">
                    <button className="px-6 py-2 text-sm font-medium text-orange-700 hover:text-orange-800 transition-colors">
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
