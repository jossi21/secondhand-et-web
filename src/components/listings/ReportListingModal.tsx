"use client";

import { useState } from "react";
import { FormModal } from "@/components/ui/FormModal";
import { createReport } from "@/lib/api/reports";
import { REPORT_REASONS } from "@/lib/reportReasons";
import { ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

export function ReportListingModal({
  listingId,
  onClose,
}: {
  listingId: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [selected, setSelected] = useState<string>(REPORT_REASONS[0].value);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOption = REPORT_REASONS.find((r) => r.value === selected);
  const needsDetails = selectedOption?.requiresDetails ?? false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (needsDetails && !details.trim()) {
      setError("Please describe the issue.");
      return;
    }

    const reason = needsDetails ? details.trim() : selected;

    setSubmitting(true);
    try {
      await createReport(listingId, reason);
      toast.success(
        "Report submitted",
        "Thanks for helping keep the marketplace safe.",
      );
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to submit report",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormModal title="Report this listing" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {REPORT_REASONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                selected === option.value
                  ? "border-terracotta bg-terracotta-tint text-terracotta"
                  : "border-border text-ink hover:border-ink/20"
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                value={option.value}
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
                className="accent-terracotta"
              />
              {option.label}
            </label>
          ))}
        </div>

        {needsDetails && (
          <div>
            <label className="mb-1 block text-xs text-ink-soft">
              Tell us more
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue with this listing"
              rows={3}
              className={inputClass}
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Report"}
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
