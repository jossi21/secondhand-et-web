"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { ListingResponse } from "@/lib/types";
import { updateListing, type UpdateListingInput } from "@/lib/api/listings";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/ui/FormField";
import { CONDITION_OPTIONS } from "@/lib/conditionOptions";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

interface EditFormState {
  title: string;
  description: string;
  price: string;
  condition: string;
  city: string;
  neighborhood: string;
  status: "active" | "sold" | "removed";
}

function EditListingForm({
  listing,
  onClose,
  onSaved,
}: {
  listing: ListingResponse;
  onClose: () => void;
  onSaved: (updated: ListingResponse) => void;
}) {
  const [form, setForm] = useState<EditFormState>({
    title: listing.title,
    description: listing.description,
    price: String(listing.price),
    condition: listing.condition,
    city: listing.city,
    neighborhood: listing.neighborhood ?? "",
    status: listing.status,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(form.price);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price.");
      return;
    }

    const input: UpdateListingInput = {
      title: form.title,
      description: form.description,
      price,
      condition: form.condition,
      city: form.city,
      neighborhood: form.neighborhood || undefined,
      status: form.status,
    };

    setSaving(true);
    try {
      const updated = await updateListing(listing.id, input);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update listing",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal title="Edit listing" onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-3"
      >
        <FormField id="edit-listing-title" label="Title">
          <input
            id="edit-listing-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <FormField id="edit-listing-description" label="Description">
          <textarea
            id="edit-listing-description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="edit-listing-price" label="Price (ETB)">
            <input
              id="edit-listing-price"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputClass}
            />
          </FormField>

          <FormField id="edit-listing-condition" label="Condition">
            <select
              id="edit-listing-condition"
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className={inputClass}
            >
              {CONDITION_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="edit-listing-city" label="City">
            <input
              id="edit-listing-city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputClass}
            />
          </FormField>

          <FormField
            id="edit-listing-neighborhood"
            label="Neighborhood (optional)"
          >
            <input
              id="edit-listing-neighborhood"
              value={form.neighborhood}
              onChange={(e) =>
                setForm({ ...form, neighborhood: e.target.value })
              }
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField id="edit-listing-status" label="Status">
          <select
            id="edit-listing-status"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as EditFormState["status"],
              })
            }
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="removed">Removed</option>
          </select>
        </FormField>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
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

export function EditListingCard({
  listing,
  onClose,
  onSaved,
}: {
  listing: ListingResponse | null;
  onClose: () => void;
  onSaved: (updated: ListingResponse) => void;
}) {
  if (!listing) return null;

  return (
    <EditListingForm
      key={listing.id}
      listing={listing}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
