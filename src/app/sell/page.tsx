"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  CheckSquare,
  Eye,
  Star,
  Plus,
  Shield,
  Smartphone,
  Headphones,
} from "lucide-react";
import Link from "next/link";

/* ─── Types ─── */
interface Listing {
  id: number;
  title: string;
  category: string;
  price: number;
  currency: string;
  status: "ACTIVE" | "SOLD" | "PENDING";
  views: number;
  posted: string;
  image: React.ReactNode;
}

interface Rating {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

/* ─── Mock Data ─── */
const listings: Listing[] = [
  {
    id: 1,
    title: "iPhone 12 Pro — 128GB, Midnight Blue",
    category: "Electronics",
    price: 38000,
    currency: "ETB",
    status: "ACTIVE",
    views: 212,
    posted: "5 days ago",
    image: <Smartphone className="w-6 h-6 text-amber-500" />,
  },
  {
    id: 2,
    title: "Sony WH-1000XM5 Headphones — Brand New",
    category: "Electronics",
    price: 9800,
    currency: "ETB",
    status: "ACTIVE",
    views: 177,
    posted: "4 days ago",
    image: <Headphones className="w-6 h-6 text-amber-500" />,
  },
];

const ratings: Rating[] = [
  {
    id: 1,
    name: "Selamawit G.",
    rating: 5,
    comment: "Excellent seller! Item exactly as described. Fast handoff.",
    date: "Aug 10, 2026",
  },
  {
    id: 2,
    name: "Biruk M.",
    rating: 5,
    comment: "Very honest about the condition. Would buy from again.",
    date: "Aug 6, 2026",
  },
  {
    id: 3,
    name: "Tigist A.",
    rating: 4,
    comment: "Good experience overall, slight delay in responding.",
    date: "Jul 28, 2026",
  },
];

/* ─── Components ─── */
const StarRating: React.FC<{ rating: number; max?: number }> = ({
  rating,
  max = 5,
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating
              ? "fill-orange-500 text-orange-500"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
}> = ({ icon, value, label }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className="text-gray-500">{icon}</div>
      <div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export default function SellerDashboard() {
  const [view, setView] = useState<"seller" | "buyer">("seller");

  return (
    <div className="min-h-screen bg-[#F9F7F4] text-gray-800 font-sans">
      {/* ─── View Toggle ─── */}
      <div className="bg-[#F9F7F4] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="inline-flex bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm">
            <button
              onClick={() => setView("seller")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                view === "seller"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Seller View
            </button>
            <button
              onClick={() => setView("buyer")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                view === "buyer"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Buyer View
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Dashboard Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Seller Dashboard
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, Abel</h1>
          </div>
          <Link
            href="/listings/new"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Post New Listing
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<ClipboardList className="w-5 h-5 text-gray-600" />}
            value={2}
            label="Active Listings"
          />
          <StatCard
            icon={<CheckSquare className="w-5 h-5 text-green-600" />}
            value={0}
            label="Sold Listings"
          />
          <StatCard
            icon={<Eye className="w-5 h-5 text-gray-600" />}
            value={389}
            label="Total Views"
          />
          <StatCard
            icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />}
            value={4.7}
            label="Avg. Rating"
          />
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">My Listings</h2>
            <span className="text-xs text-gray-500">2 total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F0EB] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Views</th>
                  <th className="px-5 py-3">Posted</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                          {item.image}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {item.currency} {item.price.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.views}</td>
                    <td className="px-5 py-4 text-gray-500">{item.posted}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 text-xs">
                        <Link
                          href={`/listings/${item.id}`}
                          className="text-orange-600 hover:text-orange-700 font-medium"
                        >
                          View
                        </Link>
                        <button className="text-gray-500 hover:text-gray-700">
                          Mark Sold
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Grid: Ratings + Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Ratings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Recent Ratings</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {ratings.map((r) => (
                <div key={r.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {r.name}
                    </span>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="text-sm text-gray-600 mb-1.5">{r.comment}</p>
                  <p className="text-xs text-gray-400">{r.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Recent Reports</h2>
            </div>
            <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                No reports on your listings
              </p>
              <p className="text-xs text-gray-500">
                Keep being an honest seller!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Live Preview Toast ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 opacity-90">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        Live preview loading, interactions may not be saved
      </div>
    </div>
  );
}