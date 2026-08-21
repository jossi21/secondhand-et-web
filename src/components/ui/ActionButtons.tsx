"use client";

import type { LucideIcon } from "lucide-react";
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Dropdown, type DropdownItem } from "./Dropdown";

export type RowAction = {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
};

/** Inline icon buttons — best for 2-3 common actions (view/edit/delete). */
export function ActionButtons({ actions }: { actions: RowAction[] }) {
  return (
    <div className="flex items-center gap-1">
      {actions.map((action) => {
        const Icon = action.icon ?? Eye;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.label}
            aria-label={action.label}
            className={`rounded-md p-1.5 disabled:cursor-not-allowed disabled:opacity-40 ${
              action.variant === "danger"
                ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

/** Overflow menu — best when there are more than 3 actions. */
export function ActionMenu({ actions }: { actions: RowAction[] }) {
  const items: DropdownItem[] = actions.map((a) => ({
    label: a.label,
    icon: a.icon,
    onSelect: a.onClick,
    variant: a.variant,
    disabled: a.disabled,
  }));

  return (
    <Dropdown
      align="right"
      trigger={
        <button
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Open actions menu"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      }
      items={items}
    />
  );
}

/** Common action presets, so callers don't repeat icon choices. */
export const commonActions = {
  view: (onClick: () => void): RowAction => ({
    label: "View",
    icon: Eye,
    onClick,
  }),
  edit: (onClick: () => void): RowAction => ({
    label: "Edit",
    icon: Pencil,
    onClick,
  }),
  delete: (onClick: () => void): RowAction => ({
    label: "Delete",
    icon: Trash2,
    onClick,
    variant: "danger",
  }),
};
