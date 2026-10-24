"use client";

import { useState } from "react";
import DonutChart from "@/components/DonutChart";
import { formatRupiah } from "@/lib/format";
import { useRatioCalculation } from "@/lib/queries";
import { PERIODS, POSTS, useTargetForm } from "@/lib/use-target-form";
import { useDesktopScale } from "@/lib/use-viewport-size";

/*
 * Saran Tabungan versi desktop (≥ lg) dari Figma 2:377 / 119:4221 / 96:7899:
 * form "Total Uang Jajan" dan hasil "Rencana Alokasi Terperinci" di halaman yang sama.
 */
const TEXT_GLOW = "[text-shadow:0_1px_3px_rgba(255,255,255,0.5)]";
const GLASS_SHADOW =
  "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_30px_rgba(255,255,255,0.12),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2)]";
const CARD =
  "relative min-h-[382px] rounded-[25px] border border-white bg-white/50 shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_0_4px_4px_rgba(154,168,189,0.2),inset_0_4px_4px_rgba(255,255,255,0.25)] backdrop-blur-[4px]";
const TITLE = `absolute top-[22px] whitespace-nowrap text-[30px] font-medium leading-normal text-[#6A6E79]/70 ${TEXT_GLOW}`;

// Warna desktop dari Figma (swatch bergradasi, donat memakai warna tengahnya).
const DESKTOP_COLORS = {
  needs: { color: "#D8B8F4", swatch: "linear-gradient(136.83deg,#E5D2FA 1.5%,#D8B8F4 50%,#C7A3E9 98.5%)" },
  savings: { color: "#FF9D93", swatch: "linear-gradient(130.81deg,#FFC0BA 3.16%,#FF9D93 50%,#FF8477 96.84%)" },
  fun: { color: "#CBECFF", swatch: "linear-gradient(130.76deg,#E7F6FE 3.2%,#CBECFF 50%,#C2E9FF 96.8%)" },
};

const pct = (n) => `${Number(n).toFixed(2)}%`;

