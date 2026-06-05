"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/cn";

type Variant = "error" | "success" | "info";

const variantClass: Record<Variant, string> = {
  error: "border-brand-500/30 bg-brand-500/10 text-brand-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  info: "border-white/10 bg-white/5 text-ink-200"
};

const variantIcon = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info
} as const;

interface AuthAlertProps {
  variant: Variant;
  children: ReactNode;
  className?: string;
}

/** Inline status banner: error / success / info, with a gentle entrance. */
export function AuthAlert({ variant, children, className }: AuthAlertProps) {
  const reduce = useReducedMotion();
  const Icon = variantIcon[variant];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role={variant === "success" ? "status" : "alert"}
      aria-live="polite"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border p-3.5 text-sm",
        variantClass[variant],
        className
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
      <span>{children}</span>
    </motion.div>
  );
}
