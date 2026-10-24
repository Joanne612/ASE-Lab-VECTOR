"use client";

import { ACCENT_TEXT, BOX, CARD, PurpleButton, TEXT, ValueBox } from "@/components/simulasi/desktop-ui";

const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const persen = (n) => `${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;

/**
 * "Investasi mu sedang berjalan" versi desktop (Figma 519:6345): saldo & investasi di kiri,
 * garis waktu checkpoint dan nilai saat ini di kanan. Logika (pilih checkpoint, lanjut)
 * tetap di halaman; komponen ini hanya tampilan.
 */
export default function DesktopRunning({
  saldoAwal,
  investasi,
  periode,
  aktif,
  onPilih,
  nilaiSekarang,
  persenAktif,
  errorMessage,
  onLanjut,
  disabled,
  busy,
}) {
  return (
    <div className="hidden justify-center px-4 lg:flex">
      <div className={`relative h-[430px] w-[1159px] px-[28px] pt-[22px] ${CARD}`}>
        <h1 className={`text-[32px] font-medium leading-tight ${TEXT}`}>Investasi mu sedang berjalan</h1>

        <div className="mt-[44px] grid grid-cols-[459px_460px] justify-between">
          <div className="flex flex-col gap-[17px]">
            <ValueBox label="Saldo awal" value={rupiah(saldoAwal)} className="h-[94px]" />
            <ValueBox label="Investasi" value={rupiah(investasi)} className="h-[94px]" />
          </div>

          <div className="-mt-[66px]">
            {/* Garis waktu checkpoint */}
            <div className="relative">
              <div className="absolute left-[12.5%] right-[12.5%] top-[12px] h-[2px] bg-[#6A6E79]/50" />
              <div className="relative grid grid-cols-4">
                {periode.map((p, i) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => p.reached && onPilih(i)}
                    aria-pressed={i === aktif}
                    disabled={!p.reached}
                    className="flex flex-col items-center gap-[6px] disabled:cursor-default"
                  >
                    <span className="flex h-[25px] items-center">
                      <span
                        className={`block rounded-full transition-all ${
                          i === aktif ? "size-[25px] bg-[rgba(122,83,177,0.7)] shadow-[0_2px_6px_rgba(122,83,177,0.4)]" : "size-[18px] bg-[#6A6E79]/60"
                        }`}
                      />
                    </span>
                    <span className={`whitespace-nowrap text-[17px] font-medium ${TEXT}`}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`relative mt-[28px] h-[145px] px-[12px] pt-[18px] ${BOX}`}>
              <p className={`text-[20px] font-semibold ${ACCENT_TEXT}`}>Nilai investasi saat ini</p>
              <p className={`mt-[10px] pl-[5px] text-[24px] font-semibold ${TEXT}`}>{rupiah(nilaiSekarang)}</p>
              <span className="absolute bottom-[27px] right-[19px] flex h-[61px] w-[100px] items-center justify-center rounded-[18px] bg-[rgba(122,83,177,0.7)] text-[20px] font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.15)]">
                {persen(persenAktif)}
              </span>
            </div>
            {errorMessage ? (
              <p role="alert" className="mt-2 text-[15px] text-[#B94A48]">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>

        <PurpleButton
          onClick={onLanjut}
          disabled={disabled || busy}
          className="absolute bottom-[11px] left-1/2 h-[61px] w-[295px] -translate-x-1/2 text-[20px]"
        >
          {busy ? "Memproses..." : "Lanjutkan"}
        </PurpleButton>
      </div>
    </div>
  );
}
