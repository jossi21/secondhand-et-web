import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { UpdateUserCommand, UserResponse } from "@/lib/types";

type Role = "buyer" | "seller";

type UseAdminUsersResult = {
  users: UserResponse[];
  isLoading: boolean;
  /** id of the row currently mid-mutation (edit save / verify toggle / archive) */
  busyId: string | null;
  refetch: () => Promise<void>;
  updateUser: (id: string, command: UpdateUserCommand) => Promise<void>;
  toggleVerified: (user: UserResponse) => Promise<void>;
  archiveUser: (id: string) => Promise<void>;
  restoreUser: (id: string) => Promise<void>;
};

/**
 * Fetches users for a given role and exposes mutation helpers.
 * Each helper throws ApiError on failure — callers decide how to surface it
 * (toast, inline error, etc.) rather than the hook deciding for them.
 */
export function useAdminUsers(role: Role): UseAdminUsersResult {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchUsers = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const data = await apiFetch<UserResponse[]>(`/users?role=${role}`, {
        signal: controller.signal,
      });
      if (isMountedRef.current) setUsers(data);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      if (isMountedRef.current) setUsers([]);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchUsers();
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [fetchUsers]);

  const updateUser = useCallback(
    async (id: string, command: UpdateUserCommand) => {
      setBusyId(id);
      try {
        await apiFetch(`/users/${id}`, {
          method: "PATCH",
          body: JSON.stringify(command),
        });
        await fetchUsers();
      } finally {
        if (isMountedRef.current) setBusyId(null);
      }
    },
    [fetchUsers],
  );

  const toggleVerified = useCallback(
    async (user: UserResponse) => {
      await updateUser(user.id, {
        isVerified: !user.isVerified,
      } as UpdateUserCommand);
    },
    [updateUser],
  );

  const archiveUser = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        await apiFetch(`/users/${id}`, { method: "DELETE" });
        await fetchUsers();
      } finally {
        if (isMountedRef.current) setBusyId(null);
      }
    },
    [fetchUsers],
  );

  const restoreUser = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        await apiFetch(`/users/${id}/restore`, { method: "POST" });
        await fetchUsers();
      } finally {
        if (isMountedRef.current) setBusyId(null);
      }
    },
    [fetchUsers],
  );

  return {
    users,
    isLoading,
    busyId,
    refetch: fetchUsers,
    updateUser,
    toggleVerified,
    archiveUser,
    restoreUser,
  };
}

export type { ApiError };
