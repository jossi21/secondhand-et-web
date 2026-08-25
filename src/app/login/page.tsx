"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api";
import { UserRole, UserContact } from "@/lib/types";
import { ContactsEditor } from "@/components/users/ContactsEditor";
import {
  validateCreateUserForm,
  type UserFormErrors,
} from "@/lib/validation/userForm";

const CITIES = [
  "Addis Ababa",
  "Hawassa",
  "Adama",
  "Bahir Dar",
  "Mekelle",
  "Dire Dawa",
  "Gondar",
  "Jimma",
];

type Tab = "signin" | "create";

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("signin");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-4 bg-cream-dim">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-display text-2xl font-semibold text-terracotta">
              SecondHand
            </span>
            <span className="rounded-md bg-terracotta px-2 py-0.5 font-mono-data text-sm font-semibold text-white">
              ET
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 md:p-6">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-cream-dim p-1">
            <button
              onClick={() => setTab("signin")}
              className={`rounded-full py-1.5 text-sm font-semibold transition-colors ${
                tab === "signin"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-soft"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("create")}
              className={`rounded-full py-1.5 text-sm font-semibold transition-colors ${
                tab === "create"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-soft"
              }`}
            >
              Create Account
            </button>
          </div>

          {tab === "signin" ? (
            <SignInForm onSwitch={() => setTab("create")} />
          ) : (
            <CreateAccountForm onSwitch={() => setTab("signin")} />
          )}
        </div>

        <p className="mt-4 text-center text-xs text-ink-soft">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-terracotta underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-terracotta underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block font-mono-data text-[10px] font-medium uppercase tracking-wide text-ink-soft">
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-cream-dim px-3 py-1.5 text-sm text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta transition-colors";

// Password input component with visibility toggle
function PasswordInput({
  value,
  onChange,
  placeholder,
  minLength,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  minLength?: number;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          // Eye closed (hidden) icon
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ) : (
          // Eye open (visible) icon
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

function RoleToggle({
  value,
  onChange,
  options,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
  options: { value: UserRole; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            value === opt.value
              ? "border-terracotta bg-terracotta-tint text-terracotta"
              : "border-border text-ink-soft hover:border-ink/20"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password, ...(role ? { role } : {}) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <FieldLabel>Email Address</FieldLabel>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="abel@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel>Password</FieldLabel>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </div>

      <div>
        <FieldLabel>Sign in as (optional)</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "buyer" as UserRole, label: "Buyer" },
            { value: "seller" as UserRole, label: "Seller" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                setRole((current) => (current === opt.value ? null : opt.value))
              }
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                role === opt.value
                  ? "border-terracotta bg-terracotta-tint text-terracotta"
                  : "border-border text-ink-soft hover:border-ink/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-terracotta py-2 font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-terracotta hover:underline"
        >
          Sign up free
        </button>
      </p>
    </form>
  );
}

function CreateAccountForm({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("seller");
  const [fieldErrors, setFieldErrors] = useState<UserFormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const errors = validateCreateUserForm({
      fullName,
      email,
      phone,
      password,
      city,
      role,
      contacts,
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await register({
        fullName,
        email,
        password,
        city: city || undefined,
        role,
        ...(role === "buyer" ? { phone } : {}),
        ...(role === "seller" ? { contacts } : {}),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-ink">Account Created!</p>
        <p className="text-sm text-ink-soft">
          You can now sign in to your account.
        </p>
        <button
          onClick={onSwitch}
          className="rounded-lg bg-terracotta px-6 py-2 font-semibold text-white hover:bg-terracotta-dark transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div>
        <FieldLabel>I want to</FieldLabel>
        <RoleToggle
          value={role}
          onChange={(r) => setRole(r as "seller" | "buyer")}
          options={[
            { value: "seller", label: "Sell items" },
            { value: "buyer", label: "Buy items" },
          ]}
        />
      </div>

      <div>
        <FieldLabel>Full Name</FieldLabel>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          className={inputClass}
        />
        {fieldErrors.fullName && (
          <p className="mt-0.5 text-xs text-red-600">{fieldErrors.fullName}</p>
        )}
      </div>

      <div>
        <FieldLabel>Email Address</FieldLabel>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="abel@example.com"
          className={inputClass}
        />
        {fieldErrors.email && (
          <p className="mt-0.5 text-xs text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <FieldLabel>Password</FieldLabel>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
        />
        {fieldErrors.password && (
          <p className="mt-0.5 text-xs text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      <div>
        <FieldLabel>City</FieldLabel>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputClass}
        >
          <option value="">Select your city</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {role === "buyer" ? (
        <div>
          <FieldLabel>Phone Number</FieldLabel>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 9XX XXX XXX"
            className={inputClass}
          />
          {fieldErrors.phone && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.phone}</p>
          )}
        </div>
      ) : (
        <div>
          <FieldLabel>How Should Buyers Reach You?</FieldLabel>
          <ContactsEditor onChange={setContacts} compact />
          {fieldErrors.contacts && (
            <p className="mt-0.5 text-xs text-red-600">
              {fieldErrors.contacts}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-terracotta py-2 font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-terracotta hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
