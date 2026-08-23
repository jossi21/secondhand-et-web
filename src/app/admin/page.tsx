"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  CategoryResponse,
  PaginatedListingResponse,
  ReportResponse,
  UserResponse,
  ListingResponse,
} from "@/lib/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { resolveMediaUrl } from "@/lib/media";
import {
  Package,
  CheckCircle,
  DollarSign,
  FolderTree,
  Users,
  Store,
  Flag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type StatColor = "terracotta" | "green" | "blue" | "amber" | "purple" | "red";

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = "terracotta",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: StatColor;
}) {
  const colorClasses: Record<StatColor, string> = {
    terracotta: "bg-terracotta-tint text-terracotta",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
  };

  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;
  const isNeutral = trend === 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className="absolute inset-0 bg-linear-to-br from-transparent to-cream-dim/30 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-mono-data text-xs uppercase tracking-wider text-ink-soft/70">
            {label}
          </p>
          <span className="mt-1 block font-mono-data text-2xl font-semibold text-ink">
            {value}
          </span>
          {trend !== undefined && trend !== null && (
            <div className="mt-1.5 flex items-center gap-1.5">
              {isPositive && (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              )}
              {isNegative && (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              {isNeutral && (
                <span className="h-3.5 w-3.5 text-gray-400">—</span>
              )}
              <span
                className={`text-xs font-medium ${
                  isPositive
                    ? "text-green-600"
                    : isNegative
                      ? "text-red-600"
                      : "text-ink-soft"
                }`}
              >
                {isPositive ? "+" : ""}
                {trend}%
              </span>
              {trendLabel && (
                <span className="text-xs text-ink-soft/60">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClasses[color]} transition-transform group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function RecentActivitySkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="mt-1 h-3 w-48 bg-gray-100 rounded" />
          </div>
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const diffMinutes = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60),
  );
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
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
  const [recentListings, setRecentListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          listingsData,
          activeData,
          soldData,
          categoriesData,
          reportsData,
          buyersData,
          sellersData,
          recentData,
        ] = await Promise.all([
          apiFetch<PaginatedListingResponse>("/listings?limit=1"),
          apiFetch<PaginatedListingResponse>("/listings?status=active&limit=1"),
          apiFetch<PaginatedListingResponse>("/listings?status=sold&limit=1"),
          apiFetch<CategoryResponse[]>("/categories/get-categories"),
          apiFetch<ReportResponse[]>("/reports"),
          apiFetch<UserResponse[]>("/users?role=buyer"),
          apiFetch<UserResponse[]>("/users?role=seller"),
          apiFetch<PaginatedListingResponse>(
            "/listings?limit=5&sort=createdAt:desc",
          ),
        ]);

        setListingsTotal(listingsData.total);
        setActiveTotal(activeData.total);
        setSoldTotal(soldData.total);
        setCategoriesTotal(categoriesData.length);
        setReportsTotal(reportsData.length);
        setBuyersTotal(buyersData.length);
        setSellersTotal(sellersData.length);
        setRecentListings(recentData.data || []);
      } catch {
        // Handle errors silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock trends for demonstration (will be replaced with real calculations later)
  const mockTrends = {
    listings: 12,
    active: -3,
    sold: 8,
    buyers: 15,
    sellers: 5,
  };

  const totalUsers = (buyersTotal || 0) + (sellersTotal || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Dashboard
          </h1>
          <p className="mt-1 text-ink-soft">
            Welcome back, {user?.fullName?.split(" ")[0] || "Admin"}.
            Here&apos;s what&apos;s happening on SecondHand ET.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">
              All systems operational
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Listings"
          value={listingsTotal ?? "…"}
          icon={Package}
          trend={mockTrends.listings}
          trendLabel="vs last month"
          color="terracotta"
        />
        <StatCard
          label="Active Listings"
          value={activeTotal ?? "…"}
          icon={CheckCircle}
          trend={mockTrends.active}
          trendLabel="vs last month"
          color="green"
        />
        <StatCard
          label="Sold Listings"
          value={soldTotal ?? "…"}
          icon={DollarSign}
          trend={mockTrends.sold}
          trendLabel="vs last month"
          color="blue"
        />
        <StatCard
          label="Categories"
          value={categoriesTotal ?? "…"}
          icon={FolderTree}
          color="purple"
        />
        <StatCard
          label="Buyers"
          value={buyersTotal ?? "…"}
          icon={Users}
          trend={mockTrends.buyers}
          trendLabel="vs last month"
          color="blue"
        />
        <StatCard
          label="Sellers"
          value={sellersTotal ?? "…"}
          icon={Store}
          trend={mockTrends.sellers}
          trendLabel="vs last month"
          color="amber"
        />
        <StatCard
          label="Open Reports"
          value={reportsTotal ?? "…"}
          icon={Flag}
          color="red"
        />
        <StatCard
          label="Total Users"
          value={totalUsers || "…"}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Listings */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Recent Listings</h3>
            <a
              href="/admin/listings"
              className="text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
            >
              View all →
            </a>
          </div>

          {loading ? (
            <RecentActivitySkeleton />
          ) : recentListings.length === 0 ? (
            <p className="py-8 text-center text-ink-soft text-sm">
              No recent listings found.
            </p>
          ) : (
            <div className="space-y-3">
              {recentListings.map((listing) => {
                const imageUrl = listing.images?.[0]?.url
                  ? resolveMediaUrl(listing.images[0].url)
                  : null;

                return (
                  <div
                    key={listing.id}
                    className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-cream-dim"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">
                        {listing.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-ink-soft">
                          ETB {listing.price.toLocaleString()}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            listing.status === "active"
                              ? "text-green-600"
                              : listing.status === "sold"
                                ? "text-blue-600"
                                : "text-gray-400"
                          }`}
                        >
                          {listing.status.charAt(0).toUpperCase() +
                            listing.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-ink-soft">
                        {formatTimeAgo(listing.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 font-semibold text-ink">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/admin/listings"
              className="block w-full rounded-xl border border-border p-3 text-left transition-colors hover:bg-cream-dim hover:border-terracotta/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📦</span>
                <div>
                  <p className="text-sm font-medium text-ink">
                    View All Listings
                  </p>
                  <p className="text-xs text-ink-soft">
                    Manage marketplace listings
                  </p>
                </div>
              </div>
            </a>
            <a
              href="/admin/reports"
              className="block w-full rounded-xl border border-border p-3 text-left transition-colors hover:bg-cream-dim hover:border-terracotta/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🚩</span>
                <div>
                  <p className="text-sm font-medium text-ink">Review Reports</p>
                  <p className="text-xs text-ink-soft">
                    {reportsTotal
                      ? `${reportsTotal} pending reports`
                      : "No pending reports"}
                  </p>
                </div>
              </div>
            </a>
            <a
              href="/admin/users"
              className="block w-full rounded-xl border border-border p-3 text-left transition-colors hover:bg-cream-dim hover:border-terracotta/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👥</span>
                <div>
                  <p className="text-sm font-medium text-ink">Manage Users</p>
                  <p className="text-xs text-ink-soft">
                    {totalUsers} total users
                  </p>
                </div>
              </div>
            </a>
            <a
              href="/admin/categories"
              className="block w-full rounded-xl border border-border p-3 text-left transition-colors hover:bg-cream-dim hover:border-terracotta/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🗂️</span>
                <div>
                  <p className="text-sm font-medium text-ink">
                    Manage Categories
                  </p>
                  <p className="text-xs text-ink-soft">
                    {categoriesTotal || 0} categories
                  </p>
                </div>
              </div>
            </a>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 rounded-xl bg-cream-dim p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-soft">Platform Status</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-ink-soft">Total Listings</span>
              <span className="font-semibold text-ink">
                {listingsTotal || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-soft">Active Listings</span>
              <span className="font-semibold text-ink">{activeTotal || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-soft">Total Users</span>
              <span className="font-semibold text-ink">{totalUsers || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-ink-soft/60 border-t border-border pt-6">
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
