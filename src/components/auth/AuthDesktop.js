/*
 * Bagian versi desktop (≥ lg) halaman login dan register, dari frame Figma 1280×832.
 * Di bawah lg semuanya tersembunyi; tampilan mobile tetap memakai layer milik tiap halaman.
 */

import { FrameImage, FrameSide } from "@/components/shell/DesktopBackground";

export { DesktopBackgroundLayer } from "@/components/shell/DesktopBackground";
export { FIELD_SHADOW, TEXT_GLOW } from "@/lib/desktop-styles";

const GLASS_CARD =
  "border border-white/50 bg-white/50 shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_0_-10px_4px_rgba(255,255,255,0.25),inset_0_4px_4px_rgba(154,168,189,0.2)] backdrop-blur-[7.5px]";

/* LAYER 2 (DESKTOP) — ILUSTRASI yang menimpa tepi kartu, di bawah tulisan dan form */
export function DesktopIllustrationLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden lg:block">
      <FrameSide side="left">
        <FrameImage
          src="/auth-desktop-buku.webp"
          box={[-66, 501, 335, 353]}
          crop={{ left: "-3.73%", top: "-127.05%", width: "173.56%", height: "247.34%" }}
        />
      </FrameSide>
      {/* Di bawah xl kartu hampir selebar layar, sehingga HP menimpa link di bawah form. */}
      <FrameSide side="right" className="hidden xl:block">
        <FrameImage src="/auth-desktop-hp.webp" box={[849, 586, 482, 489]} />
      </FrameSide>
    </div>
  );
}

/* Kartu kaca desktop: seluruh kartu + panel kanan yang lebih pekat. Induknya harus relative. */
export function DesktopCardGlass() {
  return (
    <>
      <div aria-hidden="true" className={`absolute inset-0 hidden rounded-[30px] lg:block ${GLASS_CARD}`} />
      <div aria-hidden="true" className={`absolute inset-y-0 right-0 hidden w-[calc(600/1114*100%)] rounded-r-[30px] lg:block ${GLASS_CARD}`} />
    </>
  );
}

/* Logo finby (dompet + tulisan). Lebar diatur lewat className; letak tulisan mengikuti rasio Figma. */
export function DesktopBrand({ className = "" }) {
  return (
    <div role="img" aria-label="Logo finby" className={`relative hidden aspect-[200/215] lg:block ${className}`}>
      <div className="absolute left-0 top-0 aspect-square w-full bg-[url(/auth-desktop-dompet.webp)] bg-cover opacity-80" />
      <div className="absolute left-[18%] top-[80.465%] h-[19.535%] w-[63.5%] bg-[url(/auth-desktop-logo.webp)] bg-cover opacity-80" />
    </div>
  );
}

/* Ikon mata desktop dari Figma; ukurannya mengikuti SVG (termasuk ruang bayangan). */
export function DesktopEyeIcon({ passwordVisible }) {
  return (
    <span
      aria-hidden="true"
      className={`hidden w-[38.6883px] shrink-0 translate-y-0.5 bg-no-repeat lg:block ${
        passwordVisible ? "h-[37px] bg-[url(/auth-desktop-eye-off.svg)]" : "h-[33px] bg-[url(/auth-desktop-eye.svg)]"
      }`}
    />
  );
}
