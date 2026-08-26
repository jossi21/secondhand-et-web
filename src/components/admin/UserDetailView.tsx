"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ApiError } from "@/lib/api";
import { UpdateUserCommand } from "@/lib/types";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { EditUserCard } from "@/components/admin/EditUserCard";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";
import { resolveMediaUrl } from "@/lib/media";

export function UserDetailView({ role }: { role: "buyer" | "seller" }) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const { users, isLoading, busyId, updateUser, archiveUser } =
    useAdminUsers(role);
  const user = users.find((u) => u.id === id);

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSaveEdit(userId: string, command: UpdateUserCommand) {
    await updateUser(userId, command);
    toast.success("User updated");
  }

  async function handleDelete() {
    if (!user) return;
    try {
      await archiveUser(user.id);
      toast.success("User archived", `${user.fullName} lost account access.`);
      router.push(`/admin/${role}s`);
    } catch (err) {
      toast.error(
        "Couldn't archive user",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    }
  }

  if (isLoading) {
    return <p className="px-6 py-8 text-center text-ink-soft">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-ink-soft">User not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-3 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm font-medium text-ink-soft hover:text-ink"
      >
        ← Go back
      </button>

      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-ink">
            {user.fullName}
          </h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              user.isVerified
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {user.isVerified ? "Verified" : "Unverified"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="font-mono-data text-xs text-ink-soft">Email</p>
            <p className="font-medium text-ink">{user.email}</p>
          </div>
          <div>
            <p className="font-mono-data text-xs text-ink-soft">Phone</p>
            <p className="font-medium text-ink">{user.phone}</p>
          </div>
          <div>
            <p className="font-mono-data text-xs text-ink-soft">City</p>
            <p className="font-medium text-ink">{user.city ?? "—"}</p>
          </div>
          <div>
            <p className="font-mono-data text-xs text-ink-soft">Role</p>
            <p className="font-medium capitalize text-ink">{user.role}</p>
          </div>
          <div>
            <p className="font-mono-data text-xs text-ink-soft">Joined</p>
            <p className="font-medium text-ink">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="font-mono-data text-xs text-ink-soft">User ID</p>
            <p className="truncate font-mono text-xs text-ink">{user.id}</p>
          </div>
        </div>

        {role === "seller" && user.nationalIdRef && (
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="mb-3 font-mono-data text-xs uppercase tracking-wide text-ink-soft">
              National ID Submission
            </h2>
            <p className="text-sm text-ink">
              <span className="text-ink-soft">ID Number: </span>
              {user.nationalIdRef}
            </p>
            {user.nationalIdPhotoUrl && (
              <div className="relative mt-3 h-48 w-full max-w-sm overflow-hidden rounded-lg border border-border">
                <Image
                  src={resolveMediaUrl(user.nationalIdPhotoUrl)}
                  alt="National ID submission"
                  fill
                  unoptimized
                  sizes="400px"
                  className="object-cover"
                />
              </div>
            )}
            {!user.isVerified && (
              <button
                onClick={() => handleSaveEdit(user.id, { isVerified: true })}
                disabled={busyId === user.id}
                className="mt-3 rounded-full bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage/90 disabled:opacity-60"
              >
                Approve Verification
              </button>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark"
          >
            Edit
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={busyId === user.id}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      <EditUserCard
        user={editing ? user : null}
        isSaving={busyId === user.id}
        onClose={() => setEditing(false)}
        onSave={handleSaveEdit}
      />

      <DeleteDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Archive this user?"
        itemName={user.fullName}
        description={
          <>
            <span className="font-medium">{user.fullName}</span> will lose
            access to their account. You can restore them later from the backend
            if needed.
          </>
        }
      />
    </div>
  );
}
