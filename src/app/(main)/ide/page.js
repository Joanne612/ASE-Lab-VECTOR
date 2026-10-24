"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import DesktopIde from "@/components/ide/DesktopIde";
import { formatDigitsInput } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { DURASI_UNITS, FREKUENSI_UNITS, usePlanForm } from "@/lib/use-plan-form";

/* ---------- KOMPONEN FORM ---------- */

/* Input nominal Rupiah */
function RupiahField({ label, value, onChange }) {
  return (
    <div>
      <p className="px-4 text-[18px] font-medium text-[#8A8D99]">{label}</p>
      <label className="mt-3 flex h-[52px] items-center gap-3 rounded-xl border border-white/80 bg-white/30 px-4 shadow-[inset_0_2px_4px_rgba(120,100,160,0.12)]">
        <span className="text-[18px] font-semibold text-[#8A8D99]">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatDigitsInput(e.target.value))}
          placeholder="Jumlah"
          aria-label={label}
          className="min-w-0 flex-1 bg-transparent text-[18px] text-[#6A6E79] outline-none placeholder:text-[#A7A9B3]"
        />
      </label>
    </div>
  );
}

/* Input angka kecil + pilihan satuan (Bulan / Minggu / Tahun, dst.) */
function UnitField({ label, count, onCountChange, units, unit, onUnitChange }) {
  const handleCount = (e) => onCountChange(e.target.value.replace(/\D/g, "").slice(0, 3));

  return (
    <div>
      <p className="px-4 text-[18px] font-medium text-[#8A8D99]">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={count}
          onChange={handleCount}
          aria-label={`${label} (jumlah)`}
          className="h-[52px] w-[60px] shrink-0 rounded-xl border border-white/80 bg-white/30 text-center text-[18px] text-[#6A6E79] shadow-[inset_0_2px_4px_rgba(120,100,160,0.12)] outline-none"
        />

        <div
          role="radiogroup"
          aria-label={`${label} (satuan)`}
          className="grid h-[52px] min-w-0 flex-1 grid-cols-3 items-center rounded-xl border-2 border-white/90 bg-white/30 p-[3px] shadow-[0_4px_10px_rgba(120,100,160,0.12)]"
        >
          {units.map((u) => {
            const isActive = unit === u.key;
            return (
              <button
                key={u.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onUnitChange(u.key)}
                className={`h-full rounded-[9px] text-[16px] font-medium transition active:scale-95 ${
                  isActive
                    ? "border border-[#D7C5F5] bg-[#D7C5F5]/60 text-[#8A6FCF]"
                    : "text-[#8A8D99] hover:bg-white/50"
                }`}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* PANEL IDE */
export default function IdePage() {
  const router = useRouter();
  const hydrated = useHydrated();

  const {
    tabungan,
    setTabungan,
    durasi,
    setDurasi,
    durasiUnit,
    setDurasiUnit,
    penerimaan,
    setPenerimaan,
    frekuensi,
    setFrekuensi,
    frekuensiUnit,
    setFrekuensiUnit,
    error,
    submit,
  } = usePlanForm();

  const handleSubmit = (e) => {
    e.preventDefault();
    submit((params) => router.push(`/ide/rekomendasi?${params.toString()}`));
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-3 mb-8 mt-5 rounded-[28px] border border-white/70 bg-white/30 px-5 pb-8 pt-5 backdrop-blur-xl lg:hidden"
      >
        {/* Nonaktif sampai hydrate: ketikan sebelum itu akan hilang (lihat useHydrated). */}
        <fieldset disabled={!hydrated} className="m-0 min-w-0 border-0 p-0">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Kembali"
            className="flex h-8 w-8 items-center justify-center text-[#8A8D99] transition active:scale-90"
          >
            <Icon name="chevronLeft" className="h-6 w-6" />
          </button>

          <div className="mt-4 flex flex-col gap-6">
            <RupiahField label="Saya ingin menabung" value={tabungan} onChange={setTabungan} />

            <UnitField
              label="Dalam waktu"
              count={durasi}
              onCountChange={setDurasi}
              units={DURASI_UNITS}
              unit={durasiUnit}
              onUnitChange={setDurasiUnit}
            />

            <RupiahField label="Uang yang kamu terima" value={penerimaan} onChange={setPenerimaan} />

            <UnitField
              label="Diterima setiap"
              count={frekuensi}
              onCountChange={setFrekuensi}
              units={FREKUENSI_UNITS}
              unit={frekuensiUnit}
              onUnitChange={setFrekuensiUnit}
            />
          </div>

          {error && (
            <p role="alert" className="mt-6 px-1 text-center text-[14px] text-red-600">
              {error}
            </p>
          )}

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              className="h-[48px] w-[126px] rounded-xl border border-white/80 bg-white/40 text-[22px] font-medium text-[#8A8D99] shadow-[0_4px_12px_rgba(120,100,160,0.15)] backdrop-blur-md transition hover:bg-white/60 active:scale-95"
            >
              Hitung
            </button>
          </div>
        </fieldset>
      </form>

      <DesktopIde />
    </>
  );
}
