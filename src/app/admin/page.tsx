"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  CategoryResponse,
  PaginatedListingResponse,
  ReportResponse,
} from "@/lib/types";
import { RequireRole } from "@/components/auth/RequireRole";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { useAuth } from "@/lib/auth/AuthContext";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-white px-6 py-5">
      <span className="font-mono-data text-3xl font-semibold text-ink">
        {value}
      </span>
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}

function AdminOverview() {
  const [listingsTotal, setListingsTotal] = useState<number | null>(null);
  const [categoriesTotal, setCategoriesTotal] = useState<number | null>(null);
  const [reportsTotal, setReportsTotal] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<PaginatedListingResponse>("/listings?limit=1")
      .then((data) => setListingsTotal(data.total))
      .catch(() => setListingsTotal(0));

    apiFetch<CategoryResponse[]>("/categories")
      .then((data) => setCategoriesTotal(data.length))
      .catch(() => setCategoriesTotal(0));

    apiFetch<ReportResponse[]>("/reports")
      .then((data) => setReportsTotal(data.length))
      .catch(() => setReportsTotal(0));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Listings" value={listingsTotal ?? "…"} />
      <StatCard label="Categories" value={categoriesTotal ?? "…"} />
      <StatCard label="Open Reports" value={reportsTotal ?? "…"} />
    </div>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <p className="font-mono-data text-sm uppercase tracking-wide text-ink-soft">
        Admin Dashboard
      </p>
      <h1 className="mt-1 font-display text-4xl font-semibold text-ink">
        Welcome, {user?.fullName.split(" ")[0]}
      </h1>

      <div className="mt-8">
        <AdminOverview />
      </div>

      <div className="mt-10">
        <CategoryManager />
      </div>

      <div className="mt-10">
        <ReportsTable />
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireRole roles={["admin"]}>
      <AdminDashboardContent />
    </RequireRole>
  );
}
