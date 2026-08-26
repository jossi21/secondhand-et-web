"use client";

import { useState } from "react";
import { Upload, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";
import { uploadListingImage } from "@/lib/api/uploads";
import { submitNationalId } from "@/lib/api/nationalId";
import { resolveMediaUrl } from "@/lib/media";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

export function VerifyIdentityCard() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [nationalIdRef, setNationalIdRef] = useState(user?.nationalIdRef ?? "");
  const [photoUrl, setPhotoUrl] = useState(user?.nationalIdPhotoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const hasPendingSubmission = !!user.nationalIdRef && !user.isVerified;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const url = await uploadListingImage(file);
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nationalIdRef.trim()) {
      setError("Enter your national ID number.");
      return;
    }
    if (!photoUrl) {
      setError("Upload a photo of your ID.");
      return;
    }

    setSubmitting(true);
    try {
      await submitNationalId({
        nationalIdRef: nationalIdRef.trim(),
        nationalIdPhotoUrl: photoUrl,
      });
      toast.success(
        "Submitted for review",
        "We'll verify your identity shortly.",
      );
      await refreshUser();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to submit for review",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (user.isVerified) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-bg text-sage">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="font-medium text-ink">Identity Verified</p>
            <p className="text-sm text-ink-soft">
              Your account shows a verified badge to buyers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        Verify Your Identity
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Submit your national ID to get a verified badge and build buyer trust.
      </p>

      {hasPendingSubmission && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <Clock size={16} />
          Pending review — you can resubmit below if needed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs text-ink-soft">
            National ID Number
          </label>
          <input
            value={nationalIdRef}
            onChange={(e) => setNationalIdRef(e.target.value)}
            placeholder="e.g. FAN-1234-5678-9012"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-ink-soft">
            Photo of your ID
          </label>

          {photoUrl ? (
            <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-lg border border-border">
              <Image
                src={resolveMediaUrl(photoUrl)}
                alt="National ID"
                fill
                unoptimized
                sizes="320px"
                className="object-cover"
              />
            </div>
          ) : (
            <label className="flex h-32 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-cream-dim hover:border-terracotta hover:bg-cream-dim/70">
              {uploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
              ) : (
                <>
                  <Upload className="h-4 w-4 text-ink-soft" />
                  <span className="text-xs text-ink-soft">Upload photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          )}

          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhotoUrl("")}
              className="mt-1 text-xs text-ink-soft hover:text-red-600"
            >
              Remove and re-upload
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="self-start rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
