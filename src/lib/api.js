const BASE_URL = process.env.NEXT_PUBLIC_ASE_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";

export async function api(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BASE_URL.replace(/\/$/, "")}${normalizedPath}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data = null;
  const text = await response.text();

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
      `Error ${response.status}`;
    throw new Error(message);
  }

  return data;
}