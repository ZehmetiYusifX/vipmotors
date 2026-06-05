"use client";

import { forwardRef, useId } from "react";

import { cn } from "@/lib/cn";
import { fieldClass, fieldErrorClass, labelClass } from "./fieldStyles";

interface AuthFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

/** Labeled text/email/tel input with an inline hint or error line below it. */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, hint, error, className, ...props }, ref) {
    const autoId = useId();
    const describedBy = error || hint ? `${autoId}-desc` : undefined;
    return (
      <label className="block">
        <span className={labelClass}>{label}</span>
        <input
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(fieldClass, error && fieldErrorClass, className)}
          {...props}
        />
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
);
