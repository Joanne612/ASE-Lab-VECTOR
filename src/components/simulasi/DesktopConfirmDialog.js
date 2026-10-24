"use client";

import { GlassButton, PurpleButton, TEXT } from "@/components/simulasi/desktop-ui";

/**
 * Popup konfirmasi investasi versi desktop (Figma 524:6567 / 526:5400): kartu di tengah
 * layar; klik di luar kartu = Kembali. Isi ringkasan (`children`) diisi halaman.
 */
export default function DesktopConfirmDialog({ open, title, subtitle, children, onClose, onConfirm, submitting }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 hidden items-center justify-center bg-[#6A6E79]/25 backdrop-blur-[2px] lg:flex lg:font-(family-name:--font-poppins)"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-konfirmasi-desktop"
        onClick={(e) => e.stopPropagation()}
        className="w-[795px] max-w-[calc(100vw-32px)] rounded-[25px] border border-white bg-white/80 px-[40px] pb-[30px] pt-[22px] shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_0_4px_4px_rgba(154,168,189,0.2)] backdrop-blur-[10px]"
      >
        <h2 id="judul-konfirmasi-desktop" className={`text-[32px] font-medium leading-tight ${TEXT}`}>
          {title}
        </h2>
        <p className={`mt-[6px] text-[20px] ${TEXT}`}>{subtitle}</p>

        <div className="mt-[16px] rounded-[18px] border border-white bg-white/80 px-[34px] py-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          {children}
        </div>

        <p className={`mt-[22px] text-[20px] leading-snug ${TEXT}`}>
          *Investasi ini hanya menggunakan uang virtual untuk keperluan simulasi
        </p>

        <div className="mt-[22px] flex justify-center gap-[24px]">
          <GlassButton onClick={onClose} disabled={submitting} className="h-[61px] w-[240px] text-[22px]">
            Kembali
          </GlassButton>
          <PurpleButton onClick={onConfirm} disabled={submitting} className="h-[61px] w-[240px] text-[22px]">
            {submitting ? "Memproses..." : "Konfirmasi"}
          </PurpleButton>
        </div>
      </div>
    </div>
  );
}

/** Baris ringkasan di dalam popup. */
export function ConfirmRow({ label, value }) {
  return (
    <div className={`flex items-baseline justify-between text-[20px] ${TEXT}`}>
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
