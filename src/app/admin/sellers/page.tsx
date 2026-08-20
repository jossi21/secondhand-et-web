"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { UserResponse } from "@/lib/types";

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export default function SellerManagementPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<UserResponse[]>("/users?role=seller")
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">
        Seller Management
      </h1>
      <p className="mt-1 text-ink-soft">
        {users.length} seller account{users.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-white">
        {loading ? (
          <p className="px-6 py-8 text-center text-ink-soft">Loading…</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-8 text-center text-ink-soft">
            No sellers registered yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">City</th>
                <th className="px-6 py-3 font-medium">Verified</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-3 font-medium text-ink">
                    {u.fullName}
                  </td>
                  <td className="px-6 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-6 py-3 font-mono-data text-ink-soft">
                    {u.phone}
                  </td>
                  <td className="px-6 py-3 text-ink-soft">{u.city ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        u.isVerified
                          ? "bg-sage-bg text-sage"
                          : "bg-cream-dim text-ink-soft"
                      }`}
                    >
                      {u.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-mono-data text-ink-soft">
                    {timeAgo(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
