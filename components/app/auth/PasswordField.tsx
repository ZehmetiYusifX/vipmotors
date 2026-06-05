"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/cn";
import { fieldClass, fieldErrorClass, labelClass } from "./fieldStyles";

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
  error?: string;
}

/** Labeled password input with a show/hide toggle and inline hint/error. */
export function PasswordField({
  label,
  hint,
  error,
  className,
  ...props
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const autoId = useId();
  const describedBy = error || hint ? `${autoId}-desc` : undefined;
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(fieldClass, "pr-12", error && fieldErrorClass, className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Parolu gizlət" : "Parolu göstər"}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
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
