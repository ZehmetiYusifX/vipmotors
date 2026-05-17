import type { Role } from "./types";

const USER_KEY = "vm.user.tokens";
const SERVICE_KEY = "vm.service.tokens";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function storageKey(role: Role) {
  return role === "USER" ? USER_KEY : SERVICE_KEY;
}

export function getTokens(role: Role): TokenPair | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(role));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TokenPair;
    if (!parsed?.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setTokens(role: Role, tokens: TokenPair): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(role), JSON.stringify(tokens));
}

export function clearTokens(role: Role): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(role));
}
