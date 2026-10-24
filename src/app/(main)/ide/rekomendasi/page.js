"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import IncomeIdeas from "@/components/IncomeIdeas";
import { formatRupiah } from "@/lib/format";
import { UNIT_LABEL, hitungCatatan } from "@/lib/saving-plan";

/* ---------- KOMPONEN HASIL ---------- */

function SectionTitle({ children }) {
  return <h2 className="px-4 text-[20px] font-medium text-[#8A8D99]">{children}</h2>;
}

/* Kartu kaca dengan inner shadow, sama seperti input di form */
function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-white/80 bg-white/30 shadow-[inset_0_2px_4px_rgba(120,100,160,0.12)] ${className}`}
    >
      {children}
    </div>
  );
}

function CatatanRow({ label, value, strong = false }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[15px] text-[#8A8D99]">{label}</span>
      <span className={`text-right text-[16px] ${strong ? "font-bold text-[#8A6FCF]" : "font-semibold text-[#6A6E79]"}`}>
        {value}
      </span>
    </div>
  );
}

function HasilPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const c = hitungCatatan(params);

  const datangTiap = `${c.frekuensi} ${UNIT_LABEL[c.frekuensiUnit]}`;
  const dalamWaktu = `${c.durasi} ${UNIT_LABEL[c.durasiUnit]}`;

  return (
    <section className="mx-3 mb-8 mt-5 rounded-[28px] border border-white/70 bg-white/30 px-5 pb-8 pt-5 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Kembali"
        className="flex h-8 w-8 items-center justify-center text-[#8A8D99] transition active:scale-90"
      >
        <Icon name="chevronLeft" className="h-6 w-6" />
      </button>

      {/* TAMBAHAN UANG */}
      <div className="mt-4">
        <SectionTitle>Tambahan uang</SectionTitle>
        <GlassCard className="mt-4 px-5 py-4">
          <IncomeIdeas gapPerBulan={c.kekuranganPerBulan} />
        </GlassCard>
      </div>

      {/* CATATAN KEUANGAN */}
      <div className="mt-8">
        <SectionTitle>Catatan keuangan</SectionTitle>
        <GlassCard className="mt-4 flex flex-col gap-3 px-5 py-4">
          <CatatanRow label="Target menabung" value={`Rp ${formatRupiah(c.tabungan)}`} />
          <CatatanRow label="Dalam waktu" value={dalamWaktu} />
          <CatatanRow label="Uang diterima" value={`Rp ${formatRupiah(c.penerimaan)} / ${datangTiap}`} />

          <div className="my-1 h-px w-full bg-white/80" />

          {c.kali === 0 ? (
            <p className="text-[15px] leading-snug text-[#8A8D99]">
              Waktunya terlalu singkat untuk menerima uang. Coba perpanjang waktu menabungmu.
            </p>
          ) : (
            <>
              <CatatanRow label="Total uang diterima" value={`Rp ${formatRupiah(c.totalMasuk)}`} />
              <CatatanRow
                label={`Sisihkan tiap ${datangTiap}`}
                value={`Rp ${formatRupiah(c.sisihkan)} (${c.persen}%)`}
                strong
              />

              <p className="mt-1 text-[15px] leading-snug text-[#8A8D99]">
                {c.cukup
                  ? "Uang yang kamu terima cukup untuk mencapai targetmu. Tetap konsisten ya!"
                  : `Uangmu masih kurang Rp ${formatRupiah(c.kekurangan)}. Coba salah satu ide tambahan uang di atas.`}
              </p>
            </>
          )}
        </GlassCard>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/ide"
          className="flex h-[48px] w-[126px] items-center justify-center rounded-xl border border-white/80 bg-white/40 text-[20px] font-medium text-[#8A8D99] shadow-[0_4px_12px_rgba(120,100,160,0.15)] backdrop-blur-md transition hover:bg-white/60 active:scale-95"
        >
          Hitung lagi
        </Link>
      </div>
    </section>
  );
}

export default function IdeHasilPage() {
  return (
    // useSearchParams wajib dibungkus Suspense di Next.js App Router
    <Suspense fallback={null}>
      <HasilPanel />
    </Suspense>
  );
}
