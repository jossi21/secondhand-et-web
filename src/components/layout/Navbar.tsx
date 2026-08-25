"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserInfo } from "@/lib/types";

function dashboardPathForRole(role: UserInfo["role"]): string {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller";
  return "/buyer";
}

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <>
      <header className="sticky top-0 z-50 overflow-x-hidden border-b border-white/10 bg-ink/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10 lg:py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold text-white sm:text-2xl">
              SecondHand
            </span>
            <span className="rounded-md bg-terracotta px-2 py-0.5 font-mono-data text-xs font-semibold text-white sm:text-sm">
              ET
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/browse"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Browse
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={user ? "/listings/new" : "/login"}
              className="rounded-full bg-terracotta px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-terracotta-dark sm:px-5 sm:text-sm"
            >
              <span className="hidden sm:inline">Post Item</span>
              <span className="sm:hidden">Post</span>
            </Link>

            {loading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/10 sm:w-24" />
            ) : user ? (
              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
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
                className="hidden rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 md:block"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="rounded-full p-2 text-white hover:bg-white/10 md:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-ink shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <span className="font-display text-lg font-semibold text-white">
            Menu
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-3">
          <Link
            href="/browse"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Browse
          </Link>

          {user ? (
            <>
              <div className="mt-1 flex items-center gap-2 border-t border-white/10 px-3 py-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta font-mono-data text-xs text-white">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    {user.fullName}
                  </p>
                  <p className="font-mono-data text-xs capitalize text-white/60">
                    {user.role} account
                  </p>
                </div>
              </div>
              <Link
                href={dashboardPathForRole(user.role)}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/10"
              >
                My Dashboard
              </Link>
              <Link
                href="/saved"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-white hover:bg-white/10"
              >
                My Saved
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-white/10"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-1 rounded-lg border-t border-white/10 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
