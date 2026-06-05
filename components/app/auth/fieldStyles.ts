// Single source of truth for auth field styling, shared by AuthField,
// PasswordField, and the OTP input so the whole auth set stays consistent.

export const labelClass =
  "block text-xs uppercase tracking-[0.14em] text-ink-400 mb-2";

export const fieldClass =
  "w-full rounded-xl border-hairline bg-ink-900/60 px-4 py-3 text-white placeholder:text-ink-500 outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/15 focus:bg-ink-900 transition-[border-color,background-color,box-shadow] duration-200";

// Applied on top of fieldClass when a field is in an error state.
export const fieldErrorClass =
  "border-brand-500/60 focus:border-brand-500/60 focus:ring-brand-500/20";
