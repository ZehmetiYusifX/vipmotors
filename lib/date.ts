// Azerbaijani date formatting that does NOT depend on the runtime's ICU locale
// data. Some Node builds (notably node:20-alpine in production) ship without the
// "az" month names, so Intl.DateTimeFormat("az-AZ", { month: "long" }) renders
// the ICU fallback like "2026 M06 04" instead of "04 iyun 2026". Formatting the
// parts manually guarantees the same output everywhere.

const AZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr"
];

const AZ_MONTHS_SHORT = [
  "yan",
  "fev",
  "mar",
  "apr",
  "may",
  "iyn",
  "iyl",
  "avq",
  "sen",
  "okt",
  "noy",
  "dek"
];

const pad = (n: number) => String(n).padStart(2, "0");

/** "04 iyun 2026" — robust against a runtime missing the az ICU locale. */
export function formatAzDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${pad(date.getDate())} ${AZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "04 iyn 12:30" — short date + time, robust against missing az ICU data. */
export function formatAzDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${pad(date.getDate())} ${AZ_MONTHS_SHORT[date.getMonth()]} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
