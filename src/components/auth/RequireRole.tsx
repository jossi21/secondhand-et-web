"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserRole } from "@/lib/types";

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!roles.includes(user.role)) {
      router.replace("/");
    }
  }, [loading, user, roles, router]);

  if (loading || !user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
