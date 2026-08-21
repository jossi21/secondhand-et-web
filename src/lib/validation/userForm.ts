export interface UserFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

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

export interface CreateUserFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
}

export function validateCreateUserForm(
  values: CreateUserFormValues,
): UserFormErrors {
  const errors: UserFormErrors = {};
  const fullName = validateFullName(values.fullName);
  if (fullName) errors.fullName = fullName;
  const email = validateEmail(values.email);
  if (email) errors.email = email;
  const phone = validatePhone(values.phone);
  if (phone) errors.phone = phone;
  const password = validatePassword(values.password);
  if (password) errors.password = password;
  return errors;
}

export interface EditUserFormValues {
  fullName: string;
  phone: string;
  city: string;
}

export function validateEditUserForm(
  values: EditUserFormValues,
): UserFormErrors {
  const errors: UserFormErrors = {};
  const fullName = validateFullName(values.fullName);
  if (fullName) errors.fullName = fullName;
  const phone = validatePhone(values.phone);
  if (phone) errors.phone = phone;
  return errors;
}
