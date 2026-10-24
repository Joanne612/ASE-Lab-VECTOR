"use client";

import { ACCENT_TEXT, BOX, BOX_SM, CARD, PurpleButton, TEXT, ValueBox } from "@/components/simulasi/desktop-ui";

const rupiah = (n) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;
const PRESETS = [100000, 250000, 500000, 750000];

/**
 * Form nominal investasi versi desktop (Figma 519:5972 saham / 526:5149 reksa dana).
 * Kotak kanan (`summary`) diisi halaman: estimasi pembelian (saham) atau sisa saldo (reksa dana).
 */
export default function DesktopInvestForm({
  saldoVirtual,
  nominal,
  onNominal,
  summary,
  note,
  errorMessage,
  onSubmit,
  disabled,
  busy,
  loading,
}) {
  const nominalAngka = Number(nominal || 0);

  return (
    <div className="hidden justify-center px-4 lg:flex">
      <div className={`relative h-[430px] w-[1159px] px-[28px] pt-[22px] ${CARD}`}>
        <div className="grid grid-cols-[459px_1fr] gap-x-[170px]">
          <section>
            <h1 className={`text-[32px] font-medium leading-tight ${TEXT}`}>Berapa banyak yang ingin kamu investasikan?</h1>
            <ValueBox label="Saldo Virtual" value={rupiah(saldoVirtual)} className="mt-[17px] h-[94px]" />

            <label htmlFor="nominal-desktop" className={`mt-[21px] block text-[20px] font-medium ${TEXT}`}>
              Nominal Investasi
            </label>
            <div className={`mt-[7px] flex h-[81px] items-center gap-3 px-[16px] ${BOX}`}>
              <span className={`text-[30px] font-medium ${TEXT}`}>Rp</span>
              <input
                id="nominal-desktop"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={nominal ? nominalAngka.toLocaleString("id-ID") : ""}
                onChange={(e) => onNominal(e.target.value.replace(/\D/g, "").replace(/^0+/, ""))}
                className={`min-w-0 flex-1 bg-transparent text-[32px] font-semibold outline-none ${TEXT}`}
              />
            </div>
          </section>

          <section className="-ml-[141px] pt-[8px]">
            <div className="grid grid-cols-4 gap-[14px]">
              {PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={nominalAngka === n}
                  onClick={() => onNominal(String(n))}
                  className={`h-[62px] text-[16px] font-medium text-[#6A6E79] [text-shadow:0_2px_8px_rgba(0,0,0,0.15)] transition active:scale-95 ${BOX_SM} ${
                    nominalAngka === n ? "!bg-[rgba(169,139,224,0.55)] text-white" : "hover:bg-white/50"
                  }`}
                >
                  {rupiah(n)}
                </button>
              ))}
            </div>

            <div className={`mt-[16px] ${BOX_SM} rounded-[8px] px-[18px] pb-[18px] pt-[17px]`}>{summary}</div>
            {note ? <p className={`mt-[14px] text-[16px] leading-snug ${TEXT}`}>{note}</p> : null}
            {errorMessage ? (
              <p role="alert" className="mt-2 text-[15px] text-[#B94A48]">
                {errorMessage}
              </p>
            ) : null}
          </section>
        </div>

        <PurpleButton
          onClick={onSubmit}
          disabled={disabled || busy}
          className="absolute bottom-[11px] left-1/2 h-[61px] w-[295px] -translate-x-1/2 text-[20px]"
        >
          {busy ? "Memproses..." : loading ? "Memuat..." : "Investasi Sekarang"}
        </PurpleButton>
      </div>
    </div>
  );
}

/** Baris estimasi: label kiri, nilai tebal + satuan kecil di kanan. */
export function EstimateRow({ label, value, unit }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className={`text-[20px] font-medium ${TEXT}`}>{label}</dt>
      <dd className={TEXT}>
        <span className="text-[24px] font-semibold">{value}</span>
        {unit ? <span className="ml-1 text-[20px]">{unit}</span> : null}
      </dd>
    </div>
  );
}

export const SummaryTitle = ({ children }) => (
  <h2 className={`text-[20px] font-semibold ${ACCENT_TEXT}`}>{children}</h2>
);
