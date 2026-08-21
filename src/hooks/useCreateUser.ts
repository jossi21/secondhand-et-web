import { useCallback, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { RegisterCommand } from "@/lib/types";

type Role = "buyer" | "seller";

export type CreateUserForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
};

type UseCreateUserResult = {
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
  createUser: (role: Role, form: CreateUserForm) => Promise<boolean>;
};

/**
 * Wraps POST /auth/register for admin-created buyer/seller accounts.
 * Returns true on success, false on failure (error is set on the hook).
 */
export function useCreateUser(): UseCreateUserResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (role: Role, form: CreateUserForm) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const command: RegisterCommand = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        city: form.city || undefined,
        role,
      };
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(command),
      });
      return true;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create account",
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, error, clearError: () => setError(null), createUser };
}
