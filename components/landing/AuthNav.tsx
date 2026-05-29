"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

import { userAuth } from "@/lib/api/endpoints";
import { clearTokens, getTokens } from "@/lib/api/tokens";
import type { UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/cn";

type State =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: UserProfile };

export function AuthNav() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tokens = getTokens("USER");
    if (!tokens?.accessToken) {
      setState({ status: "anonymous" });
      return;
    }
    userAuth
      .me()
      .then((user) => {
        if (!cancelled) setState({ status: "authenticated", user });
      })
      .catch(() => {
        if (cancelled) return;
        clearTokens("USER");
        setState({ status: "anonymous" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-auth-menu]")) setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  function logout() {
    clearTokens("USER");
    setState({ status: "anonymous" });
    setMenuOpen(false);
    router.push("/");
  }

  if (state.status === "loading") {
    return <div className="h-9 w-24 rounded-full bg-white/5 animate-pulse" aria-hidden="true" />;
  }

  if (state.status === "anonymous") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden sm:inline-flex text-sm font-medium text-ink-200 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          Daxil ol
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 rounded-full bg-white text-ink-950 hover:bg-ink-100 px-4 py-2 text-sm font-semibold transition-colors"
        >
          Qeydiyyat
        </Link>
      </div>
    );
  }

  const { user } = state;
  const displayName = user.fullName?.trim() || user.plateNumber;
  const initials = (user.fullName ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative" data-auth-menu>
      <button
        type="button"
        className="flex items-center gap-2.5 rounded-full border-hairline bg-white/5 hover:bg-white/10 pl-1.5 pr-3 py-1.5 transition-colors"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[11px] font-semibold text-white">
          {initials || "U"}
        </span>
        <span className="hidden sm:flex flex-col text-left leading-tight">
          <strong className="text-xs text-white font-semibold">
            {displayName.split(" ")[0]}
          </strong>
          <span className="text-[10px] text-ink-400 font-mono">{user.plateNumber}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-ink-300 transition-transform",
            menuOpen && "rotate-180"
          )}
        />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl glass-strong shadow-2xl overflow-hidden z-50"
        >
          <div className="p-4 border-b border-white/5">
            <strong className="block text-sm font-semibold text-white truncate">
              {displayName}
            </strong>
            <span className="text-xs text-ink-400 truncate block">{user.email}</span>
          </div>
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-ink-200 hover:bg-white/5 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4 text-ink-400" />
            Sürücü kabineti
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-brand-300 hover:bg-brand-500/10 hover:text-brand-200 border-t border-white/5"
          >
            <LogOut className="h-4 w-4" />
            Çıxış
          </button>
        </div>
      )}
    </div>
  );
}
