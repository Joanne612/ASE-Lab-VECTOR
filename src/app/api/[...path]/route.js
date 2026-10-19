import { NextResponse } from "next/server";
import { backendFetch, refreshTokens } from "@/lib/server/backend";
import { clearSession, getSession, setSession } from "@/lib/server/session";

/*
 * BFF: browser memanggil /api/<resource>, lalu request diteruskan ke BE dengan
 * token dari cookie httpOnly. Auth (login/register/logout) lewat Server Action,
 * dan endpoint admin sengaja tidak dibuka.
 */
const ALLOWED_RESOURCES = new Set([
  "users",
  "transactions",
  "categories",
  "savings",
  "goals",
  "income-ideas",
]);

// Sama dengan batas express.json() di BE: body yang lebih besar pasti ditolak
// BE, jadi tidak perlu ditampung seluruhnya di memori server Next.
const MAX_BODY_BYTES = 100 * 1024;

// Respons berisi data keuangan pribadi: jangan disimpan cache browser atau proxy.
const NO_STORE = { "Cache-Control": "private, no-store" };

const jsonError = (status, message) => NextResponse.json({ message }, { status, headers: NO_STORE });

/** Body sebagai teks, atau null kalau melebihi MAX_BODY_BYTES. */
async function readBody(request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return null;
  if (!request.body) return "";

  // Content-Length bisa tidak ada (chunked), jadi ukurannya tetap dihitung saat dibaca.
  const chunks = [];
  let size = 0;
  for await (const chunk of request.body) {
    size += chunk.byteLength;
    if (size > MAX_BODY_BYTES) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// Cookie SameSite=Lax sudah menahan POST lintas situs; cek Origin sebagai lapis kedua.
function isCrossOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    // Origin "null" (iframe sandbox, file://) tidak pernah berasal dari aplikasi ini.
    return true;
  }
}

async function toNextResponse(response) {
  const text = await response.text();
  return new NextResponse(text || null, {
    status: response.status,
    headers: {
      ...NO_STORE,
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

async function expireSession() {
  await clearSession();
  return jsonError(401, "Sesi berakhir, silakan masuk kembali.");
}

async function handler(request, { params }) {
  const { path } = await params;

  if (!ALLOWED_RESOURCES.has(path[0])) return jsonError(404, "Endpoint tidak ditemukan.");
  if (request.method !== "GET" && isCrossOrigin(request)) return jsonError(403, "Forbidden");

  let { accessToken, refreshToken } = await getSession();
  if (!refreshToken) return jsonError(401, "Silakan masuk terlebih dahulu.");

  const target = `/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  let body;
  if (request.method !== "GET") {
    const text = await readBody(request);
    if (text === null) return jsonError(413, "Data yang dikirim terlalu besar.");
    body = text || undefined;
  }
  const send = () => backendFetch(target, { method: request.method, body, accessToken });

  const renew = async () => {
    const tokens = await refreshTokens(refreshToken);
    if (!tokens) return false;
    await setSession(tokens);
    ({ accessToken, refreshToken } = tokens);
    return true;
  };

  try {
    if (!accessToken && !(await renew())) return expireSession();

    let response = await send();
    if (response.status === 401) {
      if (!(await renew())) return expireSession();
      response = await send();
      // Token baru pun ditolak (mis. akun dinonaktifkan): sesi tidak bisa dipulihkan.
      if (response.status === 401) return expireSession();
    }

    return toNextResponse(response);
  } catch (error) {
    console.error("BFF gagal menghubungi BE:", error);
    return jsonError(502, "Tidak dapat menghubungi server. Coba lagi nanti.");
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
