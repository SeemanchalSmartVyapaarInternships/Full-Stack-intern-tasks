"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldX } from "lucide-react";

export default function RoleGuard({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--red-bg)" }}>
            <ShieldX size={32} style={{ color: "var(--red-text)" }} />
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Access Denied</h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            You don&apos;t have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
