"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { CreateCategoryCard } from "@/components/admin/CategoryFormCard";
import { CategoryManagementTable } from "@/components/admin/CategoryManagementTable";

export default function AdminCategoriesPage() {
  const { categories, isLoading, reload } = useCategories();
  const [isCreating, setIsCreating] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Filter categories based on search query and status
  const filteredCategories = useMemo(() => {
    let result = categories;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          category.slug.toLowerCase().includes(query) ||
          (category.description &&
            category.description.toLowerCase().includes(query)),
      );
    }

    // Status filter
    if (statusFilter === "active") {
      result = result.filter((category) => category.isActive === true);
    } else if (statusFilter === "inactive") {
      result = result.filter((category) => category.isActive === false);
    }

    return result;
  }, [categories, searchQuery, statusFilter]);

  // Pagination logic
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCategories.slice(startIndex, endIndex);

  // Reset to first page when search or filters change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback(
    (value: "all" | "active" | "inactive") => {
      setStatusFilter(value);
      setCurrentPage(1);
    },
    [],
  );

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Categories
          </h1>
          <p className="mt-1 text-ink-soft">
            Manage the marketplace&lsquo;s category tree.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="shrink-0 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark transition-colors"
        >
          + New Category
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
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
              placeholder="Search categories by name, slug, or description..."
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

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilterChange(
                  e.target.value as "all" | "active" | "inactive",
                )
              }
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                clearSearch();
                setStatusFilter("all");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink-soft hover:border-ink/30 hover:bg-cream-dim transition-all whitespace-nowrap"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span>
            Showing{" "}
            <span className="font-medium text-ink">{currentItems.length}</span>{" "}
            of <span className="font-medium text-ink">{totalItems}</span>{" "}
            categories
          </span>
          {searchQuery && (
            <span>
              Filtered by:{" "}
              <span className="font-medium text-ink">
                &ldquo;{searchQuery}&ldquo;
              </span>
            </span>
          )}
          {statusFilter !== "all" && (
            <span>
              Status:{" "}
              <span className="font-medium text-ink">{statusFilter}</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <CategoryManagementTable
          categories={currentItems}
          isLoading={isLoading}
          reload={reload}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      </div>

      <CreateCategoryCard
        open={isCreating}
        categories={categories}
        onClose={() => setIsCreating(false)}
        onCreated={reload}
      />
    </div>
  );
}
