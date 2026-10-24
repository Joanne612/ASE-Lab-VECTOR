"use client";

import { formatRupiah } from "@/lib/format";
import { useIncomeIdeas } from "@/lib/queries";

const DESKTOP_TEXT = "text-[18px] text-[#6A6E79]/70";

/**
 * Daftar ide tambahan uang dari BE, diurutkan menurut kekurangan per bulan.
 * variant "mobile": halaman rekomendasi; "desktop": kartu "Tambahan uang" (Figma 151:5634).
 */
export default function IncomeIdeas({ gapPerBulan, variant = "mobile" }) {
  const { data, error, mutate } = useIncomeIdeas(gapPerBulan);
  const desktop = variant === "desktop";

  if (!data && !error) {
    return (
      <ul className={desktop ? "flex flex-col gap-5 px-[38px] py-[21px]" : "flex flex-col gap-5"} aria-busy="true" aria-label="Memuat ide">
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-[40px] animate-pulse rounded bg-white/40" />
        ))}
      </ul>
    );
  }

  if (!data) {
    return (
      <p className={desktop ? `px-[38px] py-[21px] ${DESKTOP_TEXT}` : "text-[15px] text-[#8A8D99]"}>
        Gagal memuat ide.{" "}
        <button type="button" onClick={() => mutate()} className="font-medium text-[#7A53B1] underline">
          Coba lagi
        </button>
      </p>
    );
  }

  if (data.data.length === 0) {
    return (
      <p className={desktop ? `px-[38px] py-[21px] ${DESKTOP_TEXT}` : "text-[15px] text-[#8A8D99]"}>
        Belum ada ide untuk saat ini.
      </p>
    );
  }

  if (desktop) {
    return (
      <ul className="px-[38px]">
        {data.data.map((ide) => (
          <li key={ide.id} title={ide.description} className="border-b-2 border-white/50 py-[18px] pl-[29px] last:border-b-0">
            <p className="text-[24px] font-medium leading-normal text-[#6A6E79]/70 [text-shadow:0_1px_3px_rgba(255,255,255,0.5)]">
              {ide.title}
            </p>
            <p className="text-[14px] font-medium text-[#8A6FCF]">
              ± Rp {formatRupiah(ide.estMonthlyMin)}–{formatRupiah(ide.estMonthlyMax)} / bulan
            </p>
          </li>
        ))}
      </ul>
    );
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
