"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RequireRole } from "@/components/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import { HomeIcon, User, User2, LayoutGrid, Flag, Star } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon, exact: true },
  { href: "/admin/buyers", label: "Buyer Management", icon: User2 },
  { href: "/admin/sellers", label: "Seller Management", icon: User },
  { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/reviews", label: "Reviews & Comments", icon: Star },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-cream-dim">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-white md:flex">
        <div className="border-b border-border px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold text-ink">
              SecondHand
            </span>
            <span className="rounded-md bg-terracotta px-2 py-0.5 font-mono-data text-sm font-semibold text-white">
              ET
            </span>
          </Link>
          <p className="mt-1 font-mono-data text-xs uppercase tracking-wide text-terracotta">
            Admin Portal
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-terracotta-tint text-terracotta"
                    : "text-ink-soft hover:bg-cream-dim hover:text-ink"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between rounded-xl bg-cream-dim px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta font-mono-data text-sm text-white">
                {user?.fullName?.charAt(0).toUpperCase() || "A"}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {user?.fullName || "Admin"}
                </p>
                <p className="font-mono-data text-xs text-ink-soft">
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Log out"
              className="text-ink-soft transition-colors hover:text-red-600"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0 flex-1">
        <div className="border-b border-border bg-white px-6 py-4 lg:px-10">
          <input
            type="text"
            placeholder="Search…"
            className="w-full max-w-md rounded-full border border-border bg-cream-dim px-4 py-2 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-terracotta"
          />
        </div>

        <div className="px-6 py-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole roles={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}
