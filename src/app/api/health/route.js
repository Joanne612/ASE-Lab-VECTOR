import { NextResponse } from "next/server";
import { wakeBackend } from "@/lib/server/backend";

/*
 * Dipanggil instrumentation-client.js begitu halaman dimuat, supaya BE sudah
 * bangun dari cold start sebelum user menekan tombol masuk. Respons ditahan
 * sampai BE membalas agar request-nya tidak terputus di tengah jalan.
 */
export async function GET() {
  const ok = await wakeBackend();
  return new NextResponse(null, {
    status: ok ? 204 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
