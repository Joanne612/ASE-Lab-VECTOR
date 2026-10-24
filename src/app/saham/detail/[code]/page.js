"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import DesktopLineChart from "@/components/simulasi/DesktopLineChart";
import { ACCENT_TEXT, BOX_SM, CARD, DesktopStatus, PurpleButton, SOFT_TEXT, TEXT } from "@/components/simulasi/desktop-ui";
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
  const [hoverIndex, setHoverIndex] = useState(null);
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
  const coords = points.map((point, index) => ({
    x: points.length > 1 ? (index / (points.length - 1)) * 100 : 50,
    y: 92 - ((Number(point.price) - minimumPrice) / priceRange) * 84,
  }));
  // Kurva halus (Catmull-Rom -> Bezier) agar garis tidak patah-patah
  const path = coords
    .map((p, i) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const p0 = coords[i - 2] ?? coords[i - 1];
      const p1 = coords[i - 1];
      const p3 = coords[i + 1] ?? p;
      const c1x = p1.x + (p.x - p0.x) / 6;
      const c1y = p1.y + (p.y - p0.y) / 6;
      const c2x = p.x - (p3.x - p1.x) / 6;
      const c2y = p.y - (p3.y - p1.y) / 6;
      return `C ${c1x},${c1y} ${c2x},${c2y} ${p.x},${p.y}`;
    })
    .join(" ");
  const areaPath = coords.length ? `${path} L ${coords.at(-1).x},100 L ${coords[0].x},100 Z` : "";
  // Warna garis mengikuti tren: hijau jika naik, merah jika turun
  const trendUp = prices.length < 2 || prices.at(-1) >= prices[0];
  const trendColor = trendUp ? "#2FA36B" : "#E0565B";
  const activeIndex = hoverIndex ?? coords.length - 1;
  const activePoint = coords[activeIndex];
  const handleHover = (event) => {
    if (coords.length < 2) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    setHoverIndex(Math.round(ratio * (coords.length - 1)));
  };

  if (detailLoading) {
    return (
      <>
        <DesktopStatus>Memuat detail saham...</DesktopStatus>
        <main className="px-6 py-12 text-center text-[#8A8D99] lg:hidden">Memuat detail saham...</main>
      </>
    );
  }
  if (detailError || !dataSaham) {
    return (
      <>
        <DesktopStatus role="alert">{detailError?.message ?? "Saham tidak ditemukan."}</DesktopStatus>
        <main role="alert" className="px-6 py-12 text-center text-[#B94A48] lg:hidden">{detailError?.message ?? "Saham tidak ditemukan."}</main>
      </>
    );
  }

  return (
    <>
    <DetailSahamDesktop
      saham={dataSaham}
      tab={tab}
      onTab={setTab}
      prices={prices}
      points={points}
      historyError={historyError}
    />
    <main className="relative min-h-screen px-[13px] pb-8 pt-[20px] lg:hidden">
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
            <div className="relative w-16 shrink-0 text-[11px] font-medium text-[#8A8D99]">
              {[0, 0.5, 1].map((t) => (
                <span
                  key={t}
                  className="absolute right-2 -translate-y-1/2 whitespace-nowrap"
                  style={{ top: `${8 + t * 84}%` }}
                >
                  {rupiah(prices.length ? maximumPrice - t * (maximumPrice - minimumPrice) : Number(dataSaham.price))}
                </span>
              ))}
            </div>

            {/* Area Grafik SVG */}
            <div
              className="relative flex-1 cursor-crosshair"
              onMouseMove={handleHover}
              onTouchMove={(e) => handleHover(e.touches[0] ? { ...e, clientX: e.touches[0].clientX, currentTarget: e.currentTarget } : e)}
              onMouseLeave={() => setHoverIndex(null)}
              onTouchEnd={() => setHoverIndex(null)}
            >
              {[8, 50, 92].map((top) => (
                <div
                  key={top}
                  className="absolute inset-x-0 border-b border-dashed border-[#8A8D99]/25"
                  style={{ top: `${top}%` }}
                />
              ))}

              <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grafikArea-${trendUp ? "naik" : "turun"}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={trendColor} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {areaPath ? <path d={areaPath} fill={`url(#grafikArea-${trendUp ? "naik" : "turun"})`} stroke="none" /> : null}
                <path
                  d={path}
                  fill="none"
                  stroke={trendColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {hoverIndex !== null && activePoint ? (
                  <line
                    x1={activePoint.x}
                    x2={activePoint.x}
                    y1="0"
                    y2="100"
                    stroke={trendColor}
                    strokeOpacity="0.4"
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                  />
                ) : null}
              </svg>

              {activePoint ? (
                <>
                  <span
                    className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                    style={{ left: `${activePoint.x}%`, top: `${activePoint.y}%`, backgroundColor: trendColor, boxShadow: `0 0 0 4px ${trendColor}40` }}
                  />
                  {hoverIndex !== null ? (
                    <div
                      className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white/90 px-2 py-1 text-center text-[11px] shadow-md"
                      style={{
                        left: `${Math.min(Math.max(activePoint.x, 12), 88)}%`,
                        top: `${activePoint.y > 40 ? Math.max(activePoint.y - 30, 0) : activePoint.y + 6}%`,
                      }}
                    >
                      <p className="font-bold text-[#757885]">{rupiah(points[activeIndex].price)}</p>
                      <p className="text-[#A1A4B0]">{points[activeIndex].date}</p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <div className="mt-3 flex justify-between pl-16 text-[11px] font-medium text-[#8A8D99]">
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
            {dataSaham.description}
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
    </>
  );
}
/* Label sumbu X: 4 tanggal tersebar merata dari riwayat harga. */
function sebaranTanggal(points) {
  if (points.length === 0) return ["-"];
  const count = Math.min(4, points.length);
  return Array.from({ length: count }, (_, i) => points[Math.round((i * (points.length - 1)) / Math.max(count - 1, 1))].date);
}

/* Detail saham versi desktop (Figma 519:5841): info di kiri, periode dan grafik di kanan. */
function DetailSahamDesktop({ saham, tab, onTab, prices, points, historyError }) {
  const max = prices.length ? Math.max(...prices) : Number(saham.price);
  const min = prices.length ? Math.min(...prices) : Number(saham.price);
  const yLabels = Array.from({ length: 5 }, (_, i) => rupiah(max - ((max - min) * i) / 4));

  return (
    <div className="hidden justify-center px-4 lg:flex">
      <div className={`relative grid h-[430px] w-[967px] grid-cols-[400px_1fr] gap-x-[50px] px-[36px] pb-[80px] pt-[26px] ${CARD}`}>
        <section>
          <h1 className={`text-[32px] font-semibold leading-tight ${TEXT}`}>{saham.code}</h1>
          <p className={`text-[20px] font-medium leading-normal ${SOFT_TEXT}`}>{saham.name}</p>
          <p className="mt-[18px] flex items-baseline gap-[10px]">
            <span className={`text-[28px] font-bold leading-none ${SOFT_TEXT}`}>{rupiah(saham.price)}</span>
            <span className={`text-[20px] font-medium ${TEXT}`}>/lembar</span>
          </p>
          <p className={`mt-[10px] text-[16px] font-semibold ${ACCENT_TEXT}`}>{persen(saham.changePct)} hari ini</p>

          <div className="mt-[14px] grid grid-cols-2 gap-[30px]">
            {[
              ["Risiko", formatRisk(saham.riskLevel)],
              ["Potensi Keuntungan", formatRisk(saham.returnPotential)],
            ].map(([label, value]) => (
              <div key={label} className={`h-[66px] px-[9px] pt-[8px] ${BOX_SM}`}>
                <p className={`text-[13px] font-semibold ${ACCENT_TEXT}`}>{label}</p>
                <p className={`mt-[8px] text-right text-[20px] font-semibold leading-none ${TEXT}`}>{value}</p>
              </div>
            ))}
          </div>

          <h2 className={`mt-[12px] text-[16px] font-bold ${TEXT}`}>Tentang saham</h2>
          <p className={`mt-[4px] line-clamp-3 text-[14px] leading-snug ${SOFT_TEXT}`}>{saham.description}</p>
        </section>

        <section>
          <div
            role="radiogroup"
            aria-label="Periode grafik"
            className={`ml-auto grid h-[59px] w-[318px] grid-cols-3 gap-[3px] rounded-[15px] border-[3px] border-white bg-[rgba(221,230,245,0.3)] p-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2)]`}
          >
            {["Bulan", "Minggu", "Tahun"].map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tab === t}
                onClick={() => onTab(t)}
                className={`rounded-[10px] text-[20px] ${TEXT} transition ${tab === t ? "border border-white bg-white/70 shadow-[0_4px_12px_rgba(0,0,0,0.08)]" : "hover:bg-white/40"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <DesktopLineChart
            className="mt-[18px]"
            points={points.map((p, i) => [i, Number(p.price)])}
            yLabels={yLabels}
            xLabels={sebaranTanggal(points)}
            label={`Grafik harga ${saham.code}`}
          />
          {historyError ? <p role="alert" className="mt-2 text-[14px] text-[#B94A48]">{historyError.message}</p> : null}
        </section>

        <PurpleButton
          href={`/saham/detail/${encodeURIComponent(saham.code)}/investasi`}
          className="absolute bottom-[11px] left-1/2 h-[61px] w-[295px] -translate-x-1/2 text-[20px]"
        >
          Investasi Sekarang
        </PurpleButton>
      </div>
    </div>
  );
}
