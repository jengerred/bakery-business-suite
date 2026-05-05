"use client";

import { useEmployee } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { employee, loading } = useEmployee();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !employee) {
      router.push("/pos/login");
    }
  }, [loading, employee, router]);

  if (loading) return null;

  return <>{children}</>;
}
