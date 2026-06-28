"use client";

import { forwardRef, useEffect, useState } from "react";

type NumberInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value: number | string | null | undefined;
  /** Called with the parsed number, or null when the field is empty. */
  onValueChange: (value: number | null) => void;
  /** Allow a single decimal point (e.g. prices). Defaults to integers only. */
  decimal?: boolean;
};

/**
 * Text input that behaves like a number field but:
 *  - has no spinner (+/-) arrows,
 *  - shows nothing instead of a leading "0",
 *  - only lets the user type digits (and one "." when `decimal`).
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput({ value, onValueChange, decimal = false, inputMode, ...rest }, ref) {
    const external =
      value === null || value === undefined || value === "" || value === 0
        ? ""
        : String(value);

    const [text, setText] = useState(external);

    // Resync local text when the value is changed from the outside
    // (e.g. opening the modal on a different record), but not while the
    // user is mid-edit on an equivalent number ("12." vs 12).
    useEffect(() => {
      if (Number(text || "0") !== Number(external || "0")) {
        setText(external);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [external]);

    const clean = (raw: string) => {
      if (decimal) {
        return raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
      }
      return raw.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    };

    return (
      <input
        {...rest}
        ref={ref}
        type="text"
        inputMode={inputMode ?? (decimal ? "decimal" : "numeric")}
        value={text}
        onChange={(e) => {
          const next = clean(e.target.value);
          setText(next);
          onValueChange(next === "" ? null : Number(next));
        }}
      />
    );
  }
);
