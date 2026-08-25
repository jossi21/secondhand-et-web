"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequireRole } from "@/components/auth/RequireRole";
import { useCategories } from "@/hooks/useCategories";
import { createListing } from "@/lib/api/listings";
import { ApiError } from "@/lib/api";
import { FormField } from "@/components/ui/FormField";
import { ImageUploadGrid } from "@/components/listings/ImageUploadGrid";
import { CONDITION_OPTIONS } from "@/lib/conditionLabels";
import {
  validateListingForm,
  type ListingFormErrors,
} from "@/lib/validation/listingForm";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

function NewListingContent() {
  const router = useRouter();
  const { categories } = useCategories();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("brand_new");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ListingFormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateListingForm({
      title,
      description,
      price,
      city,
      categoryId,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    setSubmitting(true);
    try {
      const listing = await createListing({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        condition,
        city: city.trim(),
        neighborhood: neighborhood.trim() || undefined,
        categoryId,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
      router.push(`/listings/${listing.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create listing",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-ink">
        Post New Listing
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Fill in the details below — your listing goes live immediately.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
        <FormField id="listing-title" label="Title" error={fieldErrors.title}>
          <input
            id="listing-title"
            placeholder="e.g. iPhone 12 Pro — 128GB, Midnight Blue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField
          id="listing-description"
          label="Description"
          error={fieldErrors.description}
        >
          <textarea
            id="listing-description"
            rows={4}
            placeholder="Condition details, purchase history, anything a buyer should know"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="listing-price"
            label="Price (ETB)"
            error={fieldErrors.price}
          >
            <input
              id="listing-price"
              inputMode="numeric"
              placeholder="e.g. 9800"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField id="listing-condition" label="Condition">
            <select
              id="listing-condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={inputClass}
            >
              {CONDITION_OPTIONS.filter((c) => c.value).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="listing-city" label="City" error={fieldErrors.city}>
            <input
              id="listing-city"
              placeholder="e.g. Addis Ababa"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField id="listing-neighborhood" label="Neighborhood (optional)">
            <input
              id="listing-neighborhood"
              placeholder="e.g. Bole"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField
          id="listing-category"
          label="Category"
          error={fieldErrors.categoryId}
        >
          <select
            id="listing-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="listing-images" label="Photos (optional)">
          <ImageUploadGrid urls={imageUrls} onChange={setImageUrls} />
        </FormField>

        {error && (
          <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post Listing"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <RequireRole roles={["seller"]}>
      <NewListingContent />
    </RequireRole>
  );
}
