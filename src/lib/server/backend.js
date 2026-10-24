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

/*
 * IP klien asli. x-real-ip diisi platform (Vercel); kalau tidak ada, entri
 * terakhir x-forwarded-for adalah yang ditambahkan proxy tepercaya, bukan yang
 * bisa dikarang user.
 */
function clientIp(incoming) {
  const realIp = incoming.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return incoming.get("x-forwarded-for")?.split(",").at(-1)?.trim() || undefined;
}

/** Request ke BE. `body` berupa string JSON yang sudah jadi. */
export async function backendFetch(path, { method = "GET", body, accessToken } = {}) {
  const incoming = await headers();
  const requestHeaders = {};

  // Diteruskan untuk log BE.
  for (const name of FORWARDED_HEADERS) {
    const value = incoming.get(name);
    if (value) requestHeaders[name] = value;
  }

  // Semua request ke BE datang dari IP server ini. Tanpa IP klien + secret
  // bersama, rate limiter BE menghitung seluruh user sebagai satu IP.
  const sharedSecret = process.env.BFF_SHARED_SECRET;
  const ip = clientIp(incoming);
  if (sharedSecret && ip) {
    requestHeaders["x-client-ip"] = ip;
    requestHeaders["x-bff-key"] = sharedSecret;
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

// Cold start BE (scale-to-zero di Azure) bisa lebih dari 30 detik.
const WAKE_UP_TIMEOUT_MS = 90_000;

/**
 * Membangunkan BE dari scale-to-zero. /health ada di root BE, bukan di bawah
 * prefix API milik ASE_BACKEND_URL, dan tidak kena rate limiter maupun database.
 * Mengembalikan false kalau BE tidak dapat dihubungi; tidak pernah melempar.
 */
export async function wakeBackend() {
  const baseUrl = process.env.ASE_BACKEND_URL;
  if (!baseUrl) return false;

  try {
    const response = await fetch(new URL("/health", baseUrl), {
      cache: "no-store",
      signal: AbortSignal.timeout(WAKE_UP_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
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
