"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  CategoryResponse,
  PaginatedListingResponse,
  ReportResponse,
  UserResponse,
} from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-white px-5 py-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-terracotta-tint text-xl">
        {icon}
      </span>
      <div>
        <p className="font-mono-data text-xs uppercase tracking-wide text-ink-soft">
          {label}
        </p>
        <span className="font-mono-data text-2xl font-semibold text-ink">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [listingsTotal, setListingsTotal] = useState<number | null>(null);
  const [activeTotal, setActiveTotal] = useState<number | null>(null);
  const [soldTotal, setSoldTotal] = useState<number | null>(null);
  const [categoriesTotal, setCategoriesTotal] = useState<number | null>(null);
  const [reportsTotal, setReportsTotal] = useState<number | null>(null);
  const [buyersTotal, setBuyersTotal] = useState<number | null>(null);
  const [sellersTotal, setSellersTotal] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<PaginatedListingResponse>("/listings?limit=1")
      .then((data) => setListingsTotal(data.total))
      .catch(() => setListingsTotal(0));

    apiFetch<PaginatedListingResponse>("/listings?status=active&limit=1")
      .then((data) => setActiveTotal(data.total))
      .catch(() => setActiveTotal(0));

    apiFetch<PaginatedListingResponse>("/listings?status=sold&limit=1")
      .then((data) => setSoldTotal(data.total))
      .catch(() => setSoldTotal(0));

    apiFetch<CategoryResponse[]>("/categories")
      .then((data) => setCategoriesTotal(data.length))
      .catch(() => setCategoriesTotal(0));

    apiFetch<ReportResponse[]>("/reports")
      .then((data) => setReportsTotal(data.length))
      .catch(() => setReportsTotal(0));

    apiFetch<UserResponse[]>("/users?role=buyer")
      .then((data) => setBuyersTotal(data.length))
      .catch(() => setBuyersTotal(0));

    apiFetch<UserResponse[]>("/users?role=seller")
      .then((data) => setSellersTotal(data.length))
      .catch(() => setSellersTotal(0));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-ink-soft">
            Welcome back, {user?.fullName.split(" ")[0]}. Here&apos;s
            what&apos;s happening on SecondHand ET.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Listings"
          value={listingsTotal ?? "…"}
          icon="📦"
        />
        <StatCard
          label="Active Listings"
          value={activeTotal ?? "…"}
          icon="✅"
        />
        <StatCard label="Sold Listings" value={soldTotal ?? "…"} icon="💰" />
        <StatCard label="Categories" value={categoriesTotal ?? "…"} icon="🗂️" />
        <StatCard label="Buyers" value={buyersTotal ?? "…"} icon="🧑‍💼" />
        <StatCard label="Sellers" value={sellersTotal ?? "…"} icon="🏪" />
        <StatCard label="Open Reports" value={reportsTotal ?? "…"} icon="🚩" />
      </div>
    </div>
  );
}
