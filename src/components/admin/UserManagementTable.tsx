"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { ApiError } from "@/lib/api";
import { UpdateUserCommand, UserResponse } from "@/lib/types";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import { useToast } from "@/components/ui/Toast";
import { Dropdown } from "@/components/ui/Dropdown";
import { EditUserCard } from "@/components/admin/EditUserCard";

type FilterOptions = {
  verified: "all" | "verified" | "unverified";
  status: "all" | "active" | "archived";
  dateRange: "all" | "today" | "week" | "month";
};

function timeAgo(dateString: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UserManagementTable({
  role,
  roleLabel,
  searchQuery = "",
  filters = { verified: "all", status: "all", dateRange: "all" },
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
}: {
  role: "buyer" | "seller";
  roleLabel: string;
  searchQuery?: string;
  filters?: FilterOptions;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (value: number) => void;
}) {
  const { users, isLoading, busyId, updateUser, toggleVerified, archiveUser } =
    useAdminUsers(role);
  const toast = useToast();
  const router = useRouter();

  const [editTarget, setEditTarget] = useState<UserResponse | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<UserResponse | null>(null);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let result = users;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.phone && u.phone.includes(query)) ||
          (u.city && u.city.toLowerCase().includes(query)),
      );
    }

    // Verification filter
    if (filters.verified === "verified") {
      result = result.filter((u) => u.isVerified === true);
    } else if (filters.verified === "unverified") {
      result = result.filter((u) => u.isVerified === false);
    }

    // Status filter - check if user is archived
    if (filters.status === "active") {
      result = result.filter((u) => {
        // @ts-expect-error - status field may not exist on UserResponse type yet
        return u.status !== "archived";
      });
    } else if (filters.status === "archived") {
      result = result.filter((u) => {
        // @ts-expect-error - status field may not exist on UserResponse type yet
        return u.status === "archived";
      });
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      result = result.filter((u) => {
        const joinedDate = new Date(u.createdAt);
        const joinedDay = new Date(
          joinedDate.getFullYear(),
          joinedDate.getMonth(),
          joinedDate.getDate(),
        );

        if (filters.dateRange === "today") {
          return joinedDay.getTime() === today.getTime();
        } else if (filters.dateRange === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return joinedDay >= weekAgo;
        } else if (filters.dateRange === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return joinedDay >= monthAgo;
        }
        return true;
      });
    }

    return result;
  }, [users, searchQuery, filters]);

  // Pagination logic
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (onPageChange && currentPage > totalPages && totalPages > 0) {
      onPageChange(1);
    }
  }, [totalPages, currentPage, onPageChange]);

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

  const goToPage = (page: number) => {
    if (onPageChange) {
      onPageChange(Math.max(1, Math.min(page, totalPages)));
    }
  };

  // Helper function to check if a user is archived
  const isUserArchived = (user: UserResponse): boolean => {
    // @ts-expect-error - status field may not exist on UserResponse type yet
    return user.status === "archived";
  };

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
        {currentItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-ink-soft">
              No {roleLabel.toLowerCase()}s match your search or filters.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border font-mono-data text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-6 py-3 font-medium whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-6 py-3 font-medium whitespace-nowrap">
                    Contact
                  </th>
                  <th className="px-6 py-3 font-medium whitespace-nowrap">
                    City
                  </th>
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
                {currentItems.map((u) => {
                  const isArchived = isUserArchived(u);
                  return (
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
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              u.isVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {u.isVerified ? "Verified" : "Unverified"}
                          </span>
                          {isArchived && (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                              Archived
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono-data text-ink-soft whitespace-nowrap">
                        <div>
                          <div>{timeAgo(u.createdAt)}</div>
                          <div className="text-[10px] text-ink-soft/60">
                            {formatDate(u.createdAt)}
                          </div>
                        </div>
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
                              onSelect: () =>
                                router.push(`/admin/${role}s/${u.id}`),
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
                              label: isArchived ? "Restore" : "Archive",
                              variant: isArchived ? "default" : "danger",
                              onSelect: () => {
                                if (isArchived) {
                                  toast.info(
                                    "Restore functionality coming soon",
                                  );
                                } else {
                                  setArchiveTarget(u);
                                }
                              },
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && onPageChange && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-ink-soft">
                  <span>
                    Showing {startIndex + 1}–{endIndex} of {totalItems}
                  </span>
                  {onItemsPerPageChange && (
                    <select
                      value={itemsPerPage}
                      onChange={(e) =>
                        onItemsPerPageChange(Number(e.target.value))
                      }
                      className="rounded-lg border border-border bg-white px-2 py-1 text-sm text-ink outline-none focus:border-terracotta"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm transition-colors ${
                            currentPage === pageNum
                              ? "bg-terracotta text-white"
                              : "text-ink-soft hover:bg-cream-dim hover:text-ink"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft hover:bg-cream-dim hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
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
