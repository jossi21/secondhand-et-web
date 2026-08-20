"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RequireRole } from "@/components/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Analytics", icon: "📊", exact: true },
  { href: "/admin/buyers", label: "Buyer Management", icon: "🧑‍💼" },
  { href: "/admin/sellers", label: "Seller Management", icon: "🏪" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/reports", label: "Reports", icon: "🚩" },
  { href: "/admin/reviews", label: "Reviews & Comments", icon: "⭐" },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8 lg:px-10">
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-white p-4">
          <div className="mb-4 border-b border-border px-2 pb-4">
            <p className="text-sm font-medium text-ink">{user?.fullName}</p>
            <p className="font-mono-data text-xs text-ink-soft">
              Administrator
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

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
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
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
