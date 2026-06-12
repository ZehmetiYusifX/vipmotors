"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { cn } from "@/lib/cn";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Custom confirmation modal — replaces the native window.confirm(). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Təsdiqlə",
  cancelLabel = "Ləğv et",
  loading = false,
  danger = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
      onClick={() => !loading && onCancel()}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)] animate-dropdown"
      >
        <div className="p-6">
          <div className="flex items-start gap-3.5">
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                danger
                  ? "bg-red-500/15 text-red-300"
                  : "bg-brand-500/15 text-brand-300"
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white">{title}</h3>
              {message && (
                <p className="mt-1 text-sm text-ink-300 leading-relaxed">{message}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-300 hover:text-white hover:bg-white/5 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors disabled:opacity-60",
              danger
                ? "bg-red-500 hover:bg-red-400"
                : "bg-brand-500 hover:bg-brand-400"
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
