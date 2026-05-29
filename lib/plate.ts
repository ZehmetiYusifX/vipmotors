export function normalizePlate(input: string): string {
  return input.replace(/[-\s]/g, "").toUpperCase();
}
