import { ReportsTable } from "@/components/admin/ReportsTable";

export default function AdminReportsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Reports</h1>
      <p className="mt-1 text-ink-soft">
        Listings flagged by the community, awaiting review.
      </p>

      <div className="mt-6">
        <ReportsTable />
      </div>
    </div>
  );
}
