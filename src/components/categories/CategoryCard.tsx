import Link from "next/link";
import { CategoryResponse } from "@/lib/types";

const CATEGORY_ICON: Record<string, string> = {
  electronics: "📱",
  furniture: "🛋️",
  vehicles: "🚗",
  appliances: "🏠",
  clothing: "👕",
  "books-education": "📚",
};

export function CategoryCard({ category }: { category: CategoryResponse }) {
  return (
    <Link
      href={`/browse?categoryId=${category.id}`}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white px-4 py-6 text-center transition-shadow hover:shadow-md"
    >
      <span className="text-3xl">{CATEGORY_ICON[category.slug] ?? "🏷️"}</span>
      <span className="font-medium text-ink">{category.name}</span>
    </Link>
  );
}
