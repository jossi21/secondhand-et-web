"use client";

import { useState } from "react";
import { CreateUserCard } from "@/components/admin/CreateUserCard";
import { UserManagementTable } from "@/components/admin/UserManagementTable";

export default function BuyerManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Buyer Management
          </h1>
          <p className="mt-1 text-ink-soft">
            View, verify, edit, and archive buyer accounts.
          </p>
        </div>
        <CreateUserCard
          role="buyer"
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <div className="mt-6">
        <UserManagementTable key={refreshKey} role="buyer" roleLabel="Buyer" />
      </div>
    </div>
  );
}
