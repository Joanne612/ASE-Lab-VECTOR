import { NextResponse } from "next/server";
import { REFRESH_COOKIE } from "@/lib/session-cookies";

const PROTECTED_PREFIXES = ["/homepage", "/statistik", "/target", "/ide", "/transaksi"];
const GUEST_ONLY_PATHS = ["/", "/register"];

/*
 * Cek optimistis: hanya melihat apakah cookie sesi ada. Keabsahan token
 * diperiksa BE; kalau ditolak, BFF menghapus cookie dan client diarahkan ke "/".
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
  if (GUEST_ONLY_PATHS.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/homepage", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  // Lewati BFF, aset Next, dan file statis (path yang berekstensi).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
