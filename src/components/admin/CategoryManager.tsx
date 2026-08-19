"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { CategoryResponse } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none focus:border-terracotta";

interface CategoryFormState {
  id?: string;
  name: string;
  description: string;
  parentId: string;
}

const EMPTY_FORM: CategoryFormState = {
  name: "",
  description: "",
  parentId: "",
};

export function CategoryManager() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CategoryFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(guard?: { cancelled: boolean }) {
    setLoading(true);
    try {
      const data = await apiFetch<CategoryResponse[]>("/categories");
      if (guard?.cancelled) return;
      setCategories(data);
    } catch {
      if (guard?.cancelled) return;
      setCategories([]);
    } finally {
      if (guard?.cancelled) return;
      setLoading(false);
    }
  }

  useEffect(() => {
    const guard = { cancelled: false };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- documented fetch-in-effect pattern with cancellation guard, see https://react.dev/learn/you-might-not-need-an-effect
    load(guard);
    return () => {
      guard.cancelled = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSaving(true);

    const body = {
      name: form.name,
      description: form.description || undefined,
      parentId: form.parentId || undefined,
    };

    try {
      if (form.id) {
        await apiFetch(`/categories/${form.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/categories", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Failed to delete category",
      );
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-xl font-semibold text-ink">
          Categories
        </h2>
        <button
          onClick={() => setForm(EMPTY_FORM)}
          className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark"
        >
          + New Category
        </button>
      </div>

      {form && (
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-3 border-b border-border bg-cream-dim/50 px-6 py-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={inputClass}
            />
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className={inputClass}
            >
              <option value="">No parent</option>
              {categories
                .filter((c) => c.id !== form.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : form.id ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="px-6 py-8 text-center text-ink-soft">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="px-6 py-8 text-center text-ink-soft">
          No categories yet.
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-6 py-3 font-medium text-ink">
                  {category.name}
                </td>
                <td className="px-6 py-3 font-mono-data text-ink-soft">
                  {category.slug}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      category.isActive
                        ? "bg-sage-bg text-sage"
                        : "bg-cream-dim text-ink-soft"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() =>
                      setForm({
                        id: category.id,
                        name: category.name,
                        description: category.description ?? "",
                        parentId: category.parentId ?? "",
                      })
                    }
                    className="mr-3 font-medium text-terracotta hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
