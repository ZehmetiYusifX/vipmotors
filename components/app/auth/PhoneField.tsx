"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";
import { AZ_DIAL_CODE, formatLocalPhone, normalizeLocalPhone } from "@/lib/phone";
import { labelClass } from "./fieldStyles";

interface PhoneFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  label: string;
  /** Local digits only (without the +994 prefix). */
  value: string;
  onChange: (local: string) => void;
  hint?: string;
  error?: string;
}

/**
 * Phone input with a locked +994 prefix. The parent stores only the local
 * digits; use toFullPhone(value) to get what the backend expects.
 */
export function PhoneField({
  label,
  value,
  onChange,
  hint,
  error,
  className,
  ...props
}: PhoneFieldProps) {
  const autoId = useId();
  const describedBy = error || hint ? `${autoId}-desc` : undefined;
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-xl border-hairline bg-ink-900/60 transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-brand-500/50 focus-within:bg-ink-900 focus-within:ring-2 focus-within:ring-brand-500/15",
          error &&
            "border-brand-500/60 focus-within:border-brand-500/60 focus-within:ring-brand-500/20"
        )}
      >
        <span className="grid select-none place-items-center border-r border-white/10 bg-white/6 px-3.5 font-mono text-sm font-semibold text-white">
          {AZ_DIAL_CODE}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={formatLocalPhone(value)}
          onChange={(e) => onChange(normalizeLocalPhone(e.target.value))}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full bg-transparent px-4 py-3 font-mono tracking-wide text-white placeholder:font-sans placeholder:tracking-normal placeholder:text-ink-500 outline-none",
            className
          )}
          {...props}
        />
      </div>
      {(error || hint) && (
        <span
          id={describedBy}
          className={cn(
            "mt-1.5 block text-xs",
            error ? "text-brand-300" : "text-ink-500"
          )}
        >
          {error ?? hint}
        </span>
      )}
    </label>
  );
}
