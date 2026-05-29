"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = true,
  disabled = false,
  className
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function setDigit(index: number, digit: string) {
    const cleaned = digit.replace(/\D/g, "").slice(0, 1);
    const chars = value.split("");
    while (chars.length < length) chars.push("");
    chars[index] = cleaned;
    onChange(chars.join("").slice(0, length));
    if (cleaned && index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        refs.current[index - 1]?.focus();
      } else {
        const chars = value.split("");
        chars[index] = "";
        onChange(chars.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const next = Math.min(pasted.length, length - 1);
    refs.current[next]?.focus();
  }

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Rəqəm ${i + 1}`}
          className="h-12 w-10 sm:h-14 sm:w-12 text-center font-mono text-lg sm:text-xl text-white bg-ink-900/60 border-hairline rounded-xl outline-none focus:border-brand-500/50 focus:bg-ink-900 transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
}
