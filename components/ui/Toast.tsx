"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/cn";

export interface ToastState {
  kind: "error" | "success";
  text: string;
}

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
  /** Auto-dismiss delay in ms. */
  duration?: number;
}

/** Custom toast — replaces native window.alert() for transient notices. */
export function Toast({ toast, onClose, duration = 4500 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isError = toast.kind === "error";

  return (
    <div className="fixed bottom-5 left-1/2 z-[90] -translate-x-1/2 px-4 w-full max-w-sm">
      <div
        role="status"
        className={cn(
          "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-dropdown",
          isError
            ? "border-red-500/30 bg-red-500/15 text-red-100"
            : "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
        )}
      >
        {isError ? (
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
        )}
        <span className="flex-1">{toast.text}</span>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-0.5 opacity-70 hover:opacity-100 hover:bg-white/10"
          aria-label="Bağla"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
