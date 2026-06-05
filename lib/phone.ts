// Azerbaijani phone handling. The UI shows a fixed +994 prefix and the user
// types only the local part (e.g. 123456789); the backend always receives the
// full E.164 form (e.g. +994123456789).

export const AZ_DIAL_CODE = "+994";

// AZ numbers are +994 followed by 9 local digits (2-digit operator + 7 digits).
const LOCAL_LENGTH = 9;

/**
 * Keep only the local digits a user typed. Tolerates pasted full numbers that
 * already include the 994 country code (or +994 / spaces / dashes).
 */
export function normalizeLocalPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  // Drop a pasted country code, but don't strip a legit 9-digit "99x" number.
  if (digits.length > LOCAL_LENGTH && digits.startsWith("994")) {
    digits = digits.slice(3);
  }
  return digits.slice(0, LOCAL_LENGTH);
}

/** Build the full +994XXXXXXXXX value sent to the backend. */
export function toFullPhone(local: string): string {
  return `${AZ_DIAL_CODE}${normalizeLocalPhone(local)}`;
}

/**
 * Display-only grouping for the local part: 2-digit operator code, a space,
 * then the rest — e.g. "123456789" -> "12 3456789". Submitted value stays
 * digits-only via normalizeLocalPhone.
 */
export function formatLocalPhone(local: string): string {
  const digits = normalizeLocalPhone(local);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} ${digits.slice(2)}`;
}