function UangJajanCard({ form, onSubmit }) {
  const { period, setPeriod, amount, setAmount, submitting, error } = form;

  return (
    <form onSubmit={onSubmit} className={CARD}>
      <span
        aria-hidden="true"
        className="absolute left-[20px] top-[15px] size-[60px] bg-[url(/desktop-icon-uang-jajan.svg)] bg-no-repeat"
      />
      <h2 className={`${TITLE} left-[85px]`}>Total Uang Jajan</h2>

      <div role="radiogroup" aria-label="Periode" className="absolute left-[30px] top-[89px] flex gap-[21px]">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="radio"
            aria-checked={period === p.key}
            onClick={() => setPeriod(p.key)}
            className={`h-[48px] w-[126px] rounded-[10px] border border-white/40 text-[20px] font-medium text-[#6A6E79]/70 backdrop-blur-[10px] transition active:scale-95 ${GLASS_SHADOW} ${TEXT_GLOW} ${
              period === p.key ? "bg-white/70" : "bg-[rgba(221,230,245,0.15)]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label
        className={`absolute left-[30px] top-[164px] h-[57px] w-[422px] rounded-[10px] border border-white/40 bg-[rgba(221,230,245,0.15)] backdrop-blur-[10px] ${GLASS_SHADOW}`}
      >
        <span className={`absolute left-[10px] top-1/2 w-[34px] -translate-y-1/2 text-center text-[20px] font-medium text-[#6A6E79]/70 ${TEXT_GLOW}`}>
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Jumlah"
          aria-label="Jumlah uang jajan"
          className={`absolute inset-y-0 left-[54px] right-[10px] bg-transparent text-[24px] font-medium text-[#6A6E79] outline-none placeholder:text-[#6A6E79]/50 ${TEXT_GLOW}`}
        />
      </label>

      {error && (
        <p role="alert" className="absolute left-[30px] right-[28px] top-[228px] text-[13px] text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={`absolute left-[177px] top-[283px] h-[48px] w-[126px] rounded-[10px] border border-white/40 bg-white/15 text-[24px] font-medium text-[#6A6E79]/70 backdrop-blur-[10px] transition ${GLASS_SHADOW} ${TEXT_GLOW} enabled:hover:bg-white/70 enabled:hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_8px_-10px_8px_rgba(255,255,255,0.2),inset_-3px_2px_8px_rgba(0,0,0,0.15)] active:scale-95 disabled:opacity-60`}
      >
        {submitting ? "..." : "Catat"}
      </button>
    </form>
  );
}

function AlokasiContent({ data, error, waiting }) {
  if (waiting) {
    // Figma 2:377: lingkaran kosong sebelum ada jumlah uang jajan.
    return (
      <span
        aria-hidden="true"
        className="absolute left-[12px] top-[88px] h-[265.802px] w-[265.802px] bg-[url(/desktop-donut-empty.svg)] bg-no-repeat"
      />
    );
  }
  if (!data && !error) {
    return <div className="absolute left-[24px] top-[96px] size-[242px] animate-pulse rounded-full bg-white/40" aria-busy="true" />;
  }
  if (!data) {
    return <p className="absolute left-[285px] right-[18px] top-[103px] text-[16px] text-[#6A6E79]/80">{error.message}</p>;
  }

  const items = POSTS.map((p) => ({
    ...p,
    ...DESKTOP_COLORS[p.key],
    value: data.ratio[p.pctKey],
    amount: data.allocation.perPeriod[p.key],
  }));

  return (
    <>
      {/* Dibungkus: DonutChart sendiri memakai `relative`. */}
      <div className="absolute left-[24px] top-[96px]">
        <DonutChart items={items} label="Diagram rencana alokasi" className="lg:size-[242px]" />
      </div>

      <ul className="absolute left-[285px] right-[18px] top-[103px] flex flex-col gap-[10px]">
        {items.map((c) => (
          <li key={c.key} className={`grid grid-cols-[35px_1fr_auto] items-start gap-x-[28px] text-[#6A6E79]/70 ${TEXT_GLOW}`}>
            <span
              className="mt-[3px] size-[35px] rounded-[2px] shadow-[0_2px_2px_rgba(0,0,0,0.15),inset_0_0_2px_rgba(0,0,0,0.15),inset_0_4px_4px_rgba(255,255,255,0.3)]"
              style={{ background: c.swatch }}
            />
            <div className="min-w-0">
              <p className="text-[24px] font-semibold leading-normal">{c.name}</p>
              <p className="text-[20px] font-medium leading-normal tabular-nums">Rp {formatRupiah(c.amount)}</p>
            </div>
            <p className="text-right text-[24px] font-semibold leading-normal tabular-nums">{pct(c.value)}</p>
          </li>
        ))}
      </ul>

      {data.tips.length > 0 && (
        <p className="absolute left-[285px] right-[18px] top-[332px] line-clamp-2 text-[13px] leading-snug text-[#6A6E79]/80">
          {data.tips[0].message}
        </p>
      )}
    </>
  );
}

export default function DesktopTarget({ saved, defaultRatio }) {
  const form = useTargetForm({ saved, defaultRatio });
  // Awalnya menampilkan alokasi dari uang jajan yang terakhir disimpan.
  const [result, setResult] = useState(() =>
    Number(saved?.incomeAmount) > 0 && saved?.period
      ? { amount: Math.round(Number(saved.incomeAmount)), period: saved.period }
      : null,
  );
  const { data, error } = useRatioCalculation(result);
  // Isi kartu memakai ukuran px Figma; di bawah 1280px semuanya diperkecil proporsional.
  const { scale } = useDesktopScale();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Desktop: hasil tampil di kartu sebelah, tanpa pindah halaman.
    form.submit((amount, period) => setResult({ amount, period }));
  };

  return (
    <div style={{ zoom: scale }} className="hidden grid-cols-[480fr_728fr] gap-[25px] pl-[11px] pr-[36px] lg:-mt-[11px] lg:grid">
      <UangJajanCard form={form} onSubmit={handleSubmit} />

      <section className={CARD}>
        <span
          aria-hidden="true"
          className="absolute left-[14px] top-[15px] size-[60px] bg-[url(/desktop-icon-alokasi.svg)] bg-no-repeat"
        />
        <h2 className={`${TITLE} left-[80px]`}>Rencana Alokasi Terperinci</h2>
        <AlokasiContent data={data} error={error} waiting={!result} />
      </section>
    </div>
  );
}
