"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { CategoryResponse } from "@/lib/types";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/ui/FormField";
import { IconPicker } from "@/components/admin/IconPicker";
import {
  validateCategoryForm,
  type CategoryFormErrors,
} from "@/lib/validation/categoryForm";
import {
  createCategory,
  updateCategory,
  type CategoryInput,
} from "@/lib/api/categories";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none focus:border-terracotta";

interface CategoryFormState {
  name: string;
  description: string;
  parentId: string;
  icon: string;
}

const EMPTY: CategoryFormState = {
  name: "",
  description: "",
  parentId: "",
  icon: "home",
};

function CategoryForm({
  title,
  submitLabel,
  savingLabel,
  initial,
  excludeId,
  categories,
  onClose,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  savingLabel: string;
  initial: CategoryFormState;
  excludeId?: string;
  categories: CategoryResponse[];
  onClose: () => void;
  onSubmit: (input: CategoryInput) => Promise<void>;
}) {
  const [form, setForm] = useState<CategoryFormState>(initial);
  const [fieldErrors, setFieldErrors] = useState<CategoryFormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateCategoryForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        parentId: form.parentId || undefined,
        icon: form.icon || undefined,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField id="cat-name" label="Name" error={fieldErrors.name}>
          <input
            id="cat-name"
            placeholder="e.g. Electronics"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField id="cat-description" label="Description (optional)">
          <input
            id="cat-description"
            placeholder="Short description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField id="cat-parent" label="Parent category">
          <select
            id="cat-parent"
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            className={inputClass}
          >
            <option value="">No parent</option>
            {categories
              .filter((c) => c.id !== excludeId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </FormField>

        <FormField id="cat-icon" label="Icon">
          <IconPicker
            value={form.icon}
            onChange={(icon) => setForm({ ...form, icon })}
          />
        </FormField>

        {error && (
          <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
          >
            {saving ? savingLabel : submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
          >
            Cancel
          </button>
        </div>
      </form>
    </FormModal>
  );
}

export function CreateCategoryCard({
  open,
  categories,
  onClose,
  onCreated,
}: {
  open: boolean;
  categories: CategoryResponse[];
  onClose: () => void;
  onCreated: () => void;
}) {
  if (!open) return null;
  return (
    <CategoryForm
      key="create"
      title="New Category"
      submitLabel="Create"
      savingLabel="Creating…"
      initial={EMPTY}
      categories={categories}
      onClose={onClose}
      onSubmit={async (input) => {
        await createCategory(input);
        onCreated();
      }}
    />
  );
}

export function EditCategoryCard({
  category,
  categories,
  onClose,
  onSaved,
}: {
  category: CategoryResponse | null;
  categories: CategoryResponse[];
  onClose: () => void;
  onSaved: () => void;
}) {
  if (!category) return null;
  return (
    <CategoryForm
      key={category.id}
      title="Edit Category"
      submitLabel="Update"
      savingLabel="Saving…"
      excludeId={category.id}
      initial={{
        name: category.name,
        description: category.description ?? "",
        parentId: category.parentId ?? "",
        icon: category.icon ?? "home",
      }}
      categories={categories}
      onClose={onClose}
      onSubmit={async (input) => {
        await updateCategory(category.id, input);
        onSaved();
      }}
    />
  );
}
