"use client";

import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import { ReactNode, useEffect } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return <>{children}</>;
}
