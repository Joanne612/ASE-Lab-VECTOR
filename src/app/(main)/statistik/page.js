"use client";

import Link from "next/link";
import { PALETTE, StatistikContent } from "@/components/CategoryStats";
import { usePeriod } from "@/components/PeriodProvider";
import { useSummary } from "@/lib/queries";

function StatistikSection({ title, backHref, className = "", children }) {
  return (
    <section
      className={`mx-3 rounded-[28px] border border-white/60 bg-white/20 px-[17px] pb-6 pt-3 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center gap-2">
        {backHref && (
          <Link href={backHref} aria-label="Kembali" className="flex h-8 w-8 items-center justify-center text-[#6A6E79]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
        <h2 className="text-[22px] font-medium text-[#8A8D99]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function StatistikPage() {
  const { range } = usePeriod();
  // Key sama dengan header, jadi data ringkasan tidak diambil dua kali.
  const { data: summary, error } = useSummary(range);

  return (
    <>
      <StatistikSection title="Pengeluaran" backHref="/homepage" className="mt-[20px]">
        <StatistikContent
          summary={summary}
          error={error}
          type="EXPENSE"
          palette={PALETTE}
          emptyText="Belum ada pengeluaran di periode ini."
          chartLabel="Diagram pengeluaran per kategori"
        />
      </StatistikSection>

      <StatistikSection title="Pemasukan" className="mt-4 mb-6">
        <StatistikContent
          summary={summary}
          error={error}
          type="INCOME"
          palette={PALETTE}
          emptyText="Belum ada pemasukan di periode ini."
          chartLabel="Diagram pemasukan per kategori"
        />
      </StatistikSection>
    </>
  );
}
