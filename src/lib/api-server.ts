import { getToken } from "@/lib/auth/session";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:4000";

export class ServerApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function serverApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const { headers, ...rest } = options;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...rest,
    headers: {
      ...(rest.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? "Something went wrong");
    throw new ServerApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
