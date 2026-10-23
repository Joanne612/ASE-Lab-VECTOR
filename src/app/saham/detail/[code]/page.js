"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  formatRisk,
  instrumentHistoryPath,
  instrumentPath,
  unwrapSimulationData,
} from "@/lib/simulation";

// Format angka
const rupiah = (n) => `Rp${Math.round(n).toLocaleString("id-ID")}`;
const persen = (n) => `${n >= 0 ? "+" : "-"} ${Math.abs(n).toFixed(1).replace(".", ",")}%`;
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

export default function DetailSahamPage() {
  const { code } = useParams();
  const [tab, setTab] = useState("Bulan");
  const range = { Minggu: "WEEK", Bulan: "MONTH", Tahun: "YEAR" }[tab];
  const { data: detailResponse, error: detailError, isLoading: detailLoading } = useSWR(
    code ? instrumentPath(code) : null,
  );
  const { data: historyResponse, error: historyError } = useSWR(
    code ? instrumentHistoryPath(code, range) : null,
  );
  const dataSaham = unwrapSimulationData(detailResponse);
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

  if (detailLoading) {
    return <main className="px-6 py-12 text-center text-[#8A8D99]">Memuat detail saham...</main>;
  }
  if (detailError || !dataSaham) {
    return <main role="alert" className="px-6 py-12 text-center text-[#B94A48]">{detailError?.message ?? "Saham tidak ditemukan."}</main>;
  }

  return (
    <main className="relative min-h-screen px-[13px] pb-8 pt-[20px]">
      <header className="mb-2 pl-2">
        <BackLink />
      </header>

      <div className="relative rounded-[32px] border border-white/70 bg-white/30 p-6 shadow-[0_8px_24px_rgba(120,100,160,0.12),inset_0_1px_3px_rgba(255,255,255,0.7)] backdrop-blur-xl">
        
        <section>
          <h1 className="text-[22px] font-bold text-[#8A8D99]" style={bayanganTeks}>
            {dataSaham.code}
          </h1>
          <p className="mt-[2px] text-[14px] font-medium text-[#8A8D99]" style={bayanganTeks}>
            {dataSaham.name}
          </p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[26px] font-extrabold text-[#757885]" style={bayanganTeks}>
              {rupiah(dataSaham.price)}
            </span>
            <span className="text-[14px] font-semibold text-[#8A8D99]" style={bayanganTeks}>
              /lembar
            </span>
          </div>
          <p className="mt-1 text-[12px] font-semibold text-[#9B7FD6]" style={bayanganTeks}>
            {persen(dataSaham.changePct)} hari ini
          </p>
        </section>

        {/* Filter Tab (Bulan / Minggu / Tahun) */}
        <div className="mt-6 flex rounded-2xl bg-white/40 p-1 backdrop-blur-md">
          {["Bulan", "Minggu", "Tahun"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-2 text-[14px] font-medium transition ${
                tab === t
                  ? "bg-white text-[#8A8D99] shadow-sm"
                  : "text-[#A1A4B0] hover:text-[#8A8D99]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grafik Pergerakan Harga */}
        <div className="mt-6 rounded-2xl bg-white/20 p-4 border border-white/50">
          <div className="flex h-44 w-full">
            {/* Label Sumbu Y */}
            <div className="flex flex-col justify-between text-[11px] font-medium text-[#8A8D99] pr-2">
              <span>{rupiah(maximumPrice || Number(dataSaham.price))}</span>
              <span>{rupiah(minimumPrice || Number(dataSaham.price))}</span>
            </div>

            {/* Area Grafik SVG */}
            <div className="relative flex-1">
              <div className="absolute inset-0 flex flex-col justify-between opacity-30">
                <div className="border-b border-[#8A8D99]" />
                <div className="border-b border-[#8A8D99]" />
                <div className="border-b border-[#8A8D99]" />
                <div className="border-b border-[#8A8D99]" />
                <div className="border-b border-[#8A8D99]" />
              </div>

              <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d={path} fill="none" stroke="#9B7FD6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="mt-3 flex justify-around pl-10 text-[11px] font-medium text-[#8A8D99]">
            <span>{points[0]?.date ?? "-"}</span>
            <span>{points.at(-1)?.date ?? "-"}</span>
          </div>
        </div>
        {historyError ? <p role="alert" className="mt-2 text-[12px] text-[#B94A48]">{historyError.message}</p> : null}

        {/* Info Risiko & Potensi Keuntungan */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/60 bg-white/30 p-3.5 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-[#A1A4B0]">Risiko</span>
            <p className="mt-1 text-right text-[15px] font-bold text-[#8B61D4]">
              {formatRisk(dataSaham.riskLevel)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/30 p-3.5 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-[#A1A4B0]">Potensi Keuntungan</span>
            <p className="mt-1 text-right text-[15px] font-bold text-[#8B61D4]">
              {formatRisk(dataSaham.returnPotential)}
            </p>
          </div>
        </div>

        {/* Deskripsi Saham */}
        <div className="mt-6">
          <h2 className="text-[14px] font-bold text-[#757885]">Tentang saham</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#8A8D99]">
            {dataSaham.deskripsi}
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-8 flex justify-center">
          <Link
            href={`/saham/detail/${encodeURIComponent(dataSaham.code)}/investasi`}
            className="rounded-[8px] bg-gradient-to-b from-[#A98BE0] to-[#9272D0] px-[21px] py-[6px] text-[12px] font-semibold text-white shadow-[0_4px_8px_rgba(120,100,160,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] transition active:scale-95">
            Investasi Sekarang
          </Link>
        </div>

      </div>
    </main>
  );
}