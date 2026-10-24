"use client";

import { useState } from "react";
import IncomeIdeas from "@/components/IncomeIdeas";
import { formatDigitsInput, formatRupiah } from "@/lib/format";
import { UNIT_LABEL, hitungCatatan } from "@/lib/saving-plan";
import { useHydrated } from "@/lib/use-hydrated";
import { DURASI_UNITS, FREKUENSI_UNITS, usePlanForm } from "@/lib/use-plan-form";
import { useDesktopScale } from "@/lib/use-viewport-size";

/*
 * Saran Income versi desktop (≥ lg) dari Figma 132:1324 dan 151:5587: form, ide tambahan
 * uang, dan catatan keuangan dalam satu area yang bisa di-scroll (Frame 6).
 */
const TEXT_GLOW = "[text-shadow:0_1px_3px_rgba(255,255,255,0.5)]";
const GLASS_SHADOW =
  "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_8px_30px_rgba(255,255,255,0.12),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2)]";
const FIELD = `rounded-[10px] border border-white/40 bg-[rgba(221,230,245,0.15)] backdrop-blur-[10px] ${GLASS_SHADOW}`;
const CARD =
  "relative rounded-[25px] border border-white bg-white/50 shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_0_4px_4px_rgba(154,168,189,0.2),inset_0_4px_4px_rgba(255,255,255,0.25)] backdrop-blur-[4px]";
const TITLE = "absolute whitespace-nowrap text-[30px] font-medium leading-normal text-[#6A6E79]/70";
const LABEL = "text-[20px] font-medium leading-normal text-[#6A6E79]/70";

function RupiahField({ label, value, onChange }) {
  return (
    <div>
      <p className={LABEL}>{label}</p>
      <label className={`relative mt-[3px] block h-[57px] w-[422px] ${FIELD}`}>
        <span className={`absolute left-[12px] top-1/2 w-[34px] -translate-y-1/2 text-center text-[20px] font-medium text-[#6A6E79]/70 ${TEXT_GLOW}`}>
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(formatDigitsInput(e.target.value))}
          placeholder="Jumlah"
          aria-label={label}
          className={`absolute inset-y-0 left-[56px] right-[10px] bg-transparent text-[24px] font-medium text-[#6A6E79] outline-none placeholder:text-[#6A6E79]/50 ${TEXT_GLOW}`}
        />
      </label>
    </div>
  );
}

// Posisi pill opsi di dalam segmented 318×59 (Figma "tahun" 151:5661).
const OPTION_LEFT = [5.65, 109, 212];

