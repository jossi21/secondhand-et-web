"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { CreateUserCard } from "@/components/admin/CreateUserCard";
import { UserManagementTable } from "@/components/admin/UserManagementTable";

type FilterOptions = {
  verified: "all" | "verified" | "unverified";
  status: "all" | "active" | "archived";
  dateRange: "all" | "today" | "week" | "month";
};

export default function SellerManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    verified: "all",
    status: "all",
    dateRange: "all",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      verified: "all",
      status: "all",
      dateRange: "all",
    });
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.verified !== "all" ||
      filters.status !== "all" ||
      filters.dateRange !== "all"
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.verified !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.dateRange !== "all") count++;
    return count;
  }, [filters]);

  const handleFilterChange = useCallback(
    (key: keyof FilterOptions, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    [],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const filterLabel = (key: keyof FilterOptions, value: string) => {
    const labels = {
      verified: {
        verified: "Verified",
        unverified: "Unverified",
      },
      status: {
        active: "Active",
        archived: "Archived",
      },
      dateRange: {
        today: "Today",
        week: "This Week",
        month: "This Month",
      },
    };
    return labels[key]?.[value as keyof (typeof labels)[typeof key]] || value;
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Seller Management
          </h1>
          <p className="mt-1 text-ink-soft">
            View, verify, edit, and archive seller accounts.
          </p>
        </div>
        <CreateUserCard role="seller" onCreated={handleRefresh} />
      </div>

      {/* Search and Filter Bar */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={18}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                isSearchFocused || searchQuery
                  ? "text-terracotta"
                  : "text-ink-soft/60"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search sellers..."
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-ink outline-none transition-all placeholder:text-ink-soft/60 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/60 hover:text-ink transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Verification Filter */}
          <div className="min-w-[130px]">
            <select
              value={filters.verified}
              onChange={(e) => handleFilterChange("verified", e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            >
              <option value="all">All Verified</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[130px]">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="min-w-[130px]">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange("dateRange", e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink-soft hover:border-ink/30 hover:bg-cream-dim transition-all whitespace-nowrap"
            >
              <X size={14} />
              Clear {activeFilterCount}
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.verified !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                {filterLabel("verified", filters.verified)}
                <button
                  onClick={() => handleFilterChange("verified", "all")}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.status !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                {filterLabel("status", filters.status)}
                <button
                  onClick={() => handleFilterChange("status", "all")}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.dateRange !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-tint px-3 py-1 text-xs font-medium text-terracotta">
                {filterLabel("dateRange", filters.dateRange)}
                <button
                  onClick={() => handleFilterChange("dateRange", "all")}
                  className="hover:text-terracotta-dark"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <UserManagementTable
          key={refreshKey}
          role="seller"
          roleLabel="Seller"
          searchQuery={searchQuery}
          filters={filters}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
}
