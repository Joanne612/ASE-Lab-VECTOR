import Link from "next/link";

/*
 * Elemen kaca halaman simulasi versi desktop (≥ lg) dari Figma "Simulasi Saham" /
 * "Simulasi Reksa Dana" (151:6043, 519:5841, 519:6193, 519:6345, 524:6440, ...).
 * Komponen ini hanya dipakai di tree desktop (sudah tersembunyi di bawah lg).
 */
export const TEXT = "text-[#6A6E79]/70 [text-shadow:0_1px_3px_rgba(255,255,255,0.5)]";
export const SOFT_TEXT = "text-[#6A6E79]/80 [text-shadow:0_2px_8px_rgba(0,0,0,0.15)]";
export const ACCENT_TEXT = "text-[#7A53B1]/70 [text-shadow:0_2px_8px_rgba(0,0,0,0.15)]";
const GLASS_SHADOW =
  "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_30px_rgba(255,255,255,0.12),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2)]";

// Kartu utama (latar putih 50%, seperti kartu di halaman Rumah).
export const CARD =
  "rounded-[25px] border border-white bg-white/50 shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_0_4px_4px_rgba(154,168,189,0.2),inset_0_4px_4px_rgba(255,255,255,0.25)] backdrop-blur-[4px]";
// Kotak kaca di dalam kartu (saldo, estimasi, nilai investasi).
export const BOX = `rounded-[18px] border border-white/40 bg-white/15 backdrop-blur-[10px] ${GLASS_SHADOW}`;
export const BOX_SM = `rounded-[10px] border border-white/40 bg-white/15 backdrop-blur-[10px] ${GLASS_SHADOW}`;
const PURPLE = `rounded-[18px] border border-white/40 bg-[rgba(122,83,177,0.7)] font-semibold text-white backdrop-blur-[10px] [text-shadow:0_2px_8px_rgba(0,0,0,0.15)] transition hover:bg-[rgba(122,83,177,0.85)] active:scale-95 disabled:opacity-60 disabled:active:scale-100 ${GLASS_SHADOW}`;

/** Tombol ungu Figma (mis. "Investasi Sekarang" 295×61, "Lihat Detail" 154×45). */
export function PurpleButton({ href, className = "", children, ...props }) {
  const cls = `inline-flex items-center justify-center ${PURPLE} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

/** Tombol kaca netral (mis. "Kembali" di popup konfirmasi). */
export function GlassButton({ className = "", children, ...props }) {
  return (
    <button type="button" className={`${BOX} font-medium ${TEXT} transition hover:bg-white/60 active:scale-95 ${className}`} {...props}>
      {children}
    </button>
  );
}

/** Kotak label kecil (ungu) + nilai besar, mis. "Saldo Virtual / Rp 1.000.000". */
export function ValueBox({ label, value, className = "" }) {
  return (
    <div className={`${BOX} px-[25px] pb-[14px] pt-[10px] ${className}`}>
      <p className={`text-[20px] font-medium leading-normal ${ACCENT_TEXT}`}>{label}</p>
      <p className={`mt-[2px] text-[32px] font-semibold leading-normal ${TEXT}`}>{value}</p>
    </div>
  );
}

/** Pesan status (memuat / error / kosong) di area konten desktop. */
export function DesktopStatus({ role, children }) {
  return (
    <div className="hidden px-[57px] lg:block">
      <div role={role} className={`${CARD} px-8 py-16 text-center text-[20px] ${TEXT}`}>
        {children}
      </div>
    </div>
  );
}
