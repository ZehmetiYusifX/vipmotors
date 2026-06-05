"use client";

import Link from "next/link";
import { LogOut, Wrench } from "lucide-react";

import { cn } from "@/lib/cn";
import type { UserProfile } from "@/lib/api/types";
import { SECTIONS, type DashboardSection } from "./nav";

interface DashboardSidebarProps {
  active: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  user: UserProfile;
  onLogout: () => void;
  displayName: string;
  initials: string;
}

export function DashboardSidebar({
  active,
  onNavigate,
  user,
  onLogout,
  displayName,
  initials
}: DashboardSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link href="/" className="flex items-center gap-2.5 px-1">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
          <Wrench className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold tracking-tight">
            VIP <span className="text-ink-300">Motors</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-brand-400">
            Sürücü kabineti
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {SECTIONS.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-500/10 text-white"
                  : "text-ink-300 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" />
              )}
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0",
                  isActive
                    ? "text-brand-400"
                    : "text-ink-400 group-hover:text-ink-200"
                )}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2.5 rounded-xl border-hairline bg-white/5 p-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-500 to-brand-700 text-[12px] font-semibold text-white">
            {initials || "U"}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <strong className="truncate text-xs text-white">{displayName}</strong>
            <span className="truncate font-mono text-[10px] text-ink-400">
              {user.phoneNumber}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-hairline bg-white/5 px-4 py-2.5 text-sm font-medium text-brand-300 transition-colors hover:bg-white/10 hover:text-brand-200"
        >
          <LogOut className="h-4 w-4" /> Çıxış
        </button>
      </div>
    </div>
  );
}
