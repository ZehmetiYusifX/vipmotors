export { formatAzDate as formatDate } from "@/lib/date";

export function formatKm(value: number) {
  return new Intl.NumberFormat("az-AZ").format(value) + " km";
}
