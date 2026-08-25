import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-semibold text-white">
                SecondHand
              </span>
              <span className="rounded-md bg-terracotta px-2 py-0.5 font-mono-data text-xs font-semibold text-white">
                ET
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Ethiopia&apos;s trusted peer-to-peer marketplace for used goods.
              Connecting buyers and sellers across major cities.
            </p>
          </div>

          <nav className="flex gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/browse"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Browse
            </Link>
            <Link
              href="/seller"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Sell
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Sign In
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SecondHand ET. VinTech PLC — Vintage Challenge Round 1.</p>
          <p className="font-mono-data">
            Built with Next.js · NestJS · PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
