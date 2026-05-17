import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Wrench, ArrowLeft } from "lucide-react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen flex flex-col bg-ink-950 text-ink-100 overflow-hidden">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-brand-700/15 blur-3xl" />
        <div className="absolute inset-0 grid-bg opacity-40 radial-fade" />
      </div>

      <header className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 shadow-glow">
            <Wrench className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            VIP <span className="text-ink-300">Motors</span>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana səhifə
        </Link>
      </header>

      <section className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-xl">
          <div className="rounded-3xl glass-strong p-7 sm:p-10 shadow-card">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              {eyebrow}
            </span>
            <h1 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              {title}
            </h1>
            <p className="mt-3 text-ink-300 leading-relaxed">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-6 pt-6 border-t border-white/5 text-sm text-ink-400 text-center">
                {footer}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
