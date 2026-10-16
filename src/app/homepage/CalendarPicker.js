"use client";

import { useState } from "react";

const TABS = ["Harian", "Mingguan", "Bulanan", "Tahunan"];
const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

const GLASS =
  "border border-white/40 bg-[rgba(221,230,245,0.15)] backdrop-blur-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2),0_8px_30px_rgba(255,255,255,0.12)]";

const TAB_ACTIVE =
  "border border-white/50 bg-[rgba(221,230,245,0.15)] backdrop-blur-[10px] shadow-[inset_8px_-10px_8px_rgba(255,255,255,0.2),inset_-3px_7px_8px_rgba(0,0,0,0.15),0_8px_30px_rgba(255,255,255,0.12)]";

function Chevron({ direction }) {
  return (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" aria-hidden="true">
      <path
        d={direction === "right" ? "M9.29 18.58 15.48 12.39 9.29 6.19" : "M15.48 18.58 9.29 12.39 15.48 6.19"}
        stroke="#6A6E79"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavButton({ direction, label, onClick, className = "" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-[37px] w-[47px] items-center justify-center rounded-[10px] ${GLASS} ${className}`}
    >
      <Chevron direction={direction} />
    </button>
  );
}

function Calendar({ onConfirm }) {
  const [tab, setTab] = useState("Harian");
  const [view, setView] = useState({ year: 2026, month: 7 });
  const [selected, setSelected] = useState({ year: 2026, month: 7, day: 14 });

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shiftMonth = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const isWeekly = tab === "Mingguan";
  const isMonthly = tab === "Bulanan";
  const isYearly = tab === "Tahunan";

  const pickYear = (year) => {
    setView((v) => ({ ...v, year }));
    setSelected(({ month, day }) => ({
      year,
      month,
      day: Math.min(day, new Date(year, month + 1, 0).getDate()),
    }));
  };

  const pickMonth = (month) =>
    setSelected(({ day }) => ({
      year: view.year,
      month,
      day: Math.min(day, new Date(view.year, month + 1, 0).getDate()),
    }));

  const isSelected = (day) =>
    !isWeekly && day === selected.day && view.month === selected.month && view.year === selected.year;

  const weekBand =
    isWeekly && view.month === selected.month && view.year === selected.year
      ? (() => {
          const idx = firstWeekday + selected.day - 1;
          const row = Math.floor(idx / 7);
          const lastIdx = firstWeekday + daysInMonth - 1;
          const startCol = row === 0 ? firstWeekday : 0;
          const endCol = row === Math.floor(lastIdx / 7) ? lastIdx % 7 : 6;
          return { row, startCol, endCol };
        })()
      : null;

  return (
    <div className="relative h-[452px] w-[371px] max-w-[calc(100vw-24px)] rounded-[25px] border-2 border-white bg-white font-[Poppins,sans-serif] text-[#6A6E79] shadow-[0_8px_4px_rgba(255,255,255,0.12),inset_5px_4px_4px_rgba(154,168,189,0.2),inset_-5px_-4px_4px_rgba(154,168,189,0.2)] backdrop-blur-[4px]">
      {/* Tab: 4 kolom sama lebar, muat semua tanpa scroll */}
      <div className="absolute left-[14px] top-[11px] grid h-[57px] w-[343px] grid-cols-4 gap-[8px] pt-px">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`h-[48px] min-w-0 rounded-[15px] text-[14px] font-medium ${
              tab === t ? TAB_ACTIVE : GLASS
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isMonthly && (
        <>
          <div className="absolute left-0 top-[83px] flex w-full items-center justify-center">
            <NavButton
              direction="left"
              label="Tahun sebelumnya"
              onClick={() => setView((v) => ({ ...v, year: v.year - 1 }))}
            />
            <div
              className={`mx-[9px] flex h-[37px] w-[115px] items-center justify-center rounded-[10px] text-[16px] font-semibold ${GLASS}`}
            >
              {view.year}
            </div>
            <NavButton
              direction="right"
              label="Tahun berikutnya"
              onClick={() => setView((v) => ({ ...v, year: v.year + 1 }))}
            />
          </div>

          <div className="absolute left-[36px] top-[152px] grid w-[299px] grid-cols-3 gap-x-[20px] gap-y-[17px]">
            {MONTHS.map((m, i) => {
              const active = selected.year === view.year && selected.month === i;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => pickMonth(i)}
                  className={`h-[38px] rounded-[8px] text-[16px] ${GLASS} ${
                    active ? "font-semibold !bg-[rgba(235,207,255,0.7)]" : "font-medium"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </>
      )}

      {isYearly && (
        <div className="absolute left-[12px] top-[124px] grid w-[347px] grid-cols-4 gap-x-[11px] gap-y-[19px]">
          {YEARS.map((y) => {
            const active = selected.year === y;
            return (
              <button
                key={y}
                type="button"
                onClick={() => pickYear(y)}
                className={`h-[36px] w-[76px] rounded-[8px] text-[16px] ${GLASS} ${
                  active ? "font-semibold !bg-[rgba(235,207,255,0.7)]" : "font-medium"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {!isMonthly && !isYearly && (
      <>
      <div className="absolute left-0 top-[83px] flex w-full items-center px-[16px]">
        <NavButton direction="left" label="Tahun sebelumnya" onClick={() => shiftMonth(-12)} />
        <NavButton direction="left" label="Bulan sebelumnya" onClick={() => shiftMonth(-1)} className="ml-[9px]" />
        <div
          className={`ml-[9px] flex h-[37px] w-[115px] items-center justify-center rounded-[10px] text-[16px] font-semibold ${GLASS}`}
        >
          {MONTHS[view.month]} {view.year}
        </div>
        <NavButton direction="right" label="Bulan berikutnya" onClick={() => shiftMonth(1)} className="ml-[9px]" />
        <NavButton direction="right" label="Tahun berikutnya" onClick={() => shiftMonth(12)} className="ml-[9px]" />
      </div>

      <div className="absolute left-[9px] top-[121px] grid grid-cols-7 gap-x-[3px]">
        {DAYS.map((d) => (
          <div key={d} className="flex h-[32px] w-[48px] items-center justify-center text-[16px] font-medium">
            {d}
          </div>
        ))}
      </div>

      {weekBand && (
        <div
          className={`absolute h-[34px] rounded-[5px] ${GLASS} !bg-[rgba(235,207,255,0.7)]`}
          style={{
            left: 9 + weekBand.startCol * 51,
            width: (weekBand.endCol - weekBand.startCol) * 51 + 48,
            top: 173 + weekBand.row * 32,
          }}
        />
      )}

      <div className="absolute left-[9px] top-[174px] grid grid-cols-7 gap-x-[3px]">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`e${i}`} className="h-[32px] w-[48px]" />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => setSelected({ ...view, day })}
              className="flex h-[32px] w-[48px] items-center justify-center"
            >
              <span
                className={`flex h-[34px] w-[37px] items-center justify-center text-[16px] font-medium ${
                  isSelected(day) ? `rounded-[5px] ${GLASS} !bg-[rgba(235,207,255,0.7)]` : ""
                }`}
              >
                {day}
              </span>
            </button>
          )
        )}
      </div>

      </>
      )}

      {/* Dinaikkan dari 398px -> 382px supaya jarak ke tepi bawah lebih seimbang */}
      <button
        type="button"
        onClick={() => onConfirm(selected)}
        className={`absolute left-1/2 top-[382px] h-[38px] w-[134px] -translate-x-1/2 rounded-[10px] text-[18px] font-medium text-white ${GLASS} !bg-[rgba(122,83,177,0.7)]`}
      >
        Konfirmasi
      </button>
    </div>
  );
}

export default function CalendarPicker({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Pilih tanggal"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="block"
      >
        {children}
      </button>
      {open && (
        <div className="absolute -left-[6px] top-[96px] z-50">
          <Calendar onConfirm={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
