import { useState } from "react";
import { formatDigitsInput, parseRupiahInput } from "@/lib/format";
import { saveSavingRatio, useInvalidate } from "@/lib/queries";

// Nilai enum IncomePeriod di BE.
export const PERIODS = [
  { key: "DAILY", label: "Hari" },
  { key: "WEEKLY", label: "Minggu" },
  { key: "MONTHLY", label: "Bulan" },
];

export const PERIOD_LABEL = { DAILY: "hari", WEEKLY: "minggu", MONTHLY: "bulan" };

// Dipakai kalau GET /savings/ratio gagal; sama dengan rasio default BE
export const FALLBACK_RATIO = { needsPct: 60, savingsPct: 30, funPct: 10 };

// Tiga pos alokasi BE; totalnya selalu 100%.
export const POSTS = [
  { key: "needs", pctKey: "needsPct", name: "Kebutuhan", color: "#E3D3FA", dark: "#C9B0F0" },
  { key: "savings", pctKey: "savingsPct", name: "Tabungan", color: "#FF9E96", dark: "#F27A70" },
  { key: "fun", pctKey: "funPct", name: "Hiburan", color: "#BDE3F7", dark: "#8FCBEA" },
];

/** State dan simpan form "Total Uang Jajan", dipakai tampilan mobile dan desktop. */
export function useTargetForm({ saved, defaultRatio }) {
  const invalidate = useInvalidate();

  // Diisi dari pemasukan yang terakhir disimpan, supaya user tidak mengetik ulang.
  const [period, setPeriod] = useState(saved?.period ?? "DAILY");
  const [amount, setAmount] = useState(
    saved?.incomeAmount ? formatDigitsInput(Math.round(Number(saved.incomeAmount))) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /**
   * onSuccess(jumlah, periode) dipanggil setelah pemasukan tersimpan. Kalau mengembalikan
   * true (pindah halaman), tombol tetap "..." sampai halaman berganti.
   */
  const submit = async (onSuccess) => {
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
      if (!onSuccess(value, period)) setSubmitting(false);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return { period, setPeriod, amount, setAmount: (text) => setAmount(formatDigitsInput(text)), submitting, error, submit };
}
