"use client";

import Link from "next/link";

const SAHAM = [
  { code: "NUSA", name: "PT Nusantara Abadi Tbk", price: 2500, change: 4.2, risiko: "Tinggi" },
  { code: "Karya", name: "PT Karya Maju Tbk", price: 1850, change: 1.8, risiko: "Sedang" },
  { code: "Tekno", name: "PT Tekonologi Global Tbk", price: 3200, change: 2.4, risiko: "Tinggi" },
];

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
          {persen(s.change)} hari ini
        </span>

        <div className="flex flex-col items-end gap-[6px]">
          <span className="pt-[2px] text-[11px] font-semibold text-[#9B7FD6]" style={bayanganTeks}>
            Risiko {s.risiko}
          </span>
          <Link
            href={`/simulasi/saham/detail/${s.code}`}
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
  return (
    <main className="min-h-screen px-[13px] pb-8 pt-[20px]">
      <header className="relative z-10 mb-[14px] flex items-center gap-[10px] pl-[6px]">
        <BackLink />
        <h1 className="text-[22px] font-semibold text-[#8A8D99]" style={bayanganTeks}>
          Pilih Saham
        </h1>
      </header>

      {/* Daftar saham */}
      <ul className="flex flex-col gap-[10px]">
        {SAHAM.map((s) => (
          <li key={s.code}>
            <KartuSaham s={s} />
          </li>
        ))}
      </ul>
    </main>
  );
}