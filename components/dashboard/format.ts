export function formatKm(value: number) {
  return new Intl.NumberFormat("az-AZ").format(value) + " km";
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("az-AZ", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}
