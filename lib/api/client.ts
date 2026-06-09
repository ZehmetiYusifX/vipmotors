import { ApiError, type Role } from "./types";
import { clearTokens, getTokens } from "./tokens";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.vipmotors.az";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  role?: Role;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
  formData?: FormData;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${API_BASE_URL}${path}`
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, role, query, signal, formData } = options;

  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (body !== undefined && !formData) {
    headers["Content-Type"] = "application/json";
  }

  if (role) {
    const tokens = getTokens(role);
    if (tokens?.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
  }

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: requestBody,
      signal,
      mode: "cors",
      cache: "no-store"
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Şəbəkə xətası baş verdi.",
      0,
      null
    );
  }

  if (response.status === 401 && role) {
    clearTokens(role);
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const message =
      (typeof parsed === "object" &&
        parsed !== null &&
        "message" in parsed &&
        typeof (parsed as { message: unknown }).message === "string" &&
        (parsed as { message: string }).message) ||
      `İstək ${response.status} statusu ilə uğursuz oldu.`;
    throw new ApiError(message, response.status, parsed);
  }

  return parsed as T;
}
