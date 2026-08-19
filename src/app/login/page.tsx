"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api";
import { UserRole } from "@/lib/types";

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
    <div className="mx-auto max-w-xl px-6 py-16 lg:px-0">
      <div className="mb-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="font-display text-3xl font-semibold text-terracotta">
            SecondHand
          </span>
          <span className="rounded-md bg-terracotta px-2.5 py-1 font-mono-data text-base font-semibold text-white">
            ET
          </span>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-white p-8">
        <div className="mb-8 grid grid-cols-2 gap-1 rounded-full bg-cream-dim p-1">
          <button
            onClick={() => setTab("signin")}
            className={`rounded-full py-2.5 text-sm font-semibold transition-colors ${
              tab === "signin" ? "bg-white text-ink shadow-sm" : "text-ink-soft"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab("create")}
            className={`rounded-full py-2.5 text-sm font-semibold transition-colors ${
              tab === "create" ? "bg-white text-ink shadow-sm" : "text-ink-soft"
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

      <p className="mt-6 text-center text-xs text-ink-soft">
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
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block font-mono-data text-xs font-medium uppercase tracking-wide text-ink-soft">
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-cream-dim px-4 py-3 text-ink outline-none placeholder:text-ink-soft/70 focus:border-terracotta";

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
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
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

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  // Use lazy initialization to check if we're on the client
  const [mounted, setMounted] = useState(() => {
    if (typeof window !== "undefined") {
      // This will only run on the client
      return true;
    }
    return false;
  });

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        required
        minLength={8}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <svg
            className="h-5 w-5"
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
        ) : (
          <svg
            className="h-5 w-5"
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
        )}
      </button>
    </div>
  );
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password, role });
    } catch (err) {
      // Selected role didn't match — try admin silently before surfacing an error.
      // Covers the case where a seeded admin account logs in without a visible
      // "Admin" option in the UI.
      try {
        await login({ email, password, role: "admin" });
      } catch {
        setError(
          err instanceof ApiError ? err.message : "Something went wrong",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <FieldLabel>Email Address</FieldLabel>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jossi@example.com"
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
        <FieldLabel>Sign in as</FieldLabel>
        <RoleToggle
          value={role}
          onChange={setRole}
          options={[
            { value: "buyer", label: "Buyer" },
            { value: "seller", label: "Seller" },
          ]}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-terracotta py-3 font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:opacity-60"
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
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        fullName,
        email,
        phone,
        password,
        city: city || undefined,
        role,
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
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="text-ink">Account created! You can now sign in.</p>
        <button
          onClick={onSwitch}
          className="rounded-xl bg-terracotta px-6 py-2.5 font-semibold text-white hover:bg-terracotta-dark"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <FieldLabel>Full Name</FieldLabel>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jossi Az"
          className={inputClass}
        />
      </div>

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
        <FieldLabel>Phone Number</FieldLabel>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+251 9XX XXX XXX"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel>Password</FieldLabel>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
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

      <div>
        <FieldLabel>I want to</FieldLabel>
        <RoleToggle
          value={role}
          onChange={(r) => setRole(r as "buyer" | "seller")}
          options={[
            { value: "buyer", label: "Buy items" },
            { value: "seller", label: "Sell items" },
          ]}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-terracotta py-3 font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:opacity-60"
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
