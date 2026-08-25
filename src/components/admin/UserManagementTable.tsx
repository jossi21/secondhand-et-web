"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { ApiError } from "@/lib/api";
import { UpdateUserCommand, UserResponse } from "@/lib/types";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";
import { Dropdown } from "@/components/ui/Dropdown";
import { EditUserCard } from "@/components/admin/EditUserCard";

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function UserManagementTable({
  role,
  roleLabel,
}: {
  role: "buyer" | "seller";
  roleLabel: string;
}) {
  const { users, isLoading, busyId, updateUser, toggleVerified, archiveUser } =
    useAdminUsers(role);
  const toast = useToast();
  const router = useRouter();

  const [editTarget, setEditTarget] = useState<UserResponse | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<UserResponse | null>(null);

  async function handleToggleVerified(u: UserResponse) {
    try {
      await toggleVerified(u);
      toast.success(u.isVerified ? "User unverified" : "User verified");
    } catch (err) {
      toast.error(
        "Couldn't update user",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    }
  }

  async function handleSaveEdit(id: string, command: UpdateUserCommand) {
    await updateUser(id, command);
    toast.success("User updated");
  }

  async function handleConfirmArchive() {
    if (!archiveTarget) return;
    try {
      await archiveUser(archiveTarget.id);
      toast.success(
        "User archived",
        `${archiveTarget.fullName} lost account access.`,
      );
    } catch (err) {
      toast.error(
        "Couldn't archive user",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-white">
        <p className="px-6 py-8 text-center text-ink-soft">Loading…</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white">
        <p className="px-6 py-8 text-center text-ink-soft">
          No {roleLabel.toLowerCase()}s registered yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-6 py-3 font-medium whitespace-nowrap">Name</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">
                Contact
              </th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">City</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">
                Joined
              </th>
              <th className="px-6 py-3 font-medium whitespace-nowrap text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border last:border-0 hover:bg-cream-dim/30 transition-colors"
              >
                <td className="px-6 py-3 font-medium text-ink whitespace-nowrap">
                  {u.fullName}
                </td>
                <td className="px-6 py-3 text-ink-soft whitespace-nowrap">
                  {u.email}
                </td>
                <td className="px-6 py-3 text-ink-soft whitespace-nowrap">
                  {u.city ?? "—"}
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.isVerified
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {u.isVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono-data text-ink-soft whitespace-nowrap">
                  {timeAgo(u.createdAt)}
                </td>
                <td className="px-6 py-3 text-right">
                  <Dropdown
                    align="right"
                    trigger={
                      <button
                        aria-label="Open actions"
                        disabled={busyId === u.id}
                        className="rounded-full p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-60"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    }
                    items={[
                      {
                        label: "View detail",
                        onSelect: () => router.push(`/admin/${role}s/${u.id}`),
                      },
                      {
                        label: "Edit",
                        onSelect: () => setEditTarget(u),
                      },
                      {
                        label: u.isVerified ? "Unverify" : "Verify",
                        onSelect: () => handleToggleVerified(u),
                      },
                      {
                        label: "Archive",
                        variant: "danger",
                        onSelect: () => setArchiveTarget(u),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditUserCard
        user={editTarget}
        isSaving={editTarget ? busyId === editTarget.id : false}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
      />

      <DeleteDialog
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
        title="Archive this user?"
        itemName={archiveTarget?.fullName}
        description={
          archiveTarget && (
            <>
              <span className="font-medium">{archiveTarget.fullName}</span> will
              lose access to their account. You can restore them later from the
              backend if needed.
            </>
          )
        }
      />
    </>
  );
}
