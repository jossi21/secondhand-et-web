'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function ViewToggle() {
  const pathname = usePathname();
  const isSeller = pathname.includes('/seller');

  return (
    <div className="mb-8">
      <div className="inline-flex bg-white rounded-lg border border-gray-200 p-0.5">
        <Link
          href="/dashboard/seller"
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
            isSeller
              ? 'bg-gray-100 text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Seller View
        </Link>
        <Link
          href="/dashboard/buyer"
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
            !isSeller
              ? 'bg-gray-100 text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Buyer View
        </Link>
      </div>
    </div>
  );
}