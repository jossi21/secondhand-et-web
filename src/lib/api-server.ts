import { getToken } from "@/lib/auth/session";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:4000";

export async function serverApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const { headers, ...rest } = options;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      Array.isArray(body.message) ? body.message.join(", ") : body.message,
    );
  }

  return response.json() as Promise<T>;
}
