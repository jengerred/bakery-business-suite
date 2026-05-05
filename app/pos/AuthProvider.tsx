"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  name: string;
  role: string;
  token: string;
}

interface AuthContextType {
  employee: Employee | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  employee: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("employee");

    if (!stored) {
      setEmployee(null);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setEmployee(parsed);
    } catch {
      setEmployee(null);
    }

    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    setEmployee(null);
    router.push("/pos/login");
  };

  return (
    <AuthContext.Provider value={{ employee, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useEmployee() {
  return useContext(AuthContext);
}
