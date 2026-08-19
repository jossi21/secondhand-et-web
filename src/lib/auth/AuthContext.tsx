"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { LoginCommand, RegisterCommand, UserInfo } from "@/lib/types";

interface AuthContextValue {
  user: UserInfo | null;
  loading: boolean;
  login: (command: LoginCommand) => Promise<void>;
  register: (command: RegisterCommand) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function dashboardPathForRole(role: UserInfo["role"]): string {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/dashboard/seller";
  return "/dashboard/buyer";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch<{ user: UserInfo }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (command: LoginCommand) => {
      const data = await apiFetch<{ user: UserInfo }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(command),
      });
      setUser(data.user);
      router.push(dashboardPathForRole(data.user.role));
    },
    [router],
  );

  const register = useCallback(async (command: RegisterCommand) => {
    await apiFetch<UserInfo>("/auth/register", {
      method: "POST",
      body: JSON.stringify(command),
    });
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
