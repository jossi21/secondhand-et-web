export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { headers, ...rest } = options;

  const response = await fetch(`/api${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(rest.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? "Something went wrong");
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function resolveImageUrl(url: string): string {
  if (url.startsWith("http")) return url;
  const backendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:4000";
  return `${backendOrigin}${url}`;
}
