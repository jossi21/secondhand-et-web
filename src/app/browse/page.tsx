"use client";

import { useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useListings } from "@/hooks/useListings";
import { BrowseSidebar } from "@/components/browse/BrowseSidebar";
import { ListingCard } from "@/components/browse/ListingCard";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
} from "lucide-react";

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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
        <div className="mx-auto max-w-[1400px] px-4 py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden relative flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all hover:border-orange-300 shrink-0"
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex-1 flex gap-2">
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

              {/* Desktop Filter Button */}
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex relative items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all hover:border-orange-300 shrink-0"
                aria-label="Toggle filters"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
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

            {/* Active filters tags */}
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
      <main className="ml-0 mr-4 max-w-[1400px] pr-4 pb-6">
        <div className="flex gap-6 relative">
          {/* Sidebar - Desktop only */}
          <div
            className={`
              hidden lg:block
              ${isSidebarOpen ? "w-72" : "w-20"}
              shrink-0
              transition-all duration-300 ease-in-out
              h-screen sticky top-0
            `}
          >
            {/* Sidebar content */}
            <div
              className={`h-full overflow-hidden bg-white border-r border-gray-100 ${isSidebarOpen ? "w-72" : "w-20"}`}
            >
              {/* Desktop header */}
              <div
                className={`flex items-center ${isSidebarOpen ? "justify-between p-4" : "justify-center p-2"} border-b border-gray-100 bg-gray-50/50`}
              >
                {isSidebarOpen ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Filters
                      </h3>
                      {hasActiveFilters && (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {activeFilterCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {hasActiveFilters && (
                        <button
                          onClick={() => {
                            setActiveCategoryId("");
                            setActiveCondition("");
                            setActiveCity("");
                            setMinPrice("");
                            setMaxPrice("");
                            setShowSold(false);
                          }}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Clear all
                        </button>
                      )}
                      <button
                        onClick={toggleSidebar}
                        className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                        aria-label="Collapse filters"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={toggleSidebar}
                      className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                      aria-label="Expand filters"
                      title="Expand filters"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </button>
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                        {activeFilterCount}
                      </span>
                    )}
                  </>
                )}
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
                isCollapsed={!isSidebarOpen}
              />
            </div>
          </div>

          {/* Mobile Sidebar - Slide in */}
          <div
            className={`
              fixed lg:hidden inset-y-0 left-0 z-50
              w-80
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              h-screen
            `}
          >
            {/* Backdrop */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar content */}
            <div className="relative z-50 h-full overflow-y-auto bg-white shadow-xl">
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
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
                isCollapsed={false}
              />
            </div>
          </div>

          {/* Results */}
          <div
            className={`flex-1 pt-5 min-w-0 transition-all duration-300 ease-in-out`}
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
