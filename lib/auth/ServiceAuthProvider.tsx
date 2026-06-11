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
  isOwner: boolean;
  saveSession: (tokens: AuthResponse) => void;
  logout: () => void;
}

const ServiceAuthContext = createContext<ServiceAuthContextValue | null>(null);

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function checkIsOwner(tokens: { accessToken: string } | null): boolean {
  if (!tokens?.accessToken) return false;
  const payload = decodeJwtPayload(tokens.accessToken);
  const authorities = payload.authorities ?? payload.roles ?? payload.role ?? [];
  if (Array.isArray(authorities)) {
    return authorities.some(
      (a) => typeof a === "string" && a.toUpperCase().includes("OWNER")
    );
  }
  if (typeof authorities === "string") {
    return authorities.toUpperCase().includes("OWNER");
  }
  return false;
}

export function ServiceAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const tokens = getTokens("CAR_SERVICE");
    if (tokens?.accessToken) {
      setStatus("authenticated");
      setIsOwner(checkIsOwner(tokens));
    } else {
      setStatus("anonymous");
    }
  }, []);

  const saveSession = useCallback((tokens: AuthResponse) => {
    setTokens("CAR_SERVICE", tokens);
    setStatus("authenticated");
    setIsOwner(checkIsOwner(tokens));
  }, []);

  const logout = useCallback(() => {
    clearTokens("CAR_SERVICE");
    setStatus("anonymous");
    setIsOwner(false);
  }, []);

  const value = useMemo<ServiceAuthContextValue>(
    () => ({ status, isOwner, saveSession, logout }),
    [status, isOwner, saveSession, logout]
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
