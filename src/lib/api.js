/*
 * Client API. Semua request lewat BFF Next (/api/...), jadi tidak ada token di
 * browser: cookie httpOnly terkirim otomatis karena satu origin.
 */
export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // Bentuk dari BE: { field: ["pesan", ...] }
    this.fieldErrors = fieldErrors;
  }
}

export async function apiFetch(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || `Error ${response.status}`,
      data?.errors ?? {},
    );
  }

  return data;
}

/** Fetcher default SWR: key berupa path, mis. "/users/me". */
export const fetcher = (path) => apiFetch(path);
