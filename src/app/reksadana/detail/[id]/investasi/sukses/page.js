"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const bayanganTeks = { textShadow: "0 2px 4px rgba(120,100,160,0.2)" };

function SuksesContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const nominalParam = Number(searchParams.get("nominal"));
  const nominal = Number.isFinite(nominalParam) && nominalParam > 0 ? nominalParam : 0;

  return (
    <main className="relative flex min-h-screen flex-col px-[13px] pb-10 pt-[20px]">
      <div className="relative flex flex-1 flex-col items-center justify-center rounded-[32px] border border-white/70 bg-white/30 px-6 pb-8 pt-6 text-center shadow-[0_8px_24px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#9B7FD6]/15 text-[#9B7FD6]">
          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m5 12 4 4L19 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-5 text-[22px] font-bold text-[#9B7FD6]" style={bayanganTeks}>
          Investasi Berhasil!
        </h1>
        <p className="mt-2 text-[14px] font-medium text-[#8A8D99]" style={bayanganTeks}>
          Simulasi investasi reksa dana kamu berhasil dikonfirmasi.
        </p>

        <div className="mt-6 w-full rounded-2xl border border-white/60 bg-white/40 p-4 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <p className="text-[13px] font-medium text-[#A1A4B0]" style={bayanganTeks}>
            Jumlah investasi
          </p>
          <p className="mt-1 text-[24px] font-bold text-[#8A8D99]" style={bayanganTeks}>
            {rupiah(nominal)}
          </p>
        </div>

        <p className="mt-5 text-[13px] font-medium text-[#8A8D99]" style={bayanganTeks}>
          Ini adalah transaksi virtual untuk simulasi pembelajaran.
        </p>

        <Link
          href={`/reksadana/detail/${encodeURIComponent(id)}/investasi/selesai?nominal=${nominal}`}
          className="mt-auto w-44 rounded-xl bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] py-2.5 text-center text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95"
        >
          Lihat Hasil Simulasi
        </Link>
      </div>
    </main>
  );
}

export default function InvestasiSuksesPage() {
  return (
    <Suspense fallback={null}>
      <SuksesContent />
    </Suspense>
  );
}
