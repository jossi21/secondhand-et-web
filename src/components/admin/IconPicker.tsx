"use client";

import { CATEGORY_ICON_KEYS, getCategoryIcon } from "@/lib/categoryIcons";

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2 rounded-lg border border-border bg-cream-dim p-2 sm:grid-cols-8">
      {CATEGORY_ICON_KEYS.map((key) => {
        const Icon = getCategoryIcon(key);
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            title={key}
            onClick={() => onChange(key)}
            className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
              selected
                ? "bg-terracotta text-white"
                : "bg-white text-ink-soft hover:bg-cream-dim hover:text-ink"
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
