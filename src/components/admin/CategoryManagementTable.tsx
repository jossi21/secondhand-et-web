"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { ApiError } from "@/lib/api";
import { CategoryResponse } from "@/lib/types";
import { Dropdown } from "@/components/ui/Dropdown";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";
import { EditCategoryCard } from "@/components/admin/CategoryFormCard";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { deleteCategory } from "@/lib/api/categories";

export function CategoryManagementTable({
  categories,
  isLoading,
  reload,
}: {
  categories: CategoryResponse[];
  isLoading: boolean;
  reload: () => Promise<void>;
}) {
  const [editTarget, setEditTarget] = useState<CategoryResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(
    null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const toast = useToast();

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Category deleted", `${deleteTarget.name} was removed.`);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      toast.error(
        "Couldn't delete category",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-white">
        <p className="px-6 py-8 text-center text-ink-soft">Loading…</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white">
        <p className="px-6 py-8 text-center text-ink-soft">
          No categories yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-6 py-3 font-medium whitespace-nowrap">Name</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Slug</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-3 font-medium whitespace-nowrap text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <tr
                  key={category.id}
                  className="border-b border-border last:border-0 hover:bg-cream-dim/30 transition-colors"
                >
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-ink-soft" />
                      <span className="font-medium text-ink">
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono-data text-ink-soft whitespace-nowrap">
                    {category.slug}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        category.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          aria-label="Open actions"
                          disabled={busyId === category.id}
                          className="rounded-full p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-60"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                      items={[
                        {
                          label: "Edit",
                          onSelect: () => setEditTarget(category),
                        },
                        {
                          label: "Delete",
                          variant: "danger",
                          onSelect: () => setDeleteTarget(category),
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditCategoryCard
        category={editTarget}
        categories={categories}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          reload();
        }}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this category?"
        itemName={deleteTarget?.name}
        description={
          deleteTarget && (
            <>
              <span className="font-medium">{deleteTarget.name}</span> will be
              permanently removed.
            </>
          )
        }
      />
    </>
  );
}
