"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { formatRupiah } from "@/lib/format";
import { useIncomeIdeas } from "@/lib/queries";

/* hari per satuan waktu (pendekatan) */
const UNIT_DAYS = { hari: 1, minggu: 7, bulan: 30, tahun: 365 };
const UNIT_LABEL = { hari: "hari", minggu: "minggu", bulan: "bulan", tahun: "tahun" };

/* ---------- PERHITUNGAN ---------- */
function hitungCatatan(p) {
  const tabungan = Number(p.get("tabungan")) || 0;
  const durasi = Number(p.get("durasi")) || 0;
  const durasiUnit = p.get("durasiUnit") || "bulan";
  const penerimaan = Number(p.get("penerimaan")) || 0;
  const frekuensi = Number(p.get("frekuensi")) || 0;
  const frekuensiUnit = p.get("frekuensiUnit") || "minggu";

  const totalHari = durasi * (UNIT_DAYS[durasiUnit] ?? 30);
  const jarakHari = frekuensi * (UNIT_DAYS[frekuensiUnit] ?? 7);
  const kali = jarakHari > 0 ? Math.floor(totalHari / jarakHari) : 0;

  const totalMasuk = kali * penerimaan;
  const kekurangan = Math.max(0, tabungan - totalMasuk);
  const sisihkan = kali > 0 ? Math.ceil(tabungan / kali) : 0; // per penerimaan
  const persen = penerimaan > 0 ? Math.min(100, Math.round((sisihkan / penerimaan) * 100)) : 0;
  // BE mengurutkan ide berdasarkan kekurangan per bulan.
  const kekuranganPerBulan = totalHari > 0 ? kekurangan / (totalHari / UNIT_DAYS.bulan) : 0;

  return {
    tabungan,
    durasi,
    durasiUnit,
    penerimaan,
    frekuensi,
    frekuensiUnit,
    kali,
    totalMasuk,
    kekurangan,
    kekuranganPerBulan,
    sisihkan,
    persen,
    cukup: kali > 0 && kekurangan === 0,
  };
}

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

function IdeTambahan({ gapPerBulan }) {
  const { data, error, mutate } = useIncomeIdeas(gapPerBulan);

  if (!data && !error) {
    return (
      <ul className="flex flex-col gap-5" aria-busy="true" aria-label="Memuat ide">
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-[40px] animate-pulse rounded bg-white/40" />
        ))}
      </ul>
    );
  }

  if (!data) {
    return (
      <p className="text-[15px] text-[#8A8D99]">
        Gagal memuat ide.{" "}
        <button type="button" onClick={() => mutate()} className="font-medium text-[#7A53B1] underline">
          Coba lagi
        </button>
      </p>
    );
  }

  if (data.data.length === 0) {
    return <p className="text-[15px] text-[#8A8D99]">Belum ada ide untuk saat ini.</p>;
  }

  return (
    <ul className="flex flex-col gap-5">
      {data.data.map((ide) => (
        <li key={ide.id}>
          <p className="text-[17px] text-[#6A6E79]">{ide.title}</p>
          <p className="mt-1 text-[13px] leading-snug text-[#8A8D99]">{ide.description}</p>
          <p className="mt-1 text-[13px] font-medium text-[#8A6FCF]">
            ± Rp {formatRupiah(ide.estMonthlyMin)}–{formatRupiah(ide.estMonthlyMax)} / bulan
          </p>
        </li>
      ))}
    </ul>
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
          <IdeTambahan gapPerBulan={c.kekuranganPerBulan} />
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
