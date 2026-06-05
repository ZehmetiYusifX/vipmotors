"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { UserProfile } from "@/lib/api/types";
import { DashboardSidebar } from "./DashboardSidebar";
import { SECTIONS, type DashboardSection } from "./nav";

interface DashboardShellProps {
  active: DashboardSection;
  onNavigate: (section: DashboardSection) => void;
  user: UserProfile;
  onLogout: () => void;
  displayName: string;
  initials: string;
  children: React.ReactNode;
}

export function DashboardShell({
  active,
  onNavigate,
  user,
  onLogout,
  displayName,
  initials,
  children
}: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const reduce = useReducedMotion();
  const activeLabel = SECTIONS.find((s) => s.key === active)?.label ?? "";

  // Close the mobile drawer on Escape and lock body scroll while it's open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  function handleNavigate(section: DashboardSection) {
    onNavigate(section);
    setDrawerOpen(false);
  }

  const sidebar = (
    <DashboardSidebar
      active={active}
      onNavigate={handleNavigate}
      user={user}
      onLogout={onLogout}
      displayName={displayName}
      initials={initials}
    />
  );

  return (
    <main className="min-h-screen bg-ink-950 text-ink-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-white/5 glass-strong lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[280px] max-w-[82vw] border-r border-white/5 bg-ink-900/95 backdrop-blur-xl"
              initial={reduce ? { opacity: 0 } : { x: "-100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Bağla"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-ink-300 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 glass-strong px-4 py-3.5 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menyu"
            className="grid h-9 w-9 place-items-center rounded-lg border-hairline bg-white/5 text-ink-200 hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <span className="text-sm font-semibold tracking-tight">{activeLabel}</span>
          <span className="h-9 w-9" aria-hidden="true" />
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </div>
    </main>
  );
}
