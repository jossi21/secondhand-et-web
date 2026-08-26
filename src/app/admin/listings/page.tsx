"use client";

import { AdminListingsTable } from "@/components/admin/AdminListingsTable";

export default function AdminListingsPage() {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Listings
          </h1>
          <p className="mt-1 text-ink-soft">
            View, edit, and manage every listing on the marketplace.
          </p>
        </div>
        <div className="text-sm text-ink-soft whitespace-nowrap pt-1">
          Total:{" "}
          <span className="font-medium text-ink">
            {/* Will be shown in table */}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <AdminListingsTable />
      </div>
    </div>
  );
}
