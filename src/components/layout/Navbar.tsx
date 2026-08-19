"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

function dashboardPathForRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/dashboard/seller";
  return "/dashboard/buyer";
}

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold text-ink">
            SecondHand
          </span>
          <span className="rounded-md bg-terracotta px-2 py-0.5 font-mono-data text-sm font-semibold text-white">
            ET
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-terracotta">
            Home
          </Link>
          <Link
            href="/browse"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Browse
          </Link>
          <Link
            href="/sell"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Sell
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href={user ? "/listings/new" : "/login"}
            className="rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
          >
            Post Item
          </Link>

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-cream-dim" />
          ) : user ? (
            <div className="relative ml-auto" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border bg-cream-dim px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-terracotta font-mono-data text-xs text-white">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                {user.fullName.split(" ")[0]}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-medium text-ink">
                      {user.fullName}
                    </p>
                    <p className="font-mono-data text-xs capitalize text-ink-soft">
                      {user.role} account
                    </p>
                  </div>
                  <Link
                    href={dashboardPathForRole(user.role)}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink hover:bg-cream-dim"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    href="/saved"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink hover:bg-cream-dim"
                  >
                    My Saved
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="block w-full border-t border-border px-4 py-2.5 text-left text-sm text-red-600 hover:bg-cream-dim"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream-dim ml-auto"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
