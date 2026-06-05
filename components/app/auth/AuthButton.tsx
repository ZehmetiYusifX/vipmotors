import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/cn";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  /** Hide the trailing arrow (e.g. for non-forward actions). */
  hideArrow?: boolean;
  children: ReactNode;
}

/** Primary auth submit button with loading spinner and hover-nudge arrow. */
export function AuthButton({
  loading = false,
  loadingText = "Yüklənir…",
  hideArrow = false,
  children,
  className,
  disabled,
  type = "submit",
  ...props
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {!hideArrow && (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </>
      )}
    </button>
  );
}
