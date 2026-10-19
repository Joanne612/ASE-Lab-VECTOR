import "server-only";
import { headers } from "next/headers";

const FORWARDED_HEADERS = ["x-forwarded-for", "x-request-id"];

function backendUrl(path) {
  const baseUrl = process.env.ASE_BACKEND_URL;
  if (!baseUrl) {
    throw new Error("ASE_BACKEND_URL belum diatur di environment.");
  }
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

/** Request ke BE. `body` berupa string JSON yang sudah jadi. */
export async function backendFetch(path, { method = "GET", body, accessToken } = {}) {
  const incoming = await headers();
  const requestHeaders = {};

  // Diteruskan agar log dan rate limiter BE melihat klien asli, bukan server Next.
  for (const name of FORWARDED_HEADERS) {
    const value = incoming.get(name);
    if (value) requestHeaders[name] = value;
  }
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`;

  return fetch(backendUrl(path), {
    method,
    headers: requestHeaders,
    body,
    cache: "no-store",
  });
}

/*
 * BE merotasi refresh token dan mencabut SEMUA sesi user kalau refresh token
 * lama dipakai ulang. Halaman memanggil beberapa endpoint sekaligus, jadi tanpa
 * penahan ini refresh paralel akan langsung me-logout user.
 *
 * Hasil refresh disimpan sebentar per refresh token: request yang datang
 * bersamaan, atau sesaat setelahnya dengan cookie lama, memakai hasil yang sama.
 * Map ini hanya berlaku per proses; deployment multi-instance butuh store bersama.
 */
const REFRESH_REUSE_MS = 30_000;
const refreshes = new Map();

async function requestRefresh(refreshToken) {
  const response = await backendFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (response.status === 400 || response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`Refresh token gagal dengan status ${response.status}`);
  }

  const data = await response.json();
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

/**
 * Menukar refresh token dengan pasangan token baru.
 * Mengembalikan null kalau sesi tidak sah lagi; melempar error kalau BE tidak
 * dapat dihubungi, supaya user tidak ikut ter-logout karena gangguan sementara.
 */
export function refreshTokens(refreshToken) {
  const now = Date.now();
  for (const [token, entry] of refreshes) {
    if (entry.expiresAt <= now) refreshes.delete(token);
  }

  const existing = refreshes.get(refreshToken);
  if (existing) return existing.promise;

  const promise = requestRefresh(refreshToken);
  refreshes.set(refreshToken, { promise, expiresAt: now + REFRESH_REUSE_MS });
  // Kegagalan jaringan tidak disimpan, supaya request berikutnya bisa mencoba lagi.
  promise.catch(() => {
    if (refreshes.get(refreshToken)?.promise === promise) refreshes.delete(refreshToken);
  });

  return promise;
}
