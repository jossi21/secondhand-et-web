"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { CreateCategoryCard } from "@/components/admin/CategoryFormCard";
import { CategoryManagementTable } from "@/components/admin/CategoryManagementTable";

export default function AdminCategoriesPage() {
  const { categories, isLoading, reload } = useCategories();
  const [isCreating, setIsCreating] = useState(false);

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

      <div className="mt-6">
        <CategoryManagementTable
          categories={categories}
          isLoading={isLoading}
          reload={reload}
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
