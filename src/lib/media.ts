const FALLBACK_API_ORIGIN = "http://localhost:4000";

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || FALLBACK_API_ORIGIN;

export function resolveMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}
