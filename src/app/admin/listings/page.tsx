import { AdminListingsTable } from "@/components/admin/AdminListingsTable";

export default function AdminListingsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Listings</h1>
      <p className="mt-1 text-ink-soft">
        View, edit, and manage every listing on the marketplace.
      </p>

      <div className="mt-6">
        <AdminListingsTable />
      </div>
    </div>
  );
}
