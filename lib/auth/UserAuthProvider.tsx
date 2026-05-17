"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { userAuth } from "@/lib/api/endpoints";
import { clearTokens, getTokens, setTokens } from "@/lib/api/tokens";
import type { AuthResponse, UserProfile } from "@/lib/api/types";

type Status = "loading" | "authenticated" | "anonymous";

interface UserAuthContextValue {
  status: Status;
  user: UserProfile | null;
  refresh: () => Promise<void>;
  saveSession: (tokens: AuthResponse) => Promise<void>;
  logout: () => void;
}

const UserAuthContext = createContext<UserAuthContextValue | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);

  const refresh = useCallback(async () => {
    const tokens = getTokens("USER");
    if (!tokens) {
      setUser(null);
      setStatus("anonymous");
      return;
    }
    try {
      const profile = await userAuth.me();
      setUser(profile);
      setStatus("authenticated");
    } catch {
      clearTokens("USER");
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSession = useCallback(
    async (tokens: AuthResponse) => {
      setTokens("USER", tokens);
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(() => {
    clearTokens("USER");
    setUser(null);
    setStatus("anonymous");
    router.push("/login");
  }, [router]);

  const value = useMemo<UserAuthContextValue>(
    () => ({ status, user, refresh, saveSession, logout }),
    [status, user, refresh, saveSession, logout]
  );

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error("useUserAuth must be used inside UserAuthProvider");
  }
  return ctx;
}
