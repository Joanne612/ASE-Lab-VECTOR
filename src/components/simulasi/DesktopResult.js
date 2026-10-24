"use client";

import DesktopLineChart from "@/components/simulasi/DesktopLineChart";
import { ACCENT_TEXT, BOX_SM, CARD, PurpleButton, TEXT } from "@/components/simulasi/desktop-ui";
import { EstimateRow, SummaryTitle } from "@/components/simulasi/DesktopInvestForm";
import { chartLabels, signOf } from "@/lib/simulation";

const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const persen = (n) => `${Math.abs(n).toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;

/**
 * "Simulasi Selesai" versi desktop (Figma 524:6440 saham / 526:5425 reksa dana):
 * nilai akhir di tengah, grafik di kiri, ringkasan di kanan. Ringkasan bisa di-scroll
 * kalau barisnya banyak, seperti di Figma.
 */
export default function DesktopResult({ nilaiAkhir, keuntungan, returnPersen, series, rows, doneHref }) {
  return (
    <div className="hidden justify-center px-4 lg:flex">
      <div className={`relative h-[430px] w-[1081px] px-[43px] pt-[16px] ${CARD}`}>
        <h1 className={`text-center text-[32px] font-semibold leading-tight ${ACCENT_TEXT}`}>Simulasi Selesai</h1>
        <p className={`mt-[4px] text-center text-[20px] ${TEXT}`}>Nilai investasi kamu setelah 1 tahun</p>

        <div className="mx-auto mt-[12px] flex h-[96px] w-[384px] flex-col items-center justify-center rounded-[18px] border-2 border-[rgba(122,83,177,0.5)] bg-white/30">
          <p className={`text-[32px] font-semibold leading-tight ${TEXT}`}>{rupiah(nilaiAkhir)}</p>
          <div className={`mt-[6px] flex gap-[66px] text-[18px] font-semibold ${ACCENT_TEXT}`}>
            <span>
              {signOf(keuntungan)}
              {rupiah(Math.abs(keuntungan))}
            </span>
            <span>
              {signOf(returnPersen)}
              {persen(returnPersen)}
            </span>
          </div>
        </div>

        <div className="mt-[12px] grid grid-cols-[395px_480px] justify-between">
          <DesktopLineChart
            points={series.map((p) => [p.day, Number(p.value)])}
            yLabels={chartLabels(series.map((p) => Number(p.value)), 3)}
            xLabels={["1 H", "1 B", "6 B", "1 T"]}
            label="Grafik nilai investasi selama simulasi"
            className="[&>div:first-child]:h-[100px]"
          />

          <div className={`h-[128px] overflow-y-auto rounded-[8px] px-[18px] pt-[12px] scrollbar-glass ${BOX_SM}`}>
            <SummaryTitle>Estimasi pembelian</SummaryTitle>
            <dl className="mt-[10px] space-y-[8px] pb-[12px]">
              {rows.map(([label, value, unit]) => (
                <EstimateRow key={label} label={label} value={value} unit={unit} />
              ))}
            </dl>
          </div>
        </div>

        <PurpleButton
          href={doneHref}
          className="absolute bottom-[12px] left-1/2 h-[44px] w-[178px] -translate-x-1/2 text-[18px]"
        >
          Selesai
        </PurpleButton>
      </div>
    </div>
  );
}
