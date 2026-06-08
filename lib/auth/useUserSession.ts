"use client";

import { useEffect, useState } from "react";

import { userAuth } from "@/lib/api/endpoints";
import { clearTokens, getTokens } from "@/lib/api/tokens";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

/**
 * Lightweight client-side auth check for pages outside the dashboard
 * (where UserAuthProvider is not mounted). Validates the stored token via
 * /me and clears it if the session is no longer valid.
 */
export function useUserSession(): SessionStatus {
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    const tokens = getTokens("USER");
    if (!tokens?.accessToken) {
      setStatus("anonymous");
      return;
    }
    userAuth
      .me()
      .then(() => {
        if (!cancelled) setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        clearTokens("USER");
        setStatus("anonymous");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
