"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { instrumentHistoryPath, instrumentPath, unwrapSimulationData } from "@/lib/simulation";

// Format angka
const bayanganTeks = { textShadow: "0 2px 4px rgba(120,100,160,0.2)" };

function BackLink() {
  return (
    <Link
      href="/reksadana"
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

export default function DetailReksaDanaPage() {
  const [tab, setTab] = useState("Bulan");
  const range = { Minggu: "WEEK", Bulan: "MONTH", Tahun: "YEAR" }[tab];
  const { data: detailResponse, error, isLoading } = useSWR(instrumentPath("RDPU"));
  const { data: historyResponse, error: historyError } = useSWR(
    instrumentHistoryPath("RDPU", range),
  );
  const produk = unwrapSimulationData(detailResponse);
  const history = unwrapSimulationData(historyResponse);
  const points = Array.isArray(history) ? history : Array.isArray(history?.data) ? history.data : [];
  const prices = points.map((point) => Number(point.price)).filter(Number.isFinite);
  const minimumPrice = prices.length ? Math.min(...prices) : 0;
  const maximumPrice = prices.length ? Math.max(...prices) : 0;
  const priceRange = maximumPrice - minimumPrice || 1;
  const path = points
    .map((point, index) => {
      const x = points.length > 1 ? (index / (points.length - 1)) * 100 : 50;
      const y = 95 - ((Number(point.price) - minimumPrice) / priceRange) * 90;
      return `${index === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
  const labelY = Array.from({ length: 5 }, (_, index) =>
    `Rp${Math.round(maximumPrice - ((maximumPrice - minimumPrice) * index) / 4).toLocaleString("id-ID")}`,
  );
  const labelX = [points[0]?.date, points.at(-1)?.date].filter(Boolean);
  const hrefInvestasi = `/reksadana/detail/${encodeURIComponent(produk?.code ?? "RDPU")}/investasi`;

  if (isLoading) {
    return <main className="px-6 py-12 text-center text-[#8A8D99]">Memuat reksa dana...</main>;
  }
  if (error || !produk) {
    return <main role="alert" className="px-6 py-12 text-center text-[#B94A48]">{error?.message ?? "Produk tidak ditemukan."}</main>;
  }

  const info = [
    { label: "Risiko", value: produk.riskLevel === "LOW" ? "Rendah" : produk.riskLevel },
    { label: "Jangka Waktu", value: produk.horizonText ?? "-" },
    { label: "Mulai dari", value: `Rp${Number(produk.minInvestment).toLocaleString("id-ID")}` },
  ];

  return (
    <main className="relative flex min-h-screen flex-col px-[13px] pb-10 pt-[20px]">
      <header className="mb-2 pl-2">
        <BackLink />
      </header>

      <div className="relative flex flex-1 flex-col rounded-[32px] border border-white/70 bg-white/30 px-6 pb-7 pt-6 shadow-[0_8px_24px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl">
        {/* Judul & deskripsi */}
        <h1
          className="text-[20px] font-semibold leading-snug text-[#8A8D99]"
          style={bayanganTeks}
        >
          {produk.name}
        </h1>
        <p
          className="mt-4 text-[15px] font-medium leading-relaxed text-[#8A8D99]"
          style={bayanganTeks}
        >
          {produk.description}
        </p>

        {/* Info singkat (sedikit lebih lebar dari padding kartu) */}
        <div className="-mx-1 mt-5 flex justify-between gap-3">
          {info.map((i) => (
            <div
              key={i.label}
              className="flex-1 rounded-2xl border border-white/60 bg-white/40 px-2 py-2.5 text-center shadow-[0_4px_12px_rgba(120,100,160,0.1)] backdrop-blur-md first:flex-none last:flex-none first:px-4 last:px-4"
            >
              <p className="whitespace-nowrap text-[12px] font-semibold text-[#9B7FD6]">
                {i.label}
              </p>
              <p className="mt-0.5 whitespace-nowrap text-[15px] font-bold text-[#8B61D4]">
                {i.value}
              </p>
            </div>
          ))}
        </div>

        {/* Grafik perkembangan simulasi */}
        <h2
          className="mt-7 text-[15px] font-bold text-[#8A8D99]"
          style={bayanganTeks}
        >
          Perkembangan Simulasi
        </h2>

        <div className="mt-3 flex rounded-2xl bg-white/40 p-1">
          {["Minggu", "Bulan", "Tahun"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`flex-1 rounded-xl py-2 text-[13px] font-medium ${tab === item ? "bg-white text-[#8A8D99] shadow-sm" : "text-[#A1A4B0]"}`}
            >
              {item}
            </button>
          ))}
        </div>
        {historyError ? <p role="alert" className="mt-2 text-[12px] text-[#B94A48]">{historyError.message}</p> : null}

        <div className="mt-3">
          <div className="flex h-[132px]">
            {/* Label sumbu Y */}
            <div className="flex w-[82px] shrink-0 translate-y-1.5 flex-col justify-between text-[14px] font-medium leading-none text-[#8A8D99]">
              {labelY.map((l, index) => (
                <span key={`${l}-${index}`} style={bayanganTeks}>
                  {l}
                </span>
              ))}
            </div>

            {/* Area grafik */}
            <div className="relative flex-1 border-l border-[#8A8D99]/70">
              <div className="absolute inset-0 flex flex-col justify-between">
                {labelY.map((l, index) => (
                  <div key={`${l}-${index}`} className="h-px bg-[#8A8D99]/70" />
                ))}
              </div>

              <svg
                className="absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={path}
                  fill="none"
                  stroke="#9B7FD6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>

          {/* Label sumbu X */}
          <div className="ml-[82px] mt-3 flex justify-between pl-2 pr-9 text-[13px] font-medium text-[#8A8D99]">
            {labelX.map((l) => (
              <span key={l} style={bayanganTeks}>
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Penjelasan */}
        <p
          className="mt-8 text-[15px] font-medium leading-relaxed text-[#8A8D99]"
          style={bayanganTeks}
        >
          {produk.note ?? produk.description}
        </p>

        {/* Tombol aksi (menempel di bagian bawah kartu) */}
        <div className="mt-auto flex justify-center pt-8">
          <Link
            href={hrefInvestasi}
            className="w-44 rounded-xl bg-gradient-to-b from-[#A98BE0] to-[#8C6BD4] py-2.5 text-center text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95"
          >
            Investasi Sekarang
          </Link>
        </div>
      </div>
    </main>
  );
}