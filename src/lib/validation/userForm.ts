export interface UserFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  contacts?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

const MAX_CONTACTS = 5;

export function validateFullName(value: string): string | undefined {
  if (!value.trim()) return "Full name is required.";
  if (value.trim().length < 2) return "Full name is too short.";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  if (!value.trim()) return "Phone is required.";
  if (!PHONE_RE.test(value.trim())) return "Enter a valid phone number.";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

export function validateContacts(
  contacts: { type: string; value: string }[],
): string | undefined {
  if (!contacts || contacts.length === 0) {
    return "Select at least one contact method.";
  }
  if (contacts.length > MAX_CONTACTS) {
    return `You can add at most ${MAX_CONTACTS} contacts.`;
  }
  return undefined;
}

export interface CreateUserFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  role: "buyer" | "seller";
  contacts: { type: string; value: string }[];
}

export function validateCreateUserForm(
  values: CreateUserFormValues,
): UserFormErrors {
  const errors: UserFormErrors = {};

  const fullName = validateFullName(values.fullName);
  if (fullName) errors.fullName = fullName;

  const email = validateEmail(values.email);
  if (email) errors.email = email;

  const password = validatePassword(values.password);
  if (password) errors.password = password;

  if (values.role === "buyer") {
    const phone = validatePhone(values.phone);
    if (phone) errors.phone = phone;
  } else {
    const contacts = validateContacts(values.contacts);
    if (contacts) errors.contacts = contacts;
  }

  return errors;
}

export interface EditUserFormValues {
  fullName: string;
  phone: string;
  city: string;
  role: "buyer" | "seller" | "admin";
  contacts: { type: string; value: string }[];
}

export function validateEditUserForm(
  values: EditUserFormValues,
): UserFormErrors {
  const errors: UserFormErrors = {};

  const fullName = validateFullName(values.fullName);
  if (fullName) errors.fullName = fullName;

  if (values.role === "seller") {
    const contacts = validateContacts(values.contacts);
    if (contacts) errors.contacts = contacts;
  } else if (values.role === "buyer") {
    const phone = validatePhone(values.phone);
    if (phone) errors.phone = phone;
  }
  // admin: no phone/contacts requirement either way

  return errors;
}
