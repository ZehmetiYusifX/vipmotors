"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional trailing hint, e.g. a count. */
  hint?: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Small label rendered above the current value inside the trigger. */
  label?: string;
  /** Leading icon element. */
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Fully custom dropdown — no native <select>, so the menu matches the dark
 * storefront theme on every browser. Closes on outside click / Escape and
 * supports arrow-key navigation.
 */
export function Select({ value, options, onChange, label, icon, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedIndex = Math.max(
    options.findIndex((o) => o.value === value),
    0
  );
  const current = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    setActiveIndex(selectedIndex);

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = options[activeIndex];
        if (opt) {
          onChange(opt.value);
          setOpen(false);
        }
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, options, activeIndex, selectedIndex, onChange]);

  return (
    <div ref={rootRef} className={"relative " + (className ?? "")}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl border-hairline bg-ink-900/60 px-3.5 py-2.5 text-left outline-none transition-colors hover:bg-ink-900 focus-visible:border-brand-500/50"
      >
        {icon && <span className="shrink-0 text-ink-400">{icon}</span>}
        <span className="min-w-0 flex-1 leading-tight">
          {label && (
            <span className="block text-[10px] uppercase tracking-[0.14em] text-ink-500">
              {label}
            </span>
          )}
          <span className="block truncate text-sm font-medium text-white">
            {current?.label}
          </span>
        </span>
        <ChevronDown
          className={
            "h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute right-0 z-50 mt-2 max-h-72 w-max min-w-full max-w-[20rem] origin-top overflow-auto rounded-xl border border-white/10 bg-ink-900/95 p-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-dropdown [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {options.map((opt, i) => {
            const selected = opt.value === value;
            const active = i === activeIndex;
            return (
              <li key={opt.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors " +
                    (active ? "bg-white/[0.06] text-white" : "text-ink-300")
                  }
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="truncate">{opt.label}</span>
                    {opt.hint && (
                      <span className="shrink-0 text-xs text-ink-500">{opt.hint}</span>
                    )}
                  </span>
                  {selected ? (
                    <Check className="h-4 w-4 shrink-0 text-brand-400" />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
