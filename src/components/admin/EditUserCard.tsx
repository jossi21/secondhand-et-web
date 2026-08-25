"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { UpdateUserCommand, UserContact, UserResponse } from "@/lib/types";
import { FormModal } from "@/components/ui/FormModal";
import { FormField } from "@/components/ui/FormField";
import { ContactsEditor } from "@/components/users/ContactsEditor";
import {
  validateEditUserForm,
  type UserFormErrors,
} from "@/lib/validation/userForm";

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

interface EditFormState {
  fullName: string;
  phone: string;
  city: string;
  contacts: UserContact[];
}

function EditUserForm({
  user,
  isSaving,
  onClose,
  onSave,
}: {
  user: UserResponse;
  isSaving: boolean;
  onClose: () => void;
  onSave: (id: string, command: UpdateUserCommand) => Promise<void>;
}) {
  const [form, setForm] = useState<EditFormState>({
    fullName: user.fullName,
    phone: user.phone ?? "",
    city: user.city ?? "",
    contacts: user.contacts ?? [],
  });
  const [fieldErrors, setFieldErrors] = useState<UserFormErrors>({});
  const [error, setError] = useState<string | null>(null);

  const isSeller = user.role === "seller";
  const isBuyer = user.role === "buyer";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateEditUserForm({
      fullName: form.fullName,
      phone: form.phone,
      city: form.city,
      role: user.role,
      contacts: form.contacts,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    try {
      await onSave(user.id, {
        fullName: form.fullName,
        city: form.city || undefined,
        ...(isBuyer ? { phone: form.phone } : {}),
        ...(isSeller ? { contacts: form.contacts } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user");
    }
  }

  return (
    <FormModal title="Edit user" onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-3"
      >
        <FormField
          id="edit-fullName"
          label="Full name"
          error={fieldErrors.fullName}
        >
          <input
            id="edit-fullName"
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
          />
        </FormField>

        {isBuyer && (
          <FormField id="edit-phone" label="Phone" error={fieldErrors.phone}>
            <input
              id="edit-phone"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </FormField>
        )}

        {isSeller && (
          <FormField
            id="edit-contacts"
            label="Contact methods"
            error={fieldErrors.contacts}
          >
            <ContactsEditor
              initialContacts={form.contacts}
              onChange={(contacts) => setForm({ ...form, contacts })}
            />
          </FormField>
        )}

        <FormField id="edit-city" label="City (optional)">
          <input
            id="edit-city"
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
            disabled={isSaving}
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cream-dim"
          >
            Cancel
          </button>
        </div>
      </form>
    </FormModal>
  );
}

export function EditUserCard({
  user,
  isSaving,
  onClose,
  onSave,
}: {
  user: UserResponse | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (id: string, command: UpdateUserCommand) => Promise<void>;
}) {
  if (!user) return null;

  return (
    <EditUserForm
      key={user.id}
      user={user}
      isSaving={isSaving}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
