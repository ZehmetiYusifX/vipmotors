import { API_BASE_URL } from "@/lib/api/client";

/**
 * Resolve a possibly-relative backend image path (e.g. "/uploads/.../x.png")
 * to an absolute URL against the API origin. Absolute/data/blob URLs pass through.
 */
export function resolveImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
