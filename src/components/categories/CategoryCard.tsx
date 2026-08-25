"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CategoryResponse } from "@/lib/types";
import { getCategoryIcon } from "@/lib/categoryIcons";

export function CategoryCard({ category }: { category: CategoryResponse }) {
  const IconComponent = useMemo(
    () => getCategoryIcon(category.icon),
    [category.icon],
  );

  return (
    <Link
      href={`/browse?categoryId=${category.id}`}
      className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-cream-dim px-4 py-6 text-center transition-all hover:border-terracotta/30 hover:shadow-md"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-terracotta">
        <IconComponent className="h-6 w-6" />
      </span>
      <span className="font-medium text-ink">{category.name}</span>
    </Link>
  );
}
