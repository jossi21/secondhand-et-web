"use client";

import { useRef, useState } from "react";
import { uploadListingImage } from "@/lib/api/uploads";
import { resolveMediaUrl } from "@/lib/media";
import { X, Upload } from "lucide-react";
import Image from "next/image";

const MAX_IMAGES = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_IMAGES ?? "8");
const MAX_FILE_SIZE =
  Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB ?? "20") * 1024 * 1024;

// Supported image types
const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/avif",
  "image/heic",
  "image/heif",
];

// Check if file is a valid image
const isValidImage = (file: File): boolean => {
  if (SUPPORTED_TYPES.includes(file.type)) {
    return true;
  }
  const extensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
    ".tiff",
    ".avif",
    ".heic",
    ".heif",
  ];
  const fileName = file.name.toLowerCase();
  return extensions.some((ext) => fileName.endsWith(ext));
};

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
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function syncUrls(next: ImageSlot[]) {
    setSlots(next);
    onChange(next.filter((s) => s.url).map((s) => s.url!));
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;

    const remaining = MAX_IMAGES - slots.length;
    const selected = Array.from(files).slice(0, remaining);

    const invalidFiles = selected.filter((f) => !isValidImage(f));
    if (invalidFiles.length > 0) {
      const names = invalidFiles.map((f) => f.name).join(", ");
      alert(
        `Unsupported file type(s): ${names}. Supported: JPG, PNG, GIF, WebP, SVG, BMP, TIFF, AVIF, HEIC, HEIF`,
      );
      return;
    }

    const oversizedFiles = selected.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const names = oversizedFiles.map((f) => f.name).join(", ");
      alert(`File(s) exceed 20MB limit: ${names}`);
      return;
    }

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
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        // Check if it's an authentication error
        if (
          errorMessage.includes("Unauthorized") ||
          errorMessage.includes("401")
        ) {
          alert(
            "Please log in again to upload images. Your session may have expired.",
          );
        }
        working = working.map((s) =>
          s.id === slotId
            ? {
                ...s,
                uploading: false,
                error: errorMessage,
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (inputRef.current) {
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach((file) => dataTransfer.items.add(file));
        inputRef.current.files = dataTransfer.files;
        inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Handle paste
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          await handleFiles(dataTransfer.files);
        }
        break;
      }
    }
  };

  return (
    <div onPaste={handlePaste}>
      {/* Image Grid */}
      {slots.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="relative h-15 w-15 shrink-0 overflow-hidden rounded-lg border border-border bg-cream-dim group"
            >
              {slot.uploading && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
                  <span className="text-[10px] text-ink-soft">
                    Uploading...
                  </span>
                </div>
              )}
              {slot.error && (
                <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-red-600">
                  {slot.error}
                </div>
              )}
              {slot.url && (
                <Image
                  src={resolveMediaUrl(slot.url)}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 33vw, 25vw"
                  className="object-cover"
                />
              )}
              {!slot.uploading && slot.url && (
                <button
                  type="button"
                  onClick={() => removeSlot(slot.id)}
                  aria-label="Remove image"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area - Compact */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed 
          transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? "border-terracotta bg-terracotta-tint/20"
              : "border-border bg-cream-dim hover:border-terracotta hover:bg-cream-dim/70"
          }
          ${slots.length > 0 ? "py-3" : "py-6"}
        `}
      >
        <div className="flex flex-col items-center gap-0.5">
          <div className="rounded-full bg-white p-1.5 shadow-sm">
            <Upload className="h-4 w-4 text-ink-soft" />
          </div>
          <p className="text-xs font-medium text-ink">Upload Image</p>
          <p className="text-[10px] text-ink-soft/60">or drop a file here</p>
          <p className="text-[10px] text-ink-soft/40">
            CTRL+V to paste image or URL
          </p>
          {slots.length > 0 && (
            <span className="mt-0.5 text-[10px] text-ink-soft/40">
              {slots.length}/{MAX_IMAGES} images uploaded
            </span>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff,image/avif,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {slots.length === 0 && (
        <p className="mt-1 text-xs text-amber-600">
          ⚠️ At least one image is required
        </p>
      )}
    </div>
  );
}
