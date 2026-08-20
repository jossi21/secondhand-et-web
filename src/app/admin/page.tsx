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

export default function AdminAnalyticsPage() {
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
      <p className="font-mono-data text-sm uppercase tracking-wide text-ink-soft">
        Admin Dashboard
      </p>
      <h1 className="mt-1 font-display text-4xl font-semibold text-ink">
        Welcome, {user?.fullName.split(" ")[0]}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Listings" value={listingsTotal ?? "…"} />
        <StatCard label="Active Listings" value={activeTotal ?? "…"} />
        <StatCard label="Sold Listings" value={soldTotal ?? "…"} />
        <StatCard label="Categories" value={categoriesTotal ?? "…"} />
        <StatCard label="Buyers" value={buyersTotal ?? "…"} />
        <StatCard label="Sellers" value={sellersTotal ?? "…"} />
        <StatCard label="Open Reports" value={reportsTotal ?? "…"} />
      </div>
    </div>
  );
}
