"use client";

import { useState, useEffect } from "react";
import {
  CONTACT_TYPES,
  MAX_CONTACTS,
  contactLabel,
} from "@/lib/contactChannels";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta transition-colors";

interface ContactRow {
  id: string;
  type: string;
  value: string;
}

function emptyRow(): ContactRow {
  return { id: `${Date.now()}-${Math.random()}`, type: "phone", value: "" };
}

function placeholderFor(type: string): string {
  switch (type) {
    case "phone":
      return "+251 9XX XXX XXX";
    case "whatsapp":
      return "+251 9XX XXX XXX";
    case "telegram":
      return "@yourusername";
    default:
      return "Enter value";
  }
}

function valueLabelFor(type: string): string {
  switch (type) {
    case "phone":
      return "Phone number";
    case "whatsapp":
      return "WhatsApp number";
    case "telegram":
      return "Telegram username";
    default:
      return "Value";
  }
}

export function ContactsEditor({
  initialContacts,
  onChange,
  compact = false,
}: {
  initialContacts?: { type: string; value: string }[];
  onChange: (contacts: { type: string; value: string }[]) => void;
  compact?: boolean;
}) {
  const [rows, setRows] = useState<ContactRow[]>(() =>
    initialContacts && initialContacts.length > 0
      ? initialContacts.map((c) => ({
          id: `${Date.now()}-${Math.random()}`,
          type: c.type,
          value: c.value,
        }))
      : [emptyRow()],
  );

  useEffect(() => {
    const completed = rows.filter((r) => r.value.trim() !== "");
    onChange(completed.map((r) => ({ type: r.type, value: r.value.trim() })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  function updateRow(id: string, patch: Partial<ContactRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) =>
      prev.length < MAX_CONTACTS ? [...prev, emptyRow()] : prev,
    );
  }

  function removeRow(id: string) {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.length > 0 ? filtered : [emptyRow()];
    });
  }

  const filledCount = rows.filter((r) => r.value.trim() !== "").length;
  const canAddMore = rows.length < MAX_CONTACTS;

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className={`rounded-lg border border-border bg-white ${
            compact ? "p-2" : "p-3"
          }`}
        >
          <div
            className={`flex items-center justify-between ${compact ? "mb-1.5" : "mb-2"}`}
          >
            <span className="font-mono-data text-[10px] font-medium uppercase tracking-wide text-ink-soft">
              Contact {index + 1}
            </span>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                aria-label="Remove this contact"
                className="text-xs font-medium text-ink-soft hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            )}
          </div>

          {/* Radio-style contact type selector */}
          <div
            className={`flex gap-1 bg-cream-dim rounded-lg p-1 ${compact ? "mb-1.5" : "mb-2"}`}
          >
            {CONTACT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateRow(row.id, { type: t, value: "" })}
                className={`flex-1 rounded-md text-center font-medium transition-colors ${
                  row.type === t
                    ? "bg-white text-terracotta shadow-sm"
                    : "text-ink-soft hover:text-ink"
                } ${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"}`}
              >
                {contactLabel(t)}
              </button>
            ))}
          </div>

          {/* Value input */}
          <label
            htmlFor={`contact-value-${row.id}`}
            className={`block text-ink-soft ${compact ? "text-[10px] mb-0.5" : "text-xs mb-1"}`}
          >
            {valueLabelFor(row.type)}
          </label>
          <input
            id={`contact-value-${row.id}`}
            placeholder={placeholderFor(row.type)}
            value={row.value}
            onChange={(e) => updateRow(row.id, { value: e.target.value })}
            className={compact ? inputClass + " py-1 text-xs" : inputClass}
          />
        </div>
      ))}

      {canAddMore ? (
        <button
          type="button"
          onClick={addRow}
          className={`self-start rounded-full border border-dashed border-border px-3 py-1.5 font-medium text-terracotta hover:border-terracotta transition-colors ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          + Add another contact
        </button>
      ) : (
        <p className="text-xs text-ink-soft">
          You&apos;ve reached the {MAX_CONTACTS}-contact limit.
        </p>
      )}

      {filledCount === 0 && (
        <p className="text-xs text-ink-soft">
          Add at least one way for buyers to reach you.
        </p>
      )}
    </div>
  );
}
