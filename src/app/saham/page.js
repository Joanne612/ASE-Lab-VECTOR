"use client";

import Link from "next/link";
import useSWR from "swr";
import { instrumentListPath, simulationInstruments, formatRisk } from "@/lib/simulation";

// Format angka
const rupiah = (n) => `Rp${Math.round(n).toLocaleString("id-ID")}`;
const persen = (n) => `${n >= 0 ? "+" : "-"} ${Math.abs(n).toFixed(1).replace(".", ",")}%`;
const bayanganTeks = { textShadow: "0 3px 6px rgba(120,100,160,0.25)" };

function BackLink() {
  return (
    <Link
      href="/simulasi"
      aria-label="Kembali"
      className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center text-[#6A6E79] cursor-pointer hover:opacity-80 transition"
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

function KartuSaham({ s }) {
  return (
    <article className="relative rounded-[28px] border border-white/70 bg-white/25 px-[34px] pb-[14px] pt-[18px] shadow-[0_6px_18px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.6)] backdrop-blur-xl">
      <h2 className="text-[20px] font-semibold leading-[28px] text-[#8A8D99]" style={bayanganTeks}>
        {s.code}
      </h2>
      <p className="text-[14px] leading-[20px] text-[#8A8D99]" style={bayanganTeks}>
        {s.name}
      </p>
      <p className="mt-[2px] text-[20px] font-bold leading-[28px] text-[#8A8D99]" style={bayanganTeks}>
        {rupiah(s.price)}
      </p>

      <div className="mt-[18px] flex items-start justify-between">
        <span
          className="pt-[2px] text-[11px] font-semibold tabular-nums text-[#9B7FD6]"
          style={bayanganTeks}
        >
          {persen(s.changePct)} hari ini
        </span>

        <div className="flex flex-col items-end gap-[6px]">
          <span className="pt-[2px] text-[11px] font-semibold text-[#9B7FD6]" style={bayanganTeks}>
            Risiko {formatRisk(s.riskLevel)}
          </span>
          <Link
            href={`/saham/detail/${encodeURIComponent(s.code)}`}
            className="rounded-[8px] bg-gradient-to-b from-[#A98BE0] to-[#9272D0] px-[21px] py-[6px] text-[12px] font-semibold text-white shadow-[0_4px_8px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function PilihSahamPage() {
  const { data, error, isLoading } = useSWR(instrumentListPath("STOCK"));
  const saham = simulationInstruments(data);

  return (
    <main className="min-h-screen px-[13px] pb-8 pt-[20px]">
      <header className="relative z-10 mb-[14px] flex items-center gap-[10px] pl-[6px]">
        <BackLink />
        <h1 className="text-[22px] font-semibold text-[#8A8D99]" style={bayanganTeks}>
          Pilih Saham
        </h1>
      </header>

      {isLoading ? <p className="px-4 py-8 text-center text-[#8A8D99]">Memuat saham...</p> : null}
      {error ? <p role="alert" className="px-4 py-8 text-center text-[#B94A48]">{error.message}</p> : null}
      {!isLoading && !error && saham.length === 0 ? (
        <p className="px-4 py-8 text-center text-[#8A8D99]">Belum ada saham simulasi.</p>
      ) : null}
      {saham.length > 0 ? (
        <ul className="flex flex-col gap-[10px]">
          {saham.map((s) => (
            <li key={s.code}>
              <KartuSaham s={s} />
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}