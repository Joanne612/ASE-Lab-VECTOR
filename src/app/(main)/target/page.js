"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { formatDigitsInput, parseRupiahInput } from "@/lib/format";
import { saveSavingRatio, useInvalidate, useSavingRatio } from "@/lib/queries";

// Nilai enum IncomePeriod di BE.
const PERIODS = [
  { key: "DAILY", label: "Hari" },
  { key: "WEEKLY", label: "Minggu" },
  { key: "MONTHLY", label: "Bulan" },
];

// Dipakai kalau GET /savings/ratio gagal; sama dengan rasio default BE
const FALLBACK_RATIO = { needsPct: 60, savingsPct: 30, funPct: 10 };

const PANEL_CLASS = "mx-3 mb-8 mt-5 rounded-[28px] border border-white/70 bg-white/30 px-5 pb-6 pt-6 backdrop-blur-xl";

function TargetForm({ saved, defaultRatio }) {
  const router = useRouter();
  const invalidate = useInvalidate();

  // Diisi dari pemasukan yang terakhir disimpan, supaya user tidak mengetik ulang.
  const [period, setPeriod] = useState(saved?.period ?? "DAILY");
  const [amount, setAmount] = useState(
    saved?.incomeAmount ? formatDigitsInput(Math.round(Number(saved.incomeAmount))) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = parseRupiahInput(amount);
    if (!value) {
      setError("Isi jumlah uang jajan terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    setError("");
    const ratio = saved ?? defaultRatio ?? FALLBACK_RATIO;

    try {
      // Disimpan agar analisis target tabungan di BE memakai pemasukan ini
      await saveSavingRatio({
        needsPct: ratio.needsPct,
        savingsPct: ratio.savingsPct,
        funPct: ratio.funPct,
        incomeAmount: value,
        period,
      });
      await invalidate("/savings/ratio");
      router.push(`/target/alokasi?${new URLSearchParams({ jumlah: value, periode: period })}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={PANEL_CLASS}>
      <div className="flex items-center gap-3 text-[#8A8D99]">
        <Link href="/homepage" aria-label="Kembali" className="flex h-8 w-8 shrink-0 items-center justify-center text-[#6A6E79]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Icon name="handCoin" className="h-10 w-10 text-white drop-shadow-[0_2px_4px_rgba(120,100,160,0.3)]" />
        <h2 className="text-[20px] font-medium">Total Uang Jajan</h2>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3" role="radiogroup" aria-label="Periode">
        {PERIODS.map((p) => {
          const isActive = period === p.key;
          return (
            <button
              key={p.key}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setPeriod(p.key)}
              className={`h-[48px] rounded-xl border text-[18px] font-medium shadow-[0_4px_10px_rgba(120,100,160,0.12)] transition active:scale-95 ${
                isActive
                  ? "border-[#D7C5F5] bg-[#D7C5F5]/60 text-[#8A6FCF]"
                  : "border-white/80 bg-white/40 text-[#8A8D99] hover:bg-white/60"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <label className="mt-8 flex h-[52px] items-center gap-3 rounded-xl border border-white/80 bg-white/30 px-4 shadow-[inset_0_2px_4px_rgba(120,100,160,0.12)]">
        <span className="text-[18px] font-semibold text-[#8A8D99]">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(formatDigitsInput(e.target.value))}
          placeholder="Jumlah"
          aria-label="Jumlah uang jajan"
          className="min-w-0 flex-1 bg-transparent text-[18px] text-[#6A6E79] outline-none placeholder:text-[#A7A9B3]"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 px-1 text-[14px] text-red-600">
          {error}
        </p>
      )}

      <div className="mt-24 flex justify-center">
        <button
          type="submit"
          disabled={submitting}
          className="h-[48px] w-[126px] rounded-xl border border-white/80 bg-white/40 text-[22px] font-medium text-[#8A8D99] shadow-[0_4px_12px_rgba(120,100,160,0.15)] backdrop-blur-md transition hover:bg-white/60 active:scale-95 disabled:opacity-60"
        >
          {submitting ? "..." : "Catat"}
        </button>
      </div>
    </form>
  );
}

export default function TargetPage() {
  const { data, error } = useSavingRatio();

  // Form baru dirender setelah data tersimpan dimuat, supaya prefill tidak menimpa ketikan user
  if (!data && !error) {
    return <div className={`${PANEL_CLASS} h-[420px] animate-pulse`} aria-busy="true" aria-label="Memuat" />;
  }

  return <TargetForm saved={data?.data ?? null} defaultRatio={data?.default} />;
}
