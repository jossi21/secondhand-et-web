"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { CategoryResponse } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none focus:border-terracotta";

const labelClass =
  "mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft";

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

export function CategoryManager({
  isCreating,
  onCloseCreate,
}: {
  isCreating: boolean;
  onCloseCreate: () => void;
}) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CategoryFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCreatingRef = useRef(false);

  const load = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const data = await apiFetch<CategoryResponse[]>("/categories", {
        signal: controller.signal,
      });
      if (isMountedRef.current) {
        setCategories(data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setCategories([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async () => {
      await load();
    };
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  // Handle external create trigger without setState in effect
  useEffect(() => {
    // Skip if already creating or if the trigger is false
    if (!isCreating || isCreatingRef.current) {
      return;
    }

    // Mark that we're handling the create
    isCreatingRef.current = true;

    // Open the form
    setForm(EMPTY_FORM);

    // Reset the parent state after a short delay
    const timeoutId = setTimeout(() => {
      onCloseCreate();
      isCreatingRef.current = false;
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isCreating, onCloseCreate]);

  function closeForm() {
    setForm(null);
    setError(null);
    isCreatingRef.current = false;
  }

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
      closeForm();
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
    <>
      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
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
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Name
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Slug
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-3 font-medium whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-border last:border-0 hover:bg-cream-dim/30 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-ink whitespace-nowrap">
                    {category.name}
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
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <button
                        onClick={() => {
                          setForm({
                            id: category.id,
                            name: category.name,
                            description: category.description ?? "",
                            parentId: category.parentId ?? "",
                          });
                          isCreatingRef.current = false;
                        }}
                        className="font-medium text-terracotta hover:text-terracotta-dark transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="font-medium text-red-600 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">
                {form.id ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={closeForm}
                aria-label="Close"
                className="text-ink-soft hover:text-ink transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label htmlFor="cat-name" className={labelClass}>
                  Name *
                </label>
                <input
                  id="cat-name"
                  required
                  placeholder="e.g. Electronics"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cat-description" className={labelClass}>
                  Description (optional)
                </label>
                <input
                  id="cat-description"
                  placeholder="Short description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="cat-parent" className={labelClass}>
                  Parent Category
                </label>
                <select
                  id="cat-parent"
                  value={form.parentId}
                  onChange={(e) =>
                    setForm({ ...form, parentId: e.target.value })
                  }
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

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : form.id ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
