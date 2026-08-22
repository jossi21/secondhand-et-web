"use client";

import { useRef, useState } from "react";
import { uploadListingImage } from "@/lib/api/uploads";
import { resolveMediaUrl } from "@/lib/media";

const MAX_IMAGES = 8;

interface ImageSlot {
  id: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

export function ImageUploadGrid({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [slots, setSlots] = useState<ImageSlot[]>(() =>
    urls.map((url) => ({ id: url, url, uploading: false })),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function syncUrls(next: ImageSlot[]) {
    setSlots(next);
    onChange(next.filter((s) => s.url).map((s) => s.url!));
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - slots.length;
    const selected = Array.from(files).slice(0, remaining);

    const newSlots: ImageSlot[] = selected.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      uploading: true,
    }));
    let working = [...slots, ...newSlots];
    setSlots(working);

    for (let i = 0; i < selected.length; i++) {
      const slotId = newSlots[i].id;
      try {
        const url = await uploadListingImage(selected[i]);
        working = working.map((s) =>
          s.id === slotId ? { ...s, url, uploading: false } : s,
        );
      } catch (err) {
        working = working.map((s) =>
          s.id === slotId
            ? {
                ...s,
                uploading: false,
                error: err instanceof Error ? err.message : "Upload failed",
              }
            : s,
        );
      }
      syncUrls(working);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeSlot(id: string) {
    syncUrls(slots.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="relative aspect-square overflow-hidden rounded-lg border border-border bg-cream-dim"
          >
            {slot.uploading && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
              </div>
            )}
            {slot.error && (
              <div className="flex h-full w-full items-center justify-center p-1 text-center text-xs text-red-600">
                {slot.error}
              </div>
            )}
            {slot.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveMediaUrl(slot.url)}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            {!slot.uploading && (
              <button
                type="button"
                onClick={() => removeSlot(slot.id)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/60 text-xs text-white hover:bg-ink/80"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {slots.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-ink-soft hover:border-terracotta hover:text-terracotta"
          >
            + Add
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-xs text-ink-soft">
        Up to {MAX_IMAGES} images. JPEG, PNG, or WEBP, 5MB max each.
      </p>
    </div>
  );
}
