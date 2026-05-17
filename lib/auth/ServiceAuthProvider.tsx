"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { clearTokens, getTokens, setTokens } from "@/lib/api/tokens";
import type { AuthResponse } from "@/lib/api/types";

type Status = "loading" | "authenticated" | "anonymous";

interface ServiceAuthContextValue {
  status: Status;
  saveSession: (tokens: AuthResponse) => void;
  logout: () => void;
}

const ServiceAuthContext = createContext<ServiceAuthContextValue | null>(null);

export function ServiceAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const tokens = getTokens("CAR_SERVICE");
    setStatus(tokens?.accessToken ? "authenticated" : "anonymous");
  }, []);

  const saveSession = useCallback((tokens: AuthResponse) => {
    setTokens("CAR_SERVICE", tokens);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearTokens("CAR_SERVICE");
    setStatus("anonymous");
  }, []);

  const value = useMemo<ServiceAuthContextValue>(
    () => ({ status, saveSession, logout }),
    [status, saveSession, logout]
  );

  return (
    <ServiceAuthContext.Provider value={value}>
      {children}
    </ServiceAuthContext.Provider>
  );
}

export function useServiceAuth() {
  const ctx = useContext(ServiceAuthContext);
  if (!ctx) {
    throw new Error("useServiceAuth must be used inside ServiceAuthProvider");
  }
  return ctx;
}
