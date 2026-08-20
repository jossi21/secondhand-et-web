import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-border bg-white">
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
            href="/buyer"
            className="hidden text-sm font-medium text-terracotta sm:inline"
          >
            My Saved
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-ink/15 px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream-dim"
          >
            Sign In
          </Link>
          <Link
            href="/listings/new"
            className="rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
          >
            Post Item
          </Link>
        </div>
      </div>
    </header>
  );
}
