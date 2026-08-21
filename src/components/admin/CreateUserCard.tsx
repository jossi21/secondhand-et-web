"use client";

import { useState } from "react";
import { useCreateUser, type CreateUserForm } from "@/hooks/useCreateUser";
import { useToast } from "@/components/ui/Toast";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/ui/FormField";
import {
  validateCreateUserForm,
  type UserFormErrors,
} from "@/lib/validation/userForm";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

const EMPTY: CreateUserForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  city: "",
};

export function CreateUserCard({
  role,
  onCreated,
}: {
  role: "buyer" | "seller";
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<UserFormErrors>({});
  const { isSubmitting, error, clearError, createUser } = useCreateUser();
  const toast = useToast();

  function close() {
    setOpen(false);
    setForm(EMPTY);
    setFieldErrors({});
    clearError();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateCreateUserForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const ok = await createUser(role, form);
    if (ok) {
      toast.success(
        `${role === "buyer" ? "Buyer" : "Seller"} account created`,
        `${form.fullName} can now sign in.`,
      );
      close();
      onCreated?.();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark"
      >
        + New {role === "buyer" ? "Buyer" : "Seller"}
      </button>

      {open && (
        <FormModal
          title={`New ${role === "buyer" ? "Buyer" : "Seller"}`}
          onClose={close}
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 gap-3"
          >
            <FormField
              id="create-fullName"
              label="Full name"
              error={fieldErrors.fullName}
            >
              <input
                id="create-fullName"
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <FormField
              id="create-email"
              label="Email"
              error={fieldErrors.email}
            >
              <input
                id="create-email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <FormField
              id="create-phone"
              label="Phone"
              error={fieldErrors.phone}
            >
              <input
                id="create-phone"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <FormField
              id="create-password"
              label="Password"
              error={fieldErrors.password}
            >
              <input
                id="create-password"
                type="password"
                placeholder="Password (min 8 chars)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
              />
            </FormField>

            <FormField id="create-city" label="City (optional)">
              <input
                id="create-city"
                placeholder="City (optional)"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={inputClass}
              />
            </FormField>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
              >
                {isSubmitting ? "Creating…" : "Create account"}
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
              >
                Cancel
              </button>
            </div>
          </form>
        </FormModal>
      )}
    </>
  );
}
