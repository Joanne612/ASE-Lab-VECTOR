"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

// Format angka
const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const persen = (n) => `${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
const bayanganTeks = { textShadow: "0 2px 4px rgba(120,100,160,0.2)" };

function BackLink() {
  return (
    <Link
      href="/saham"
      aria-label="Kembali"
      className="relative z-20 flex h-8 w-8 shrink-0 items-center justify-center text-[#6A6E79] transition hover:opacity-80 active:scale-95"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18 9 12l6-6"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

function IkonJam() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-32 w-32 text-[#8A8D99] drop-shadow-[0_2px_4px_rgba(120,100,160,0.2)]"
      aria-hidden="true"
    >
      {/* Panah melingkar (searah jarum jam) */}
      <g transform="translate(24 0) scale(-1 1)">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </g>
      {/* Jarum jam */}
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function InvestasiBerjalanContent() {
  const { code } = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  // Mock data (nantinya ambil dari params / API)
  const saldoAwal = 500000;
  const investasi = 500000;
  const kodeSaham = code ?? "NUSA";

  // Mock simulasi kenaikan nilai per periode (%)
  const periode = [
    { label: "1 Hari", persen: 0 },
    { label: "1 Bulan", persen: 2.5 },
    { label: "6 Bulan", persen: 8 },
    { label: "1 Tahun", persen: 15 },
  ];

  const [aktif, setAktif] = useState(0);
  const persenAktif = periode[aktif].persen;
  const nilaiSekarang = investasi * (1 + persenAktif / 100);

  return (
    <main className="relative flex min-h-screen flex-col px-[13px] pb-10 pt-[20px]">
      <header className="mb-2 pl-2">
        <BackLink />
      </header>

      <div className="relative flex flex-1 flex-col rounded-[32px] border border-white/70 bg-white/30 px-6 pb-8 pt-6 shadow-[0_8px_24px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl">
        {/* Judul */}
        <h1
          className="text-[18px] font-semibold leading-snug text-[#8A8D99]"
          style={bayanganTeks}
        >
          Investasi mu sedang berjalan
        </h1>

        {/* Ikon jam */}
        <div className="mt-8 flex justify-center">
          <IkonJam />
        </div>

        {/* Saldo awal & Investasi */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/60 bg-white/40 px-3.5 py-2.5 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
            <p className="text-[12px] font-semibold text-[#9B7FD6]">Saldo awal</p>
            <p
              className="mt-0.5 text-center text-[16px] font-bold text-[#8A8D99]"
              style={bayanganTeks}
            >
              {rupiah(saldoAwal)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/40 px-3.5 py-2.5 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
            <p className="text-[12px] font-semibold text-[#9B7FD6]">Investasi</p>
            <p
              className="mt-0.5 text-center text-[16px] font-bold text-[#8A8D99]"
              style={bayanganTeks}
            >
              {rupiah(investasi)}
            </p>
          </div>
        </div>

        {/* Garis waktu periode */}
        <div className="relative mt-5">
          {/* Garis penghubung (dari titik pertama sampai terakhir) */}
          <div className="absolute left-[12.5%] right-[12.5%] top-3 h-px -translate-y-1/2 bg-[#A1A4B0]" />

          <div className="relative grid grid-cols-4">
            {periode.map((p, i) => {
              const dipilih = i === aktif;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAktif(i)}
                  className="flex flex-col items-center gap-2 transition active:scale-95"
                >
                  <span className="flex h-6 items-center justify-center">
                    <span
                      className={`block rounded-full transition-all duration-200 ${
                        dipilih
                          ? "h-5 w-5 bg-[#9B7FD6] shadow-[0_2px_6px_rgba(140,107,212,0.5)]"
                          : "h-3 w-3 bg-[#8A8D99]"
                      }`}
                    />
                  </span>
                  <span
                    className="whitespace-nowrap text-[13px] font-medium text-[#8A8D99]"
                    style={bayanganTeks}
                  >
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nilai investasi saat ini */}
        <div className="mt-6 flex min-h-[125px] flex-col justify-between rounded-2xl border border-white/60 bg-white/40 p-3.5 shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md">
          <div>
            <p className="text-[14px] font-semibold text-[#9B7FD6]">
              Nilai investasi saat ini
            </p>
            <p
              className="mt-0.5 pl-1 text-[20px] font-bold text-[#757885]"
              style={bayanganTeks}
            >
              {rupiah(nilaiSekarang)}
            </p>
          </div>

          <div className="flex justify-end">
            <span className="rounded-lg bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] px-5 py-1 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(120,100,160,0.3),inset_0_1px_2px_rgba(255,255,255,0.4)]">
              {persen(persenAktif)}
            </span>
          </div>
        </div>

        {/* Tombol aksi */}
        <div className="mt-8 flex justify-center">
          <Link
            href={`/saham/detail/${encodeURIComponent(kodeSaham)}/investasi/selesai${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ""}`}
            className="rounded-xl bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] px-8 py-2.5 text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95"
          >
            Lanjutkan
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function InvestasiBerjalanPage() {
  return (
    <Suspense fallback={null}>
      <InvestasiBerjalanContent />
    </Suspense>
  );
}