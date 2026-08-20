import { CategoryManager } from "@/components/admin/CategoryManager";

export default function AdminCategoriesPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">
        Categories
      </h1>
      <p className="mt-1 text-ink-soft">
        Manage the marketplace&apos;s category tree.
      </p>

      <div className="mt-6">
        <CategoryManager />
      </div>
    </div>
  );
}
