"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { RequireRole } from "@/components/auth/RequireRole";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  HomeIcon,
  User,
  User2,
  LayoutGrid,
  Flag,
  Star,
  ChevronLeft,
  ChevronRight,
  Menu,
  Package,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon, exact: true },
  { href: "/admin/buyers", label: "Buyer Management", icon: User2 },
  { href: "/admin/sellers", label: "Seller Management", icon: User },
  { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/reviews", label: "Reviews & Comments", icon: Star },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen]);

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-cream-dim">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`
          hidden md:flex shrink-0 flex-col border-r border-border bg-white transition-all duration-300
          ${isCollapsed ? "w-20" : "w-72"}
          ${isCollapsed ? "items-center" : ""}
        `}
      >
        <div
          className={`border-b border-border ${isCollapsed ? "px-2 py-4 w-full flex justify-center" : "px-6 py-6 w-full"}`}
        >
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-ink">
                  SecondHand
                </span>
                <span className="rounded-md bg-terracotta px-2 py-0.5 font-mono-data text-sm font-semibold text-white">
                  ET
                </span>
              </Link>
              <button
                onClick={toggleSidebar}
                className="rounded-lg p-1 hover:bg-cream-dim transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-ink-soft" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <Link href="/" className="flex items-center gap-1">
                <span className="font-display text-2xl font-semibold text-terracotta">
                  S
                </span>
                <span className="rounded-md bg-terracotta px-1.5 py-0.5 font-mono-data text-xs font-semibold text-white">
                  ET
                </span>
              </Link>
              <button
                onClick={toggleSidebar}
                className="mt-2 rounded-lg p-1 hover:bg-cream-dim transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-ink-soft" />
              </button>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <p className="mt-1 px-6 font-mono-data text-xs uppercase tracking-wide text-terracotta w-full">
            Admin Portal
          </p>
        )}

        <nav
          className={`flex flex-1 flex-col gap-1 ${isCollapsed ? "px-2 py-4 w-full items-center" : "px-4 py-4 w-full"}`}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors w-full ${
                  isActive
                    ? "bg-terracotta-tint text-terracotta"
                    : "text-ink-soft hover:bg-cream-dim hover:text-ink"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div
          className={`border-t border-border ${isCollapsed ? "p-2 w-full" : "p-4 w-full"}`}
        >
          <div
            className={`flex items-center rounded-xl bg-cream-dim ${isCollapsed ? "justify-center px-2 py-3" : "px-3 py-3"}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta font-mono-data text-sm text-white">
                {user?.fullName?.charAt(0).toUpperCase() || "A"}
              </span>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {user?.fullName || "Admin"}
                  </p>
                  <p className="font-mono-data text-xs text-ink-soft">
                    Administrator
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={() => logout()}
                title="Log out"
                className="ml-2 shrink-0 text-ink-soft transition-colors hover:text-red-600"
              >
                ⏻
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Slide in */}
      <div
        className={`
          fixed md:hidden inset-y-0 left-0 z-50
          w-72 bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border bg-white">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={handleLinkClick}
            >
              <span className="font-display text-xl font-semibold text-ink">
                SecondHand
              </span>
              <span className="rounded-md bg-terracotta px-1.5 py-0.5 font-mono-data text-xs font-semibold text-white">
                ET
              </span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="rounded-lg p-1.5 hover:bg-cream-dim transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-ink" />
            </button>
          </div>

          <p className="mt-3 px-6 font-mono-data text-xs uppercase tracking-wide text-terracotta">
            Admin Portal
          </p>

          <nav className="flex flex-1 flex-col gap-1 px-4 py-4 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-terracotta-tint text-terracotta"
                      : "text-ink-soft hover:bg-cream-dim hover:text-ink"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4 bg-white">
            <div className="flex items-center gap-3 rounded-xl bg-cream-dim px-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta font-mono-data text-sm text-white">
                {user?.fullName?.charAt(0).toUpperCase() || "A"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {user?.fullName || "Admin"}
                </p>
                <p className="font-mono-data text-xs text-ink-soft">
                  Administrator
                </p>
              </div>
              <button
                onClick={() => logout()}
                title="Log out"
                className="shrink-0 text-ink-soft transition-colors hover:text-red-600"
              >
                ⏻
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="min-w-0 flex-1">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-border bg-white px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileSidebar}
              className="rounded-lg p-1.5 hover:bg-cream-dim transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-ink" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-semibold text-ink">
                SecondHand
              </span>
              <span className="rounded-md bg-terracotta px-1.5 py-0.5 font-mono-data text-xs font-semibold text-white">
                ET
              </span>
            </Link>
          </div>
        </div>

        {/* Desktop Header - No search bar */}
        <div className="hidden md:block border-b border-border bg-white px-6 py-3 lg:px-10">
          {/* Empty header - no search bar */}
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