function UnitField({ label, count, onCountChange, units, unit, onUnitChange }) {
  return (
    <div>
      <p className={LABEL}>{label}</p>
      <div className="relative mt-[3px] h-[57px]">
        <input
          type="text"
          inputMode="numeric"
          value={count}
          onChange={(e) => onCountChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
          aria-label={`${label} (jumlah)`}
          className={`absolute left-0 top-0 h-[57px] w-[98px] text-center text-[24px] font-medium text-[#6A6E79] outline-none ${FIELD} ${TEXT_GLOW}`}
        />
        <div
          role="radiogroup"
          aria-label={`${label} (satuan)`}
          className={`absolute left-[108px] top-[-2px] h-[59px] w-[318px] rounded-[15px] border-[3px] border-white bg-[rgba(221,230,245,0.3)] backdrop-blur-[10px] ${GLASS_SHADOW}`}
        >
          {units.map((u, i) => (
            <button
              key={u.key}
              type="button"
              role="radio"
              aria-checked={unit === u.key}
              onClick={() => onUnitChange(u.key)}
              style={{ left: OPTION_LEFT[i] - 3 }}
              className={`absolute top-[3px] h-[47px] w-[100px] rounded-[10px] text-[24px] text-[#6A6E79]/70 transition active:scale-95 ${
                unit === u.key ? `border border-white bg-white/70 ${GLASS_SHADOW}` : ""
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ form, hydrated, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className={`${CARD} h-[488px]`}>
      <span
        aria-hidden="true"
        className="absolute left-[15.5px] top-[25.5px] size-[57px] bg-[url(/desktop-icon-rencana.svg)] bg-no-repeat"
      />
      <h2 className={`${TITLE} left-[97px] top-[25px]`}>Rencanakan Tabungan</h2>

      {/* Nonaktif sampai hydrate: ketikan sebelum itu akan hilang (lihat useHydrated). */}
      <fieldset
        disabled={!hydrated}
        className="absolute left-[24px] top-[107px] m-0 h-[365px] w-[475px] min-w-0 overflow-y-auto overflow-x-clip border-0 p-0"
      >
        <div className="flex flex-col gap-[13px] pt-px">
          <RupiahField label="Saya ingin menabung" value={form.tabungan} onChange={form.setTabungan} />
          <UnitField
            label="Dalam waktu"
            count={form.durasi}
            onCountChange={form.setDurasi}
            units={DURASI_UNITS}
            unit={form.durasiUnit}
            onUnitChange={form.setDurasiUnit}
          />
          <RupiahField label="Uang yang kamu terima" value={form.penerimaan} onChange={form.setPenerimaan} />
          <UnitField
            label="Diterima setiap"
            count={form.frekuensi}
            onCountChange={form.setFrekuensi}
            units={FREKUENSI_UNITS}
            unit={form.frekuensiUnit}
            onUnitChange={form.setFrekuensiUnit}
          />
        </div>

        <div className="mt-[23px] flex flex-col items-start pb-2 pl-[300px]">
          <button
            type="submit"
            className={`h-[48px] w-[126px] rounded-[10px] border border-white/40 bg-[rgba(221,230,245,0.15)] text-[24px] font-medium text-[#6A6E79]/70 backdrop-blur-[10px] transition ${GLASS_SHADOW} ${TEXT_GLOW} hover:bg-white/70 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_8px_-10px_8px_rgba(255,255,255,0.2),inset_-3px_2px_8px_rgba(0,0,0,0.15)] active:scale-95`}
          >
            Hitung
          </button>
        </div>
        {form.error && (
          <p role="alert" className="pb-2 text-right text-[13px] text-red-600">
            {form.error}
          </p>
        )}
      </fieldset>
    </form>
  );
}

function IdeasCard({ catatan }) {
  return (
    <section className={`${CARD} h-[488px]`}>
      <span
        aria-hidden="true"
        className="absolute left-[22px] top-[24px] h-[60.2482px] w-[54.211px] bg-[url(/desktop-icon-tambahan.svg)] bg-no-repeat"
      />
      <h2 className={`${TITLE} left-[90px] top-[28px]`}>Tambahan uang</h2>
      <div className={`absolute left-[32px] top-[106px] h-[365px] w-[456px] overflow-y-auto ${FIELD}`}>
        {catatan && <IncomeIdeas variant="desktop" gapPerBulan={catatan.kekuranganPerBulan} />}
      </div>
    </section>
  );
}

/* Ringkasan hitungan (sama dengan "Catatan keuangan" mobile) dalam tabel Keterangan | Nilai. */
function CatatanCard({ c }) {
  const datangTiap = `${c.frekuensi} ${UNIT_LABEL[c.frekuensiUnit]}`;
  const rows = [
    ["Target menabung", `Rp ${formatRupiah(c.tabungan)}`],
    ["Dalam waktu", `${c.durasi} ${UNIT_LABEL[c.durasiUnit]}`],
    ["Uang diterima", `Rp ${formatRupiah(c.penerimaan)} / ${datangTiap}`],
  ];
  if (c.kali > 0) {
    rows.push(["Total uang diterima", `Rp ${formatRupiah(c.totalMasuk)}`]);
    rows.push([`Sisihkan tiap ${datangTiap}`, `Rp ${formatRupiah(c.sisihkan)} (${c.persen}%)`, true]);
  }
  const message =
    c.kali === 0
      ? "Waktunya terlalu singkat untuk menerima uang. Coba perpanjang waktu menabungmu."
      : c.cukup
        ? "Uang yang kamu terima cukup untuk mencapai targetmu. Tetap konsisten ya!"
        : `Uangmu masih kurang Rp ${formatRupiah(c.kekurangan)}. Coba salah satu ide tambahan uang di atas.`;

  return (
    <section className={`${CARD} mx-auto mb-4 mt-[37px] min-h-[357px] w-[766px] pt-[13px]`}>
      <h2 className="text-center text-[32px] font-medium leading-normal text-[#6A6E79]/70">Catatan keuangan</h2>

      <div className="mx-[25px] mb-[19px] mt-[11px]">
        <div
          className={`flex h-[60px] items-center justify-between rounded-t-[10px] border border-white/40 bg-[rgba(221,230,245,0.4)] px-[39px] text-[20px] font-semibold text-[#6A6E79]/70 backdrop-blur-[10px] ${GLASS_SHADOW}`}
        >
          <span>Keterangan</span>
          <span>Nilai</span>
        </div>
        <div
          className={`min-h-[216px] rounded-b-[10px] border border-white/40 bg-[rgba(221,230,245,0.2)] backdrop-blur-[10px] ${GLASS_SHADOW}`}
        >
          {rows.map(([label, value, strong]) => (
            <div
              key={label}
              className={`flex min-h-[55px] items-center justify-between gap-4 border-b-2 border-white pl-[41px] pr-[39px] text-[24px] font-medium text-[#6A6E79]/70 ${TEXT_GLOW}`}
            >
              <span>{label}</span>
              <span className={`text-right tabular-nums ${strong ? "font-bold text-[#8A6FCF]" : ""}`}>{value}</span>
            </div>
          ))}
          <p className="px-[41px] py-[14px] text-[20px] leading-snug text-[#6A6E79]/70">{message}</p>
        </div>
      </div>
    </section>
  );
}

export default function DesktopIde() {
  const form = usePlanForm();
  const hydrated = useHydrated();
  // Desktop: hasil tampil di halaman yang sama, tanpa pindah ke /ide/rekomendasi.
  const [params, setParams] = useState(null);
  const catatan = params ? hitungCatatan(params) : null;
  // Isi kartu memakai ukuran px Figma; di bawah 1280px semuanya diperkecil proporsional.
  // Tinggi area scroll dihitung ulang karena ikut ter-zoom: tampil dari y=320 sampai 10px dari bawah.
  const { size, scale } = useDesktopScale();
  const height = size ? Math.max(360, (size.height - 330) / scale) : undefined;

  const handleSubmit = (e) => {
    e.preventDefault();
    form.submit(setParams);
  };

  return (
    // Area scroll memanjang sampai di belakang menu bawah, seperti Frame 6 di Figma (tinggi 502 pada 832):
    // -mb-[80px] menutup ruang menu dari layout supaya halaman sendiri tidak ikut ter-scroll.
    <div style={{ zoom: scale }} className="hidden px-[65px] lg:-mb-[80px] lg:-mt-[4px] lg:block">
      <div
        style={height ? { height } : undefined}
        className="h-[calc(100dvh-330px)] min-h-[360px] overflow-y-auto pb-[90px] scrollbar-glass"
      >
        <div className="grid grid-cols-2 gap-[116px]">
          <PlanCard form={form} hydrated={hydrated} onSubmit={handleSubmit} />
          <IdeasCard catatan={catatan} />
        </div>
        {catatan && <CatatanCard c={catatan} />}
      </div>
    </div>
  );
}
