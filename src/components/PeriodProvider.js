"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { parseLocalDate, periodToRange, selectionFromDate } from "@/lib/format";
import { useToday } from "@/lib/use-today";

const PeriodContext = createContext(null);

/**
 * Periode yang dipilih di kalender header, dipakai bersama oleh header,
 * riwayat transaksi, dan statistik. Dipasang di root supaya pilihan tetap
 * terjaga saat user pindah ke halaman tambah transaksi lalu kembali.
 */
export function PeriodProvider({ children }) {
  const today = useToday();
  const [chosen, setSelection] = useState(null);

  const value = useMemo(() => {
    // Sebelum hydrate, today masih null: belum ada periode dan belum ada fetch.
    const selection = chosen ?? (today ? selectionFromDate(parseLocalDate(today)) : null);
    return {
      selection,
      range: selection ? periodToRange(selection) : null,
      setSelection,
    };
  }, [chosen, today]);

  return <PeriodContext value={value}>{children}</PeriodContext>;
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (!context) throw new Error("usePeriod harus dipakai di dalam <PeriodProvider>.");
  return context;
}
